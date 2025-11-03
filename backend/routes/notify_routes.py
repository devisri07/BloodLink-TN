from flask import Blueprint, request, jsonify
from models import db, Donor, Request
from routes.auth_routes import token_required
from config import Config
import os

notify_bp = Blueprint('notify', __name__)

# Initialize Twilio client if credentials are available
try:
    from twilio.rest import Client
    twilio_client = None
    if Config.TWILIO_ACCOUNT_SID and Config.TWILIO_AUTH_TOKEN:
        twilio_client = Client(Config.TWILIO_ACCOUNT_SID, Config.TWILIO_AUTH_TOKEN)
except ImportError:
    twilio_client = None
    print("Twilio not installed. SMS notifications will be disabled.")


def send_sms(to_phone, message):
    """Send SMS via Twilio"""
    if not twilio_client or not Config.TWILIO_PHONE_NUMBER:
        print(f"[SMS Mock] To: {to_phone}, Message: {message}")
        return {'success': False, 'message': 'SMS service not configured'}
    
    try:
        message_obj = twilio_client.messages.create(
            body=message,
            from_=Config.TWILIO_PHONE_NUMBER,
            to=to_phone
        )
        return {'success': True, 'sid': message_obj.sid}
    except Exception as e:
        print(f"SMS sending failed: {str(e)}")
        return {'success': False, 'message': str(e)}


@notify_bp.route('/request-donors', methods=['POST'])
@token_required
def notify_donors_for_request(current_user):
    """Notify matching donors when a new blood request is created"""
    data = request.get_json()
    
    request_id = data.get('request_id')
    if not request_id:
        return jsonify({'message': 'request_id is required'}), 400
    
    blood_request = Request.query.get(request_id)
    if not blood_request:
        return jsonify({'message': 'Request not found'}), 404
    
    # Find matching donors
    matching_donors = Donor.query.filter_by(
        blood_group=blood_request.blood_group,
        district=blood_request.district,
        is_available=True
    ).all()
    
    if not matching_donors:
        return jsonify({
            'message': 'No matching donors found',
            'notifications_sent': 0
        }), 200
    
    # Prepare notification message
    urgency_text = {
        'normal': 'Blood',
        'urgent': 'URGENT Blood',
        'critical': 'CRITICAL Blood'
    }
    
    message = (
        f"{urgency_text.get(blood_request.urgency, 'Blood')} needed: "
        f"{blood_request.blood_group} required at {blood_request.hospital}, "
        f"{blood_request.district}. Contact: {blood_request.requester_name} - {blood_request.phone}. "
        f"From BloodLink TN"
    )
    
    # Send notifications
    notifications = []
    success_count = 0
    
    for donor in matching_donors:
        result = send_sms(donor.phone, message)
        notifications.append({
            'donor_id': donor.id,
            'donor_name': donor.name,
            'phone': donor.phone,
            'success': result['success']
        })
        if result['success']:
            success_count += 1
    
    return jsonify({
        'message': f'Notifications sent to {success_count} out of {len(matching_donors)} donors',
        'notifications': notifications,
        'notifications_sent': success_count,
        'total_donors': len(matching_donors)
    }), 200


@notify_bp.route('/contact-donor', methods=['POST'])
@token_required
def contact_donor(current_user):
    """Contact a specific donor (can trigger SMS or just return contact info)"""
    data = request.get_json()
    
    donor_id = data.get('donor_id')
    message = data.get('message', '')
    
    if not donor_id:
        return jsonify({'message': 'donor_id is required'}), 400
    
    donor = Donor.query.get(donor_id)
    if not donor:
        return jsonify({'message': 'Donor not found'}), 404
    
    if not donor.is_available:
        return jsonify({'message': 'Donor is no longer available'}), 400
    
    # If custom message provided, send SMS
    if message:
        custom_message = (
            f"BloodLink TN: {message} "
            f"Requester contact: {current_user.phone}"
        )
        result = send_sms(donor.phone, custom_message)
        
        return jsonify({
            'message': 'Contact request sent',
            'donor': donor.to_dict(),
            'sms_sent': result['success']
        }), 200
    else:
        # Just return donor contact information
        return jsonify({
            'message': 'Donor contact information',
            'donor': donor.to_dict()
        }), 200


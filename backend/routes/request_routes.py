from flask import Blueprint, request, jsonify
from models import db, Request, Donor
from routes.auth_routes import token_required
from datetime import datetime

request_bp = Blueprint('request', __name__)


@request_bp.route('/create', methods=['POST'])
@token_required
def create_request(current_user):
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['requester_name', 'blood_group', 'district', 'hospital', 'phone']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'{field} is required'}), 400
    
    # Create blood request
    blood_request = Request(
        user_id=current_user.id,
        requester_name=data['requester_name'],
        blood_group=data['blood_group'],
        district=data['district'],
        hospital=data['hospital'],
        phone=data['phone'],
        urgency=data.get('urgency', 'normal')
    )
    
    try:
        db.session.add(blood_request)
        db.session.commit()
        
        # Find matching donors
        matching_donors = Donor.query.filter_by(
            blood_group=blood_request.blood_group,
            district=blood_request.district,
            is_available=True
        ).all()
        
        return jsonify({
            'message': 'Blood request created successfully',
            'request': blood_request.to_dict(),
            'matching_donors_count': len(matching_donors)
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Request creation failed: {str(e)}'}), 500


@request_bp.route('/all', methods=['GET'])
def get_all_requests():
    """Get all blood requests"""
    status = request.args.get('status')
    district = request.args.get('district')
    blood_group = request.args.get('blood_group')
    
    query = Request.query
    
    if status:
        query = query.filter_by(status=status)
    
    if district:
        query = query.filter_by(district=district)
    
    if blood_group:
        query = query.filter_by(blood_group=blood_group)
    
    requests = query.order_by(Request.created_at.desc()).all()
    
    return jsonify({
        'requests': [req.to_dict() for req in requests],
        'count': len(requests)
    }), 200


@request_bp.route('/my-requests', methods=['GET'])
@token_required
def get_my_requests(current_user):
    requests = Request.query.filter_by(user_id=current_user.id).order_by(Request.created_at.desc()).all()
    
    return jsonify({
        'requests': [req.to_dict() for req in requests],
        'count': len(requests)
    }), 200


@request_bp.route('/<int:request_id>/fulfill', methods=['POST'])
@token_required
def fulfill_request(current_user, request_id):
    blood_request = Request.query.get_or_404(request_id)
    
    if blood_request.status == 'fulfilled':
        return jsonify({'message': 'Request already fulfilled'}), 400
    
    blood_request.status = 'fulfilled'
    blood_request.fulfilled_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({'message': 'Request marked as fulfilled', 'request': blood_request.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Update failed: {str(e)}'}), 500


@request_bp.route('/<int:request_id>', methods=['GET'])
def get_request(request_id):
    blood_request = Request.query.get_or_404(request_id)
    return jsonify({'request': blood_request.to_dict()}), 200


@request_bp.route('/<int:request_id>/match-donors', methods=['GET'])
def get_matching_donors(request_id):
    """Get matching donors for a specific request"""
    blood_request = Request.query.get_or_404(request_id)
    
    matching_donors = Donor.query.filter_by(
        blood_group=blood_request.blood_group,
        district=blood_request.district,
        is_available=True
    ).all()
    
    return jsonify({
        'request': blood_request.to_dict(),
        'matching_donors': [donor.to_dict() for donor in matching_donors],
        'count': len(matching_donors)
    }), 200


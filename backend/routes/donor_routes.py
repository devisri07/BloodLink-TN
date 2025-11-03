from flask import Blueprint, request, jsonify
from models import db, Donor
from routes.auth_routes import token_required
from datetime import datetime, timedelta

donor_bp = Blueprint('donor', __name__)


@donor_bp.route('/register', methods=['POST'])
@token_required
def register_donor(current_user):
    if current_user.user_type != 'donor':
        return jsonify({'message': 'Only donors can register as donors'}), 403
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['name', 'blood_group', 'phone', 'district', 'hospital']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'{field} is required'}), 400
    
    # Check if user already has a donor profile
    existing_donor = Donor.query.filter_by(user_id=current_user.id).first()
    
    if existing_donor:
        # Update existing donor
        existing_donor.name = data['name']
        existing_donor.blood_group = data['blood_group']
        existing_donor.phone = data['phone']
        existing_donor.district = data['district']
        existing_donor.hospital = data['hospital']
        existing_donor.latitude = data.get('latitude')
        existing_donor.longitude = data.get('longitude')
        existing_donor.is_available = True
        existing_donor.registered_at = datetime.utcnow()
        existing_donor.auto_remove_date = datetime.utcnow() + timedelta(days=14)
        
        try:
            db.session.commit()
            return jsonify({
                'message': 'Donor profile updated successfully',
                'donor': existing_donor.to_dict()
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': f'Update failed: {str(e)}'}), 500
    else:
        # Create new donor
        donor = Donor(
            user_id=current_user.id,
            name=data['name'],
            blood_group=data['blood_group'],
            phone=data['phone'],
            district=data['district'],
            hospital=data['hospital'],
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            is_available=True,
            registered_at=datetime.utcnow(),
            auto_remove_date=datetime.utcnow() + timedelta(days=14)
        )
        
        try:
            db.session.add(donor)
            db.session.commit()
            return jsonify({
                'message': 'Donor registered successfully',
                'donor': donor.to_dict()
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': f'Registration failed: {str(e)}'}), 500


@donor_bp.route('/all', methods=['GET'])
def get_all_donors():
    """Get all available donors (public endpoint)"""
    available_only = request.args.get('available_only', 'true').lower() == 'true'
    blood_group = request.args.get('blood_group')
    district = request.args.get('district')
    
    query = Donor.query
    
    if available_only:
        query = query.filter_by(is_available=True)
    
    # Filter by blood group if provided
    if blood_group:
        query = query.filter_by(blood_group=blood_group)
    
    # Filter by district if provided
    if district:
        query = query.filter_by(district=district)
    
    donors = query.all()
    
    return jsonify({
        'donors': [donor.to_dict() for donor in donors],
        'count': len(donors)
    }), 200


@donor_bp.route('/map', methods=['GET'])
def get_donors_for_map():
    """Get available donors with location for map display"""
    blood_group = request.args.get('blood_group')
    district = request.args.get('district')
    
    query = Donor.query.filter_by(is_available=True)
    query = query.filter(Donor.latitude.isnot(None), Donor.longitude.isnot(None))
    
    if blood_group:
        query = query.filter_by(blood_group=blood_group)
    
    if district:
        query = query.filter_by(district=district)
    
    donors = query.all()
    
    return jsonify({
        'donors': [donor.to_dict() for donor in donors],
        'count': len(donors)
    }), 200


@donor_bp.route('/my-profile', methods=['GET'])
@token_required
def get_my_donor_profile(current_user):
    donor = Donor.query.filter_by(user_id=current_user.id).first()
    
    if not donor:
        return jsonify({'message': 'Donor profile not found'}), 404
    
    return jsonify({'donor': donor.to_dict()}), 200


@donor_bp.route('/deactivate', methods=['POST'])
@token_required
def deactivate_donor(current_user):
    donor = Donor.query.filter_by(user_id=current_user.id).first()
    
    if not donor:
        return jsonify({'message': 'Donor profile not found'}), 404
    
    donor.is_available = False
    try:
        db.session.commit()
        return jsonify({'message': 'Donor profile deactivated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Deactivation failed: {str(e)}'}), 500


@donor_bp.route('/<int:donor_id>', methods=['GET'])
def get_donor(donor_id):
    donor = Donor.query.get_or_404(donor_id)
    return jsonify({'donor': donor.to_dict()}), 200


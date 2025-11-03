from flask import Blueprint, request, jsonify
from models import db, Hospital
import json
import os

hospital_bp = Blueprint('hospital', __name__)

# Tamil Nadu districts
TN_DISTRICTS = [
    "Ariyalur", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri",
    "Dindigul", "Erode", "Kanchipuram", "Kanyakumari", "Karur",
    "Krishnagiri", "Madurai", "Nagapattinam", "Namakkal", "Nilgiris",
    "Perambalur", "Pudukkottai", "Ramanathapuram", "Salem", "Sivaganga",
    "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
    "Tirupur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore",
    "Viluppuram", "Virudhunagar"
]


@hospital_bp.route('/districts', methods=['GET'])
def get_districts():
    """Get all Tamil Nadu districts"""
    return jsonify({'districts': TN_DISTRICTS}), 200


@hospital_bp.route('/<district>', methods=['GET'])
def get_hospitals_by_district(district):
    """Get hospitals for a specific district"""
    # Try to load from JSON file first
    json_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'hospitals.json')
    
    hospitals_list = []
    
    # Check if JSON file exists
    if os.path.exists(json_path):
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                hospitals_data = json.load(f)
                if district in hospitals_data:
                    hospitals_list = [
                        {'name': name, 'district': district}
                        for name in hospitals_data[district]
                    ]
        except Exception as e:
            print(f"Error reading hospitals.json: {str(e)}")
    
    # Also check database
    db_hospitals = Hospital.query.filter_by(district=district).all()
    hospitals_list.extend([h.to_dict() for h in db_hospitals])
    
    # Remove duplicates
    seen = set()
    unique_hospitals = []
    for h in hospitals_list:
        name = h['name']
        if name not in seen:
            seen.add(name)
            unique_hospitals.append(h)
    
    return jsonify({
        'district': district,
        'hospitals': unique_hospitals,
        'count': len(unique_hospitals)
    }), 200


@hospital_bp.route('/all', methods=['GET'])
def get_all_hospitals():
    """Get all hospitals"""
    hospitals = Hospital.query.all()
    
    # Also load from JSON
    json_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'hospitals.json')
    json_hospitals = {}
    
    if os.path.exists(json_path):
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                json_hospitals = json.load(f)
        except Exception:
            pass
    
    # Combine results
    result = {h.to_dict()['district']: [] for h in hospitals}
    for h in hospitals:
        result[h.district].append(h.to_dict())
    
    # Add JSON hospitals
    for district, names in json_hospitals.items():
        if district not in result:
            result[district] = []
        for name in names:
            result[district].append({'name': name, 'district': district})
    
    return jsonify({'hospitals': result}), 200


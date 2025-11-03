from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    user_type = db.Column(db.String(20), nullable=False)  # 'donor' or 'requester'
    phone = db.Column(db.String(15), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'user_type': self.user_type,
            'phone': self.phone
        }


class Donor(db.Model):
    __tablename__ = 'donors'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    blood_group = db.Column(db.String(5), nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    district = db.Column(db.String(100), nullable=False)
    hospital = db.Column(db.String(150), nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    is_available = db.Column(db.Boolean, default=True)
    registered_at = db.Column(db.DateTime, default=datetime.utcnow)
    auto_remove_date = db.Column(db.DateTime, default=lambda: datetime.utcnow() + timedelta(days=14))
    
    user = db.relationship('User', backref='donor_profile')
    
    def check_expiry(self):
        if datetime.utcnow() > self.auto_remove_date:
            self.is_available = False
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'blood_group': self.blood_group,
            'phone': self.phone,
            'district': self.district,
            'hospital': self.hospital,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'is_available': self.is_available,
            'registered_at': self.registered_at.isoformat() if self.registered_at else None,
            'auto_remove_date': self.auto_remove_date.isoformat() if self.auto_remove_date else None
        }


class Request(db.Model):
    __tablename__ = 'requests'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    requester_name = db.Column(db.String(100), nullable=False)
    blood_group = db.Column(db.String(5), nullable=False)
    district = db.Column(db.String(100), nullable=False)
    hospital = db.Column(db.String(150), nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    urgency = db.Column(db.String(20), default='normal')  # 'normal', 'urgent', 'critical'
    status = db.Column(db.String(20), default='pending')  # 'pending', 'fulfilled', 'cancelled'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    fulfilled_at = db.Column(db.DateTime, nullable=True)
    
    user = db.relationship('User', backref='requests')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'requester_name': self.requester_name,
            'blood_group': self.blood_group,
            'district': self.district,
            'hospital': self.hospital,
            'phone': self.phone,
            'urgency': self.urgency,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'fulfilled_at': self.fulfilled_at.isoformat() if self.fulfilled_at else None
        }


class Hospital(db.Model):
    __tablename__ = 'hospitals'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    district = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(255), nullable=True)
    contact = db.Column(db.String(20), nullable=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'district': self.district,
            'address': self.address,
            'contact': self.contact,
            'latitude': self.latitude,
            'longitude': self.longitude
        }


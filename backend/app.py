from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
from config import Config
from models import db, Donor
import atexit

app = Flask(__name__)
app.config.from_object(Config)

# Configure SQLAlchemy engine options for MySQL
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = Config.SQLALCHEMY_ENGINE_OPTIONS

# Enable CORS for React frontend
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Initialize database
db.init_app(app)
migrate = Migrate(app, db)

# Import routes
from routes.auth_routes import auth_bp
from routes.donor_routes import donor_bp
from routes.request_routes import request_bp
from routes.notify_routes import notify_bp
from routes.hospital_routes import hospital_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(donor_bp, url_prefix='/api/donors')
app.register_blueprint(request_bp, url_prefix='/api/requests')
app.register_blueprint(notify_bp, url_prefix='/api/notify')
app.register_blueprint(hospital_bp, url_prefix='/api/hospitals')


def remove_expired_donors():
    """Remove expired donors (mark as unavailable after 14 days)"""
    with app.app_context():
        expired_donors = Donor.query.filter(
            Donor.auto_remove_date < datetime.utcnow(),
            Donor.is_available == True
        ).all()
        
        for donor in expired_donors:
            donor.is_available = False
        
        db.session.commit()
        print(f"Marked {len(expired_donors)} expired donors as unavailable")


# Setup scheduler to run every 12 hours
scheduler = BackgroundScheduler()
scheduler.add_job(remove_expired_donors, 'interval', hours=12, id='remove_expired_donors')
scheduler.start()

# Shut down scheduler when app exits
atexit.register(lambda: scheduler.shutdown())


@app.route('/api/health', methods=['GET'])
def health_check():
    return {'status': 'ok', 'message': 'BloodLink TN API is running'}


@app.route('/api/dashboard/stats', methods=['GET'])
def dashboard_stats():
    """Get dashboard statistics"""
    from models import User, Request
    
    total_donors = Donor.query.count()
    available_donors = Donor.query.filter_by(is_available=True).count()
    total_requests = Request.query.count()
    fulfilled_requests = Request.query.filter_by(status='fulfilled').count()
    
    return {
        'total_donors': total_donors,
        'available_donors': available_donors,
        'total_requests': total_requests,
        'fulfilled_requests': fulfilled_requests
    }


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    app.run(debug=True, host='0.0.0.0', port=5000)



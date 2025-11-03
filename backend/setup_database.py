"""
Database setup script for BloodLink TN
- Connects to MySQL
- Creates database if not exists
- Creates all tables
- Populates Tamil Nadu districts (through hospitals)
- Populates 400+ hospitals with addresses and contact numbers
"""
import pymysql
from app import app, db
from models import User, Donor, Request, Hospital
from config import Config
from data.hospitals_data import HOSPITALS_DATA, TAMIL_NADU_DISTRICTS
import sys


def create_database_if_not_exists():
    """Create database if it doesn't exist"""
    try:
        # Connect without database to create it
        connection = pymysql.connect(
            host=Config.MYSQL_HOST,
            port=int(Config.MYSQL_PORT),
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            charset='utf8mb4'
        )
        
        with connection.cursor() as cursor:
            # Create database if not exists
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {Config.MYSQL_DATABASE} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
            print(f"✅ Database '{Config.MYSQL_DATABASE}' ready")
        
        connection.close()
        return True
    except Exception as e:
        print(f"❌ Error creating database: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Ensure MySQL is running")
        print("2. Check MySQL user and password in .env file")
        print("3. Verify MySQL credentials are correct")
        return False


def setup_database():
    """Initialize database and create all tables"""
    print("=" * 60)
    print("BloodLink TN - Database Setup")
    print("=" * 60)
    
    # Step 1: Create database if not exists
    print("\n[1/4] Creating database if not exists...")
    if not create_database_if_not_exists():
        sys.exit(1)
    
    # Step 2: Create tables
    print("\n[2/4] Creating database tables...")
    try:
        with app.app_context():
            db.create_all()
            print("✅ Created tables: users, donors, requests, hospitals")
    except Exception as e:
        print(f"❌ Error creating tables: {str(e)}")
        sys.exit(1)
    
    # Step 3: Populate hospitals
    print("\n[3/4] Populating Tamil Nadu hospitals...")
    try:
        with app.app_context():
            # Count existing hospitals
            existing_count = Hospital.query.count()
            
            if existing_count > 0:
                print(f"⚠️  Found {existing_count} existing hospitals in database")
                response = input("Do you want to clear and repopulate? (y/n): ").strip().lower()
                if response == 'y':
                    Hospital.query.delete()
                    db.session.commit()
                    print("✅ Cleared existing hospitals")
                else:
                    print("⏭️  Skipping hospital population (keeping existing data)")
                    print("\n✅ Database setup complete!")
                    print(f"   - {len(TAMIL_NADU_DISTRICTS)} Tamil Nadu districts covered")
                    print(f"   - {existing_count} hospitals in database")
                    return
            
            # Insert hospitals
            total_hospitals = 0
            districts_covered = set()
            
            for district, hospitals in HOSPITALS_DATA.items():
                districts_covered.add(district)
                for name, address, contact in hospitals:
                    hospital = Hospital(
                        name=name,
                        district=district,
                        address=address,
                        contact=contact
                    )
                    db.session.add(hospital)
                    total_hospitals += 1
            
            db.session.commit()
            
            print(f"✅ Inserted {total_hospitals} hospitals")
            print(f"✅ Covered {len(districts_covered)} districts")
            
    except Exception as e:
        print(f"❌ Error populating hospitals: {str(e)}")
        db.session.rollback()
        sys.exit(1)
    
    # Step 4: Verification
    print("\n[4/4] Verifying database setup...")
    try:
        with app.app_context():
            users_count = User.query.count()
            donors_count = Donor.query.count()
            requests_count = Request.query.count()
            hospitals_count = Hospital.query.count()
            
            # Get unique districts from hospitals
            districts_in_db = db.session.query(Hospital.district).distinct().count()
            
            print(f"✅ Users table: {users_count} records")
            print(f"✅ Donors table: {donors_count} records")
            print(f"✅ Requests table: {requests_count} records")
            print(f"✅ Hospitals table: {hospitals_count} records")
            print(f"✅ Districts covered: {districts_in_db} districts")
            
    except Exception as e:
        print(f"⚠️  Warning during verification: {str(e)}")
    
    # Final summary
    print("\n" + "=" * 60)
    print("✅ Database setup complete with Tamil Nadu districts and hospitals")
    print("=" * 60)
    print(f"\n📊 Summary:")
    print(f"   - Database: {Config.MYSQL_DATABASE}")
    print(f"   - Tables created: users, donors, requests, hospitals")
    print(f"   - Tamil Nadu districts: {len(TAMIL_NADU_DISTRICTS)}")
    print(f"   - Hospitals populated: {total_hospitals}")
    print(f"\n🚀 Next steps:")
    print("   1. Start Flask server: flask run")
    print("   2. Access API at: http://localhost:5000")
    print("   3. Test connection: http://localhost:5000/api/health")
    print("=" * 60)


if __name__ == '__main__':
    setup_database()

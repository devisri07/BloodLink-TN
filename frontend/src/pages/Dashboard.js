import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../api/Api';
import { 
  FaHeart, 
  FaMapMarkerAlt, 
  FaClock, 
  FaMap, 
  FaShieldAlt, 
  FaDatabase,
  FaUserMd,
  FaSearch,
  FaBell,
  FaHandHoldingHeart
} from 'react-icons/fa';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    total_donors: 0,
    available_donors: 0,
    total_requests: 0,
    fulfilled_requests: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Dashboard - Welcome, {user.username}!</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.total_donors}</h3>
          <p>Total Donors</p>
        </div>
        <div className="stat-card">
          <h3>{stats.available_donors}</h3>
          <p>Available Donors</p>
        </div>
        <div className="stat-card">
          <h3>{stats.total_requests}</h3>
          <p>Total Requests</p>
        </div>
        <div className="stat-card">
          <h3>{stats.fulfilled_requests}</h3>
          <p>Fulfilled Requests</p>
        </div>
      </div>

      <div className="card">
        <h2>Quick Actions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          {user.user_type === 'donor' && (
            <Link to="/donor/register" className="btn btn-primary">
              Register/Update Donor Profile
            </Link>
          )}
          {user.user_type === 'requester' && (
            <>
              <Link to="/request/blood" className="btn btn-primary">
                Request Blood
              </Link>
              <Link to="/my-requests" className="btn btn-secondary">
                View My Requests
              </Link>
            </>
          )}
          <Link to="/donors/map" className="btn btn-success">
            Find Donors on Map
          </Link>
        </div>
      </div>

      <div className="card">
        <h2>About BloodLink TN</h2>
        <p>
          BloodLink TN is a dedicated blood donation management platform for Tamil Nadu. 
          Donors can register and automatically appear on the map for 14 days. 
          Requesters can search for available donors by blood group and location, 
          and contact them directly through phone or SMS.
        </p>
        <ul style={{ marginTop: '15px', marginLeft: '20px' }}>
          <li>All donors are automatically removed after 14 days</li>
          <li>Real-time map showing available donors</li>
          <li>SMS notifications for urgent requests</li>
          <li>Coverage across all 38 Tamil Nadu districts</li>
        </ul>
      </div>

      {/* App Features & How to Use Section */}
      <section id="app-features" className="features-section">
        <div className="features-container">
          <h2 className="features-title">🩸 App Features & How to Use BloodLink</h2>
          
          {/* App Features */}
          <div className="features-subsection">
            <h3 className="subsection-title">🩸 App Features</h3>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <FaHeart />
                </div>
                <h4>Smart Donor Matching</h4>
                <p>Instantly connects blood requesters and donors based on blood group and nearby hospital.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <FaMapMarkerAlt />
                </div>
                <h4>Tamil Nadu Coverage</h4>
                <p>Includes all 38 districts and over 400 hospitals.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <FaClock />
                </div>
                <h4>Real-time Availability</h4>
                <p>Donors are auto-removed after 14 days of donation.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <FaMap />
                </div>
                <h4>Google Maps Integration</h4>
                <p>Displays nearest hospitals and donors.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <FaShieldAlt />
                </div>
                <h4>Admin Panel</h4>
                <p>Verifies donor authenticity and manages requests.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <FaDatabase />
                </div>
                <h4>Secure Data Storage</h4>
                <p>All donor and patient info stored safely in MySQL.</p>
              </div>
            </div>
          </div>

          {/* How to Use */}
          <div className="features-subsection">
            <h3 className="subsection-title">💡 How to Use BloodLink</h3>
            
            {/* For Donors */}
            <div className="usage-card">
              <div className="usage-header">
                <FaUserMd className="usage-icon" />
                <h4>👨‍⚕️ For Donors:</h4>
              </div>
              <ul className="usage-list">
                <li>Click "Register as Donor".</li>
                <li>Fill in your details (Name, Blood Group, District, Hospital).</li>
                <li>Once registered, you'll appear on the "Available Donors" list.</li>
                <li>You can update or delete your availability anytime.</li>
                <li>Records automatically expire after 2 weeks.</li>
              </ul>
            </div>

            {/* For Requesters */}
            <div className="usage-card">
              <div className="usage-header">
                <FaSearch className="usage-icon" />
                <h4>🩸 For Requesters:</h4>
              </div>
              <ul className="usage-list">
                <li>Go to "Find Donor".</li>
                <li>Select your blood group and district.</li>
                <li>Get a list of matching donors instantly.</li>
                <li>Contact them directly via phone or SMS.</li>
              </ul>
            </div>

            {/* Google Maps Feature */}
            <div className="usage-card">
              <div className="usage-header">
                <FaMap className="usage-icon" />
                <h4>🗺️ Google Maps Feature:</h4>
              </div>
              <ul className="usage-list">
                <li>View nearby hospitals and donors.</li>
                <li>Click on map markers for details and directions.</li>
              </ul>
            </div>

            {/* Notifications */}
            <div className="usage-card">
              <div className="usage-header">
                <FaBell className="usage-icon" />
                <h4>🔔 Notifications:</h4>
              </div>
              <ul className="usage-list">
                <li>Donors get "Ready to Donate" reminders.</li>
                <li>Requesters get alerts when new matching donors appear.</li>
              </ul>
            </div>

            {/* Purpose */}
            <div className="purpose-card">
              <FaHandHoldingHeart className="purpose-icon" />
              <h4>❤️ Purpose:</h4>
              <p>BloodLink's mission is to save lives by making blood donation accessible, quick, and reliable across Tamil Nadu. Every donor registration and every fulfilled request brings us one step closer to ensuring no one waits for blood when they need it most.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;


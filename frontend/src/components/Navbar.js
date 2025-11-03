import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          🩸 BloodLink TN
        </Link>
        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/donors/map">Find Donors</Link>
              {user.user_type === 'donor' && (
                <Link to="/donor/register">Register as Donor</Link>
              )}
              {user.user_type === 'requester' && (
                <>
                  <Link to="/request/blood">Request Blood</Link>
                  <Link to="/my-requests">My Requests</Link>
                </>
              )}
              <span>Hello, {user.username}</span>
              <button onClick={onLogout} className="btn-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
              <Link to="/donors/map">Find Donors</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


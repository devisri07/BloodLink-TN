import React from "react";
import { Link } from "react-router-dom";
import { FaSearchLocation, FaHandshake, FaMapMarkerAlt } from "react-icons/fa";
import "./About.css";

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="hero">
        <h1>Welcome to <span>BloodLink TN</span></h1>
        <p>
          BloodLink TN is a community-driven platform that connects blood donors and recipients across Tamil Nadu —
          making the donation process faster, easier, and life-saving.
        </p>
        <div className="hero-buttons">
          <Link to="/donor/register" className="btn btn-primary">Become a Donor</Link>
          <Link to="/donors/map" className="btn btn-outline">Find Donor</Link>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="why-section">
        <h2>Why Choose BloodLink TN?</h2>
        <p className="subtitle">
          Thousands of lives are lost every year due to unavailability of blood at the right time.
          BloodLink TN bridges this gap by connecting donors and patients within minutes.
        </p>

        <div className="features">
          <div className="feature-card">
            <FaSearchLocation className="icon" />
            <h3>Easy Search</h3>
            <p>Find blood donors near your area quickly and securely.</p>
          </div>
          <div className="feature-card">
            <FaMapMarkerAlt className="icon" />
            <h3>Location-Based Matching</h3>
            <p>Get connected with nearby donors through smart geo-matching.</p>
          </div>
          <div className="feature-card">
            <FaHandshake className="icon" />
            <h3>Save Lives Together</h3>
            <p>Join thousands of registered donors ready to make a difference.</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <h2>Contact Us</h2>
        <p>Email: <a href="mailto:support@bloodlinktn.org">support@bloodlinktn.org</a></p>
        <p>Follow us on social media for updates and campaigns.</p>
      </section>
    </div>
  );
};

export default About;


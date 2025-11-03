import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { donorAPI, hospitalAPI } from '../api/Api';

const DonorRegister = ({ user }) => {
  const [formData, setFormData] = useState({
    name: '',
    blood_group: '',
    phone: '',
    district: '',
    hospital: '',
    latitude: '',
    longitude: ''
  });
  const [districts, setDistricts] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDistricts();
    fetchMyProfile();
  }, []);

  useEffect(() => {
    if (formData.district) {
      fetchHospitals(formData.district);
    }
  }, [formData.district]);

  const fetchDistricts = async () => {
    try {
      const response = await hospitalAPI.getDistricts();
      setDistricts(response.data.districts);
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const fetchHospitals = async (district) => {
    try {
      const response = await hospitalAPI.getByDistrict(district);
      setHospitals(response.data.hospitals);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    }
  };

  const fetchMyProfile = async () => {
    try {
      const response = await donorAPI.getMyProfile();
      const donor = response.data.donor;
      setFormData({
        name: donor.name || '',
        blood_group: donor.blood_group || '',
        phone: donor.phone || user.phone || '',
        district: donor.district || '',
        hospital: donor.hospital || '',
        latitude: donor.latitude || '',
        longitude: donor.longitude || ''
      });
    } catch (error) {
      // Profile doesn't exist yet, that's okay
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setSuccess('Location detected successfully!');
        },
        (error) => {
          setError('Unable to retrieve your location. Please enter manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const submitData = {
      ...formData,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null
    };

    try {
      const response = await donorAPI.register(submitData);
      setSuccess('Donor profile registered successfully! You will appear on the map for 14 days.');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="form-container">
        <h2 className="page-title">Register as Donor</h2>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Blood Group</label>
            <select name="blood_group" value={formData.blood_group} onChange={handleChange} required>
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>District</label>
            <select name="district" value={formData.district} onChange={handleChange} required>
              <option value="">Select District</option>
              {districts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Hospital</label>
            <select name="hospital" value={formData.hospital} onChange={handleChange} required>
              <option value="">Select Hospital</option>
              {hospitals.map((hospital, idx) => (
                <option key={idx} value={hospital.name}>{hospital.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Latitude</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="e.g., 11.1271"
              />
              <button type="button" onClick={getCurrentLocation} className="btn btn-secondary">
                Use My Location
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Longitude</label>
            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="e.g., 78.6569"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register as Donor'}
          </button>
        </form>
        <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          Note: Your donor profile will be automatically removed after 14 days. 
          You can register again anytime.
        </p>
      </div>
    </div>
  );
};

export default DonorRegister;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestAPI, hospitalAPI, notifyAPI } from '../api/Api';

const RequestBlood = ({ user }) => {
  const [formData, setFormData] = useState({
    requester_name: '',
    blood_group: '',
    district: '',
    hospital: '',
    phone: user.phone || '',
    urgency: 'normal'
  });
  const [districts, setDistricts] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDistricts();
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await requestAPI.create(formData);
      const requestId = response.data.request.id;
      
      setSuccess(`Request created successfully! Found ${response.data.matching_donors_count} matching donor(s).`);
      
      // Notify donors
      try {
        await notifyAPI.notifyDonorsForRequest({ request_id: requestId });
      } catch (notifyError) {
        console.error('Error notifying donors:', notifyError);
      }
      
      setTimeout(() => {
        navigate('/my-requests');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Request creation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="form-container">
        <h2 className="page-title">Request Blood</h2>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Requester Name</label>
            <input
              type="text"
              name="requester_name"
              value={formData.requester_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Blood Group Required</label>
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
            <label>Contact Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Urgency</label>
            <select name="urgency" value={formData.urgency} onChange={handleChange}>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Request...' : 'Create Blood Request'}
          </button>
        </form>
        <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          Matching donors will be notified via SMS if configured. You can also view them on the map.
        </p>
      </div>
    </div>
  );
};

export default RequestBlood;


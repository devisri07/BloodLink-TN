
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { donorAPI, hospitalAPI } from '../api/Api';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const DonorMap = () => {
  const [donors, setDonors] = useState([]);
  const [filters, setFilters] = useState({ blood_group: '', district: '' });
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);

  const center = [11.1271, 78.6569]; // Tamil Nadu center

  useEffect(() => {
    fetchDistricts();
    fetchDonors();
  }, []);

  useEffect(() => {
    fetchDonors();
  }, [filters]);

  const fetchDistricts = async () => {
    try {
      const response = await hospitalAPI.getDistricts();
      setDistricts(response.data.districts);
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.blood_group) params.blood_group = filters.blood_group;
      if (filters.district) params.district = filters.district;

      const response = await donorAPI.getMap(params);
      setDonors(response.data.donors.filter(d => d.latitude && d.longitude));
    } catch (error) {
      console.error('Error fetching donors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleCall = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Find Donors on Map</h1>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>Filter Donors</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
          <div className="form-group">
            <label>Blood Group</label>
            <select name="blood_group" value={filters.blood_group} onChange={handleFilterChange}>
              <option value="">All</option>
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
            <select name="district" value={filters.district} onChange={handleFilterChange}>
              <option value="">All Districts</option>
              {districts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Map Section */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading donors...</div>
      ) : (
        <>
          <div className="card">
            <p><strong>{donors.length}</strong> donor(s) found</p>
          </div>

          <MapContainer center={center} zoom={7} style={{ height: '600px', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {donors.map(donor => (
              <Marker key={donor.id} position={[donor.latitude, donor.longitude]}>
                <Popup>
                  <div>
                    <h3>{donor.name}</h3>
                    <p><strong>Blood Group:</strong> {donor.blood_group}</p>
                    <p><strong>District:</strong> {donor.district}</p>
                    <p><strong>Hospital:</strong> {donor.hospital}</p>
                    <p><strong>Phone:</strong> {donor.phone}</p>
                    <button
                      onClick={() => handleCall(donor.phone)}
                      className="btn btn-primary"
                      style={{ marginTop: '5px', width: '100%' }}
                    >
                      Call Donor
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </>
      )}
    </div>
  );
};

export default DonorMap;


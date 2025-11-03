import React, { useState, useEffect } from 'react';
import { requestAPI } from '../api/Api';

const MyRequests = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await requestAPI.getMyRequests();
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFulfill = async (requestId) => {
    try {
      await requestAPI.fulfill(requestId);
      fetchRequests();
    } catch (error) {
      console.error('Error fulfilling request:', error);
      alert('Failed to mark request as fulfilled');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: '#ffc107', text: 'Pending' },
      fulfilled: { color: '#28a745', text: 'Fulfilled' },
      cancelled: { color: '#dc3545', text: 'Cancelled' }
    };
    const badge = badges[status] || badges.pending;
    return (
      <span style={{
        backgroundColor: badge.color,
        color: 'white',
        padding: '5px 10px',
        borderRadius: '5px',
        fontSize: '12px'
      }}>
        {badge.text}
      </span>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const badges = {
      normal: { color: '#17a2b8', text: 'Normal' },
      urgent: { color: '#ffc107', text: 'Urgent' },
      critical: { color: '#dc3545', text: 'Critical' }
    };
    const badge = badges[urgency] || badges.normal;
    return (
      <span style={{
        backgroundColor: badge.color,
        color: 'white',
        padding: '5px 10px',
        borderRadius: '5px',
        fontSize: '12px',
        marginLeft: '10px'
      }}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return <div className="page-container">Loading requests...</div>;
  }

  return (
    <div className="page-container">
      <h1 className="page-title">My Blood Requests</h1>
      
      {requests.length === 0 ? (
        <div className="card">
          <p>You haven't created any blood requests yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {requests.map(request => (
            <div key={request.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div>
                  <h3>
                    Request #{request.id}
                    {getStatusBadge(request.status)}
                    {getUrgencyBadge(request.urgency)}
                  </h3>
                  <p style={{ color: '#666', marginTop: '5px' }}>
                    Created: {new Date(request.created_at).toLocaleString()}
                  </p>
                </div>
                {request.status === 'pending' && (
                  <button
                    onClick={() => handleFulfill(request.id)}
                    className="btn btn-success"
                  >
                    Mark as Fulfilled
                  </button>
                )}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div>
                  <strong>Requester:</strong> {request.requester_name}
                </div>
                <div>
                  <strong>Blood Group:</strong> {request.blood_group}
                </div>
                <div>
                  <strong>District:</strong> {request.district}
                </div>
                <div>
                  <strong>Hospital:</strong> {request.hospital}
                </div>
                <div>
                  <strong>Contact:</strong> {request.phone}
                </div>
                {request.fulfilled_at && (
                  <div>
                    <strong>Fulfilled At:</strong> {new Date(request.fulfilled_at).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequests;


import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const ProfileRequestContext = createContext(null);

export const useProfileRequests = () => {
  const context = useContext(ProfileRequestContext);
  if (!context) {
    throw new Error('useProfileRequests must be used within a ProfileRequestProvider');
  }
  return context;
};

export const ProfileRequestProvider = ({ children }) => {
  const [requests, setRequests] = useState([]);

  // Fetch pending requests (usually for admins)
  const fetchRequests = async () => {
    try {
      const res = await axios.get('/admin/profile-requests');
      // Format the data to match frontend expectations
      const formatted = res.data.map(req => ({
        id: req.id,
        userId: req.user_id,
        userName: req.user?.name || 'Unknown',
        currentRole: req.user?.role || 'Unknown',
        changes: (() => {
          let c = req.changes;
          if (typeof c === 'string') {
            try { 
              c = JSON.parse(c); 
              // Handle potential double-encoding where parsing once still leaves a string
              if (typeof c === 'string') c = JSON.parse(c);
            } catch (e) { c = {}; }
          }
          return c || {};
        })(),
        status: req.status,
        date: new Date(req.created_at).toLocaleDateString()
      }));
      setRequests(formatted);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  useEffect(() => {
    // Only attempt to fetch if we have an API token configured in Axios
    if (axios.defaults.headers.common['Authorization']) {
      fetchRequests();
      
      // Auto-poll for new requests every 30 seconds
      const poll = setInterval(fetchRequests, 30000);
      return () => clearInterval(poll);
    }
  }, [axios.defaults.headers.common['Authorization']]);

  // Submit a new request for approval (for students/faculty)
  const submitRequest = async (userId, userName, currentRole, changes) => {
    try {
      await axios.post('/profile/update', {
        majorChanges: changes
      });
      // Admin dashboard will refetch naturally when opened
    } catch (err) {
      console.error("Error submitting request:", err);
    }
  };

  const approveRequest = async (requestId) => {
    try {
      const res = await axios.post(`/admin/profile-requests/${requestId}/approve`);
      setRequests(prev => prev.filter(req => req.id !== requestId));
      alert(res.data.message || "Request approved!");
    } catch (err) {
      console.error("Error approving request:", err);
      alert(err.response?.data?.message || "Failed to approve request. Please check the logs.");
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      const res = await axios.post(`/admin/profile-requests/${requestId}/reject`);
      setRequests(prev => prev.filter(req => req.id !== requestId));
      alert(res.data.message || "Request rejected.");
    } catch (err) {
      console.error("Error rejecting request:", err);
      alert(err.response?.data?.message || "Failed to reject request.");
    }
  };

  const value = {
    requests,
    fetchRequests,
    submitRequest,
    approveRequest,
    rejectRequest
  };

  return (
    <ProfileRequestContext.Provider value={value}>
      {children}
    </ProfileRequestContext.Provider>
  );
};

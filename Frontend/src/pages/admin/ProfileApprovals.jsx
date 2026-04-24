import React, { useState, useEffect } from 'react';
import { useProfileRequests } from '../../context/ProfileRequestContext';
import axios from 'axios';

const ProfileApprovals = () => {
  const { requests, approveRequest, rejectRequest, fetchRequests } = useProfileRequests();
  const [filter, setFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);
  const [feedback, setFeedback] = useState({ show: false, type: 'success', title: '', message: '' });

  const filteredRequests = requests.filter(r => {
    if (filter === 'all') return true;
    return r.currentRole.toLowerCase() === filter;
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const showFeedback = (type, title, message) => {
    setFeedback({ show: true, type, title, message });
  };

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await approveRequest(id);
      showFeedback('success', 'Request Approved', 'The profile has been successfully updated in the system.');
    } catch (e) {
      showFeedback('error', 'Approval Failed', 'There was an error processing this request.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    setProcessingId(id);
    try {
      await rejectRequest(id);
      showFeedback('success', 'Request Rejected', 'The profile update request has been dismissed.');
    } catch (e) {
      showFeedback('error', 'Rejection Failed', 'There was an error dismissing this request.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div style={styles.container}>
      {/* Feedback Modal */}
      {feedback.show && (
        <div style={styles.modalOverlay}>
          <div style={styles.feedbackModal}>
            <div style={{ ...styles.iconCircle, backgroundColor: feedback.type === 'success' ? '#1cc88a' : '#e74a3b' }}>
              {feedback.type === 'success' ? '✅' : '❌'}
            </div>
            <h2 style={styles.modalTitle}>{feedback.title}</h2>
            <p style={styles.modalMessage}>{feedback.message}</p>
            <button 
              onClick={() => setFeedback({ ...feedback, show: false })} 
              style={{ ...styles.approveBtn, width: '100%', marginTop: '20px' }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Profile Change Approvals</h1>
          <p style={{ color: '#858796', margin: '4px 0 0' }}>Review and manage pending identity and academic information updates.</p>
        </div>
        <button 
          onClick={fetchRequests} 
          style={styles.refreshBtn}
          title="Sync with server"
        >
          🔄 Refresh
        </button>
      </div>

      <div style={styles.filterBar}>
        {['all', 'student', 'faculty'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            style={{ ...styles.filterTab, ...(filter === f ? styles.filterTabActive : {}) }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.requestList}>
        {filteredRequests.length > 0 ? (
          filteredRequests.map(req => (
            <div key={req.id} style={styles.requestCard}>
              <div style={styles.cardHeader}>
                <div style={styles.userInfo}>
                  <div style={{ ...styles.avatar, backgroundColor: req.currentRole === 'faculty' ? '#1cc88a' : '#4e73df' }}>
                    {req.userName.charAt(0)}
                  </div>
                  <div>
                    <h3 style={styles.userName}>{req.userName}</h3>
                    <span style={styles.userMeta}>{req.currentRole.toUpperCase()} • ID: {req.userId}</span>
                  </div>
                </div>
                <div style={styles.dateBadge}>Requested on {req.date}</div>
              </div>

              <div style={styles.changesBox}>
                <h4 style={styles.changesTitle}>Proposed Changes</h4>
                <div style={styles.diffGrid}>
                   <div style={styles.diffHeader}>Field Name</div>
                   <div style={styles.diffHeader}>Proposed Value</div>
                   
                   {Object.entries(req.changes).map(([key, val]) => (
                     <React.Fragment key={key}>
                       <div style={styles.fieldName}>{key.replace(/_/g, ' ')}</div>
                       <div style={styles.newValue}>
                      {val === null || val === '' ? (
                        <span style={{ color: '#e74a3b', fontStyle: 'italic' }}>(Empty)</span>
                      ) : typeof val === 'object' ? (
                        JSON.stringify(val)
                      ) : (
                        val.toString()
                      )}
                    </div>
                     </React.Fragment>
                   ))}
                </div>
              </div>

              <div style={styles.cardFooter}>
                <button 
                  onClick={() => handleReject(req.id)} 
                  style={styles.rejectBtn}
                  disabled={processingId === req.id}
                >
                  {processingId === req.id ? '...' : '❌ Reject Changes'}
                </button>
                <button 
                  onClick={() => handleApprove(req.id)} 
                  style={styles.approveBtn}
                  disabled={processingId === req.id}
                >
                   {processingId === req.id ? 'Processing...' : '✅ Approve & Update'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyState}>
            <span style={{ fontSize: '48px' }}>🎉</span>
            <h3 style={{ margin: '16px 0 4px', color: '#1f2f70' }}>All Caught Up!</h3>
            <p style={{ color: '#858796', margin: 0 }}>There are no pending profile update requests to review.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '32px' },
  pageTitle: { fontSize: '1.75rem', fontWeight: 800, color: '#1f2f70', margin: 0, letterSpacing: '-0.02em' },
  refreshBtn: { padding: '8px 16px', backgroundColor: '#f8f9fc', border: '1px solid #eaecf4', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#4e73df' },
  
  filterBar: { display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid #f8f9fc', paddingBottom: '12px' },
  filterTab: { padding: '10px 24px', border: 'none', background: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', color: '#858796', cursor: 'pointer', transition: 'all 0.2s' },
  filterTabActive: { backgroundColor: '#1f2f70', color: 'white', boxShadow: '0 4px 12px rgba(31, 47, 112, 0.2)' },

  requestList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  requestCard: { backgroundColor: 'white', borderRadius: '18px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f8f9fc' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' },
  userInfo: { display: 'flex', gap: '16px', alignItems: 'center' },
  avatar: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: '800' },
  userName: { fontSize: '1.1rem', fontWeight: '700', color: '#1f2f70', margin: 0 },
  userMeta: { fontSize: '0.75rem', fontWeight: '700', color: '#858796', letterSpacing: '0.5px' },
  dateBadge: { fontSize: '0.8rem', color: '#858796', fontWeight: '500' },

  changesBox: { backgroundColor: '#f8f9fc', borderRadius: '14px', padding: '20px', marginBottom: '20px' },
  changesTitle: { fontSize: '0.75rem', fontWeight: '800', color: '#b7b9cc', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' },
  diffGrid: { display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) 2fr', gap: '12px', alignItems: 'center' },
  diffHeader: { fontSize: '0.7rem', fontWeight: '800', color: '#aab0c6', paddingBottom: '8px', borderBottom: '1px solid #e3e6f0' },
  fieldName: { fontSize: '0.9rem', fontWeight: '700', color: '#5a5c69', textTransform: 'capitalize' },
  newValue: { fontSize: '0.95rem', fontWeight: '600', color: '#2e59d9', backgroundColor: '#eef2ff', padding: '6px 12px', borderRadius: '8px', wordBreak: 'break-all' },

  cardFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #f8f9fc', paddingTop: '20px' },
  rejectBtn: { padding: '10px 20px', background: 'none', border: '1px solid #e74a3b', color: '#e74a3b', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer' },
  approveBtn: { padding: '10px 24px', backgroundColor: '#1cc88a', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(28, 200, 138, 0.2)' },

  // Modal
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(31, 47, 112, 0.4)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 },
  feedbackModal: { backgroundColor: 'white', borderRadius: '24px', padding: '40px', width: 'min(90%, 400px)', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  iconCircle: { width: '80px', height: '80px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', marginBottom: '24px' },
  modalTitle: { fontSize: '1.5rem', fontWeight: '800', color: '#1f2f70', margin: '0 0 12px' },
  modalMessage: { fontSize: '1rem', color: '#858796', margin: 0, lineHeight: 1.5 }
};

export default ProfileApprovals;

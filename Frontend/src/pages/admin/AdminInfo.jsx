import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const AdminInfo = () => {
  const { user, updateProfile } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [stats, setStats] = useState({ users: 0, schedules: 0, events: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [uRes, sRes, eRes] = await Promise.all([
          axios.get('/admin/users'),
          axios.get('/schedules'),
          axios.get('/events')
        ]);
        setStats({
          users: uRes.data.length,
          schedules: sRes.data.length,
          events: eRes.data.length
        });
      } catch (e) { console.error('Failed to fetch stats', e); }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (user && showEditModal) {
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        user_id: user.user_id || user.id || '',
        phone: user.phone || '',
        address: user.address || '',
        profile_pic_base64: user.profile_pic_base64 || ''
      });
    }
  }, [user, showEditModal]);

  if (!user) return <div style={styles.loading}>Initializing...</div>;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, profile_pic_base64: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const minor = {};
    const major = {};
    
    if (editForm.profile_pic_base64 !== user.profile_pic_base64) minor.profile_pic_base64 = editForm.profile_pic_base64;
    if (editForm.phone !== user.phone) minor.phone = editForm.phone;
    if (editForm.address !== user.address) minor.address = editForm.address;

    if (editForm.name !== user.name) major.name = editForm.name;
    if (editForm.email !== user.email) major.email = editForm.email;

    const res = await updateProfile(minor, major);
    if (res.success) {
      alert(res.message);
      setShowEditModal(false);
    } else {
      alert(res.error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <h1 style={{ ...styles.pageTitle, marginBottom: 0 }}>System Administrator Profile</h1>
        <button style={styles.editButton} onClick={() => setShowEditModal(true)}>
          ✏️ Edit Profile
        </button>
      </div>

      <div style={styles.profileHeader}>
        <div style={styles.profileAvatar}>
          {user.profile_pic_base64 ? (
            <img src={user.profile_pic_base64} alt="P" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (user.name?.charAt(0) || 'A')}
        </div>
        <div style={styles.profileInfo}>
          <h2 style={styles.profileName}>{user.name}</h2>
          <p style={styles.profileId}>Administrator ID: {user.user_id || user.id}</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <span style={{ ...styles.statusBadge, backgroundColor: '#e74a3b' }}>SUPER ADMIN</span>
            <span style={{ ...styles.statusBadge, backgroundColor: '#1f2f70' }}>System Oversight</span>
          </div>
        </div>
      </div>

      <div style={styles.infoGrid}>
        {/* Account Details */}
        <div style={styles.infoCard}>
          <h3 style={styles.cardTitle}>🔑 Account Details</h3>
          <div style={styles.infoList}>
            <InfoItem label="System Email" value={user.email} />
            <InfoItem label="Security Role" value="Full Permissions" />
            <InfoItem label="Account Type" value="Permanent" />
            <InfoItem label="Last Login" value={new Date().toLocaleDateString()} />
          </div>
        </div>

        {/* Oversight Card */}
        <div style={styles.infoCard}>
          <h3 style={styles.cardTitle}>📊 System Oversight</h3>
          <div style={styles.infoList}>
            <InfoItem label="Managed Users" value={stats.users} />
            <InfoItem label="Active Schedules" value={stats.schedules} />
            <InfoItem label="Planned Events" value={stats.events} />
            <InfoItem label="System Status" value="Healthy" />
          </div>
        </div>

        {/* Personal Details */}
        <div style={styles.infoCard}>
          <h3 style={styles.cardTitle}>👤 Personal Contact</h3>
          <div style={styles.infoList}>
            <InfoItem label="Contact Number" value={user.phone || 'Not provided'} />
            <InfoItem label="Official Address" value={user.address || 'CCS Main Office'} />
            <InfoItem label="Department" value="College of Computer Studies" />
          </div>
        </div>

        {/* Security Summary */}
        <div style={{ ...styles.infoCard, borderLeft: '4px solid #1f2f70' }}>
          <h3 style={styles.cardTitle}>🛡️ Security & Integrity</h3>
          <div style={{ fontSize: '13px', color: '#5a5c69', lineHeight: '1.6' }}>
            Your account is the primary administrative endpoint. Ensure multi-factor authentication is active and review system logs regularly for unauthorized access attempts.
          </div>
        </div>
      </div>

      {showEditModal && editForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Update Administrator Profile</h3>
              <button onClick={() => setShowEditModal(false)} style={styles.closeButton}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.warningBox}>
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <p><strong>Note:</strong> While Administrators can self-manage certain fields, core identity changes (Name/Email) may be logged for security audits.</p>
              </div>

               <div style={styles.formGroup}>
                <label style={styles.label}>Profile Picture (Instant Update)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ ...styles.profileAvatar, width: '60px', height: '60px', fontSize: '24px' }}>
                    {editForm.profile_pic_base64 ? (
                      <img src={editForm.profile_pic_base64} alt="preview" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (user.name?.charAt(0))}
                  </div>
                  <label style={styles.uploadBtn}>
                    {editForm.profile_pic_base64 ? 'Change Photo' : 'Upload Photo'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              <div style={styles.formRow}>
                <FormGroup label="Full Name">
                  <input style={styles.input} value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                </FormGroup>
                <FormGroup label="Administrator ID">
                  <input style={styles.input} value={editForm.user_id} disabled />
                </FormGroup>
              </div>

              <FormGroup label="System Email">
                <input style={styles.input} type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
              </FormGroup>

              <div style={styles.formRow}>
                <FormGroup label="Contact Number">
                  <input style={styles.input} value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                </FormGroup>
                <FormGroup label="Official Address">
                  <input style={styles.input} value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} />
                </FormGroup>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowEditModal(false)} style={styles.cancelButton}>Cancel</button>
              <button 
                style={styles.saveButton} 
                onClick={handleSave}
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div style={styles.infoItem}>
    <span style={styles.infoLabel}>{label}</span>
    <span style={styles.infoValue}>{value}</span>
  </div>
);

const FormGroup = ({ label, children }) => (
  <div style={styles.formGroup}>
    <label style={styles.label}>{label}</label>
    {children}
  </div>
);

const styles = {
  container: { maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' },
  pageTitle: { fontSize: '24px', fontWeight: '700', color: '#1f2f70' },
  loading: { textAlign: 'center', padding: '60px', color: '#858796' },
  profileHeader: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
    gap: '24px', backgroundColor: 'white', borderRadius: '16px', padding: '32px',
    marginBottom: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
  },
  profileAvatar: {
    width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#e74a3b',
    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '48px', fontWeight: '700', flexShrink: 0, border: '4px solid #f8f9fc'
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: '24px', fontWeight: '800', color: '#1f2f70', margin: 0 },
  profileId: { fontSize: '14px', color: '#858796', marginTop: '4px' },
  statusBadge: { display: 'inline-block', padding: '4px 12px', color: 'white', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' },
  editButton: { padding: '8px 16px', backgroundColor: '#1f2f70', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  infoGrid: { display: 'flex', flexDirection: 'column', gap: '20px' },
  infoCard: { backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' },
  cardTitle: { fontSize: '17px', fontWeight: '700', color: '#1f2f70', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid #f8f9fc' },
  infoList: { display: 'flex', flexDirection: 'column', gap: '14px' },
  infoItem: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f8f9fc', paddingBottom: '8px' },
  infoLabel: { color: '#858796', fontSize: '13px', fontWeight: '500' },
  infoValue: { color: '#1f2f70', fontSize: '13px', fontWeight: '700' },

  // Modal
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(31, 47, 112, 0.4)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 },
  modal: { backgroundColor: 'white', borderRadius: '24px', width: 'min(95%, 650px)', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' },
  modalHeader: { padding: '24px 32px', borderBottom: '1px solid #f0f2f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' },
  closeButton: { background: 'none', border: 'none', fontSize: '28px', color: '#b7b9cc', cursor: 'pointer' },
  warningBox: { display: 'flex', gap: '12px', padding: '16px', backgroundColor: '#fff8e1', color: '#856404', borderRadius: '12px', marginBottom: '24px', alignItems: 'center', fontSize: '12px' },
  modalBody: { padding: '32px' },
  formRow: { display: 'flex', flexWrap: 'wrap', gap: '16px' },
  formGroup: { flex: '1 1 250px', marginBottom: '16px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '700', color: '#858796', textTransform: 'uppercase', marginBottom: '8px' },
  input: { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #d1d3e2', fontSize: '14px', color: '#1f2f70', boxSizing: 'border-box' },
  modalFooter: { padding: '24px 32px', borderTop: '1px solid #f0f2f5', display: 'flex', justifyContent: 'flex-end', gap: '12px' },
  cancelButton: { padding: '10px 20px', background: 'none', border: 'none', color: '#858796', fontWeight: '600', cursor: 'pointer' },
  saveButton: { padding: '10px 24px', backgroundColor: '#e74a3b', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' },
  uploadBtn: { padding: '8px 16px', backgroundColor: '#f8f9fc', border: '1px solid #4e73df', color: '#4e73df', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
};

if (typeof window !== 'undefined') {
  const mq = window.matchMedia('(min-width: 1024px)');
  const updateLayout = (e) => {
    styles.profileHeader.flexDirection = e.matches ? 'row' : 'column';
    styles.profileHeader.textAlign = e.matches ? 'left' : 'center';
    styles.infoGrid.display = 'grid';
    styles.infoGrid.gridTemplateColumns = e.matches ? 'repeat(2, 1fr)' : '1fr';
  };
  mq.addListener(updateLayout);
  updateLayout(mq);
}

export default AdminInfo;

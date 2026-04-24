import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserRow from './UserRow';

const BLANK_FORM = {
  name: '', email: '', password: '', role: 'student',
  department: 'CS', course: '', bio: '', student_status: 'Regular'
};

const UsersManagement = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');

  // Fetch users from backend
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await axios.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const stats = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    faculty: users.filter(u => u.role === 'faculty').length,
    admins: users.filter(u => u.role === 'admin').length
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.role === filter;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin': return '#e74a3b';
      case 'faculty': return '#1cc88a';
      case 'student': return '#4e73df';
      default: return '#858796';
    }
  };

  // ── Modal component (controlled) ──
  const UserModal = ({ user, onClose, onSaved }) => {
    const isNew = !user;
    const [form, setForm] = useState(isNew ? BLANK_FORM : {
      name: user.name || '', email: user.email || '', password: '',
      role: user.role || 'student', department: user.department || 'CS',
      course: user.course || '', bio: user.bio || '',
      student_status: user.student_profile?.student_status || 'Regular'
    });
    const [saving, setSaving] = useState(false);
    const [modalError, setModalError] = useState('');

    const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async () => {
      setModalError('');
      if (!form.name.trim() || !form.email.trim()) {
        setModalError('Name and email are required.');
        return;
      }
      if (isNew && !form.password.trim()) {
        setModalError('Password is required for new users.');
        return;
      }
      setSaving(true);
      try {
        if (isNew) {
          await axios.post('/admin/users', form);
        } else {
          const payload = { ...form };
          if (!payload.password) delete payload.password;
          await axios.put(`/admin/users/${user.id}`, payload);
        }
        onSaved();
        onClose();
      } catch (err) {
        const msg = err.response?.data?.message ||
          (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(' ') : 'Failed to save user.');
        setModalError(msg);
      } finally {
        setSaving(false);
      }
    };

    const handleDelete = async () => {
      if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) return;
      try {
        await axios.delete(`/admin/users/${user.id}`);
        onSaved();
        onClose();
      } catch (err) {
        setModalError(err.response?.data?.message || 'Failed to delete user.');
      }
    };

    return (
      <div style={styles.modalOverlay}>
        <div style={styles.modal}>
          <div style={styles.modalHeader}>
            <h3 style={{ margin: 0, color: '#1f2f70' }}>{isNew ? 'Add New User' : `Edit: ${user.name}`}</h3>
            <button onClick={onClose} style={styles.closeButton}>×</button>
          </div>
          <div style={styles.modalBody}>
            {modalError && (
              <div style={styles.errorBox}>{modalError}</div>
            )}
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name *</label>
                <input type="text" style={styles.input} value={form.name} onChange={set('name')} placeholder="Enter full name" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email *</label>
                <input type="email" style={styles.input} value={form.email} onChange={set('email')} placeholder="user@ccs.edu" />
              </div>
            </div>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Role *</label>
                <select style={styles.select} value={form.role} onChange={set('role')}>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Department</label>
                <select style={styles.select} value={form.department} onChange={set('department')}>
                  <option value="CS">Computer Science</option>
                  <option value="IT">Information Technology</option>
                  <option value="IS">Information Systems</option>
                </select>
              </div>
            </div>
            {form.role === 'student' && (
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Course</label>
                  <select style={styles.select} value={form.course} onChange={set('course')}>
                    <option value="">Select course...</option>
                    <option value="BSCS">BSCS</option>
                    <option value="BSIT">BSIT</option>
                    <option value="BSIS">BSIS</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Student Status</label>
                  <select style={styles.select} value={form.student_status} onChange={set('student_status')}>
                    <option value="Regular">Regular</option>
                    <option value="Irregular">Irregular</option>
                  </select>
                </div>
              </div>
            )}
            <div style={styles.formGroup}>
              <label style={styles.label}>Bio</label>
              <textarea style={{ ...styles.input, resize: 'vertical', minHeight: '60px' }} value={form.bio} onChange={set('bio')} placeholder="Short biography..." />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>{isNew ? 'Password *' : 'New Password (leave blank to keep current)'}</label>
              <input type="password" style={styles.input} value={form.password} onChange={set('password')} placeholder={isNew ? 'Enter password' : 'Leave blank to keep unchanged'} />
            </div>
          </div>
          <div style={styles.modalFooter}>
            {!isNew && (
              <button onClick={handleDelete} style={styles.deleteButton}>🗑 Delete User</button>
            )}
            <button onClick={onClose} style={styles.cancelButton} disabled={saving}>Cancel</button>
            <button onClick={handleSubmit} style={styles.saveButton} disabled={saving}>
              {saving ? 'Saving...' : isNew ? '+ Create User' : '✔ Save Changes'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>User Management</h1>
        <button
          style={styles.addButton}
          onClick={() => { setSelectedUser(null); setShowUserModal(true); }}
        >
          + Add New User
        </button>
      </div>

      <div style={styles.statsGrid}>
        {[
          { icon: '👥', value: stats.total, label: 'Total Users' },
          { icon: '🎓', value: stats.students, label: 'Students' },
          { icon: '👨‍🏫', value: stats.faculty, label: 'Faculty' },
          { icon: '👑', value: stats.admins, label: 'Admins' },
        ].map(s => (
          <div key={s.label} style={styles.statCard}>
            <div style={styles.statIcon}>{s.icon}</div>
            <div style={styles.statContent}>
              <div style={styles.statValue}>{s.value}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.controls}>
        <div style={styles.searchBar}>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.filterButtons}>
          {['all', 'student', 'faculty', 'admin'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...styles.filterButton,
                backgroundColor: filter === f ? '#1f2f70' : 'transparent',
                color: filter === f ? 'white' : '#5a5c69'
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}{f !== 'all' ? 's' : ''}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.tableContainer}>
        {loadingUsers ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#858796' }}>Loading users…</div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#858796' }}>
            {users.length === 0 ? 'No users yet. Create one above!' : 'No users match your search.'}
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>User</th>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Course</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Joined</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <UserRow 
                  key={user.id} 
                  user={user} 
                  onEdit={(u) => { setSelectedUser(u); setShowUserModal(true); }} 
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showUserModal && (
        <UserModal
          user={selectedUser}
          onClose={() => { setShowUserModal(false); setSelectedUser(null); }}
          onSaved={fetchUsers}
        />
      )}
    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  pageTitle: { fontSize: '24px', fontWeight: '600', color: '#1f2f70', margin: 0 },
  addButton: {
    padding: '10px 20px', backgroundColor: '#1cc88a', color: 'white',
    border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
  },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' },
  statCard: {
    backgroundColor: 'white', borderRadius: '12px', padding: '16px',
    display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
  },
  statIcon: {
    fontSize: '24px', width: '48px', height: '48px', backgroundColor: '#f8f9fc',
    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  statContent: { flex: 1 },
  statValue: { fontSize: '20px', fontWeight: '700', color: '#1f2f70', marginBottom: '4px' },
  statLabel: { fontSize: '12px', color: '#858796' },
  controls: { display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' },
  searchBar: { flex: 1, minWidth: '260px' },
  searchInput: { width: '100%', padding: '12px 16px', border: '1px solid #d1d3e2', borderRadius: '8px', fontSize: '14px', outline: 'none' },
  filterButtons: { display: 'flex', gap: '8px' },
  filterButton: { padding: '8px 16px', border: '1px solid #d1d3e2', borderRadius: '20px', fontSize: '14px', cursor: 'pointer' },
  tableContainer: { backgroundColor: 'white', borderRadius: '12px', overflow: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '800px' },
  th: { textAlign: 'left', padding: '14px 16px', backgroundColor: '#f8f9fc', color: '#5a5c69', fontSize: '13px', fontWeight: '600', borderBottom: '2px solid #e3e6f0' },
  tr: { transition: 'background 0.15s' },
  td: { padding: '14px 16px', borderBottom: '1px solid #e3e6f0', fontSize: '14px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  userAvatar: {
    width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#1f2f70',
    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '700', fontSize: '15px', flexShrink: 0, overflow: 'hidden'
  },
  userName: { fontWeight: '600', color: '#1f2f70', marginBottom: '2px' },
  userEmail: { fontSize: '12px', color: '#858796' },
  roleBadge: {
    display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
    color: 'white', fontSize: '11px', fontWeight: '600', textTransform: 'capitalize'
  },
  editButton: { padding: '5px 12px', backgroundColor: '#1f2f70', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' },
  // Modal styles
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
  },
  modal: { backgroundColor: 'white', borderRadius: '14px', width: 'min(95%, 620px)', maxHeight: '90vh', overflow: 'auto' },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 24px', borderBottom: '1px solid #e3e6f0'
  },
  closeButton: { background: 'none', border: 'none', fontSize: '26px', cursor: 'pointer', color: '#858796', lineHeight: 1 },
  modalBody: { padding: '20px 24px' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 24px', borderTop: '1px solid #e3e6f0', flexWrap: 'wrap' },
  formGroup: { marginBottom: '14px', flex: '1 1 250px' },
  formRow: { display: 'flex', flexWrap: 'wrap', gap: '14px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#5a5c69' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #d1d3e2', borderRadius: '7px', fontSize: '14px', boxSizing: 'border-box' },
  select: { width: '100%', padding: '10px 12px', border: '1px solid #d1d3e2', borderRadius: '7px', fontSize: '14px' },
  cancelButton: { padding: '9px 18px', backgroundColor: '#f8f9fc', color: '#5a5c69', border: '1px solid #d1d3e2', borderRadius: '7px', fontSize: '14px', cursor: 'pointer' },
  saveButton: { padding: '9px 20px', backgroundColor: '#1cc88a', color: 'white', border: 'none', borderRadius: '7px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  deleteButton: { padding: '9px 11px', backgroundColor: '#e74a3b', color: 'white', border: 'none', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', marginRight: 'auto' },
  errorBox: { backgroundColor: '#fdecea', border: '1px solid #f5c6cb', color: '#842029', padding: '10px 14px', borderRadius: '7px', marginBottom: '14px', fontSize: '13px' }
};

export default UsersManagement;
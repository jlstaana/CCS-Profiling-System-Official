import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';

const Violations = () => {
  const { user } = useAuth();
  const { allUsers } = useSocial(); // To select student for new violation

  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [form, setForm] = useState({
    user_id: '',
    type: '',
    description: '',
    date_occurred: new Date().toISOString().split('T')[0],
    status: 'pending'
  });

  const fetchViolations = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/violations');
      setViolations(res.data);
    } catch (e) {
      console.error('Failed to fetch violations', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/violations', form);
      fetchViolations();
      setShowModal(false);
      setForm({
        user_id: '',
        type: '',
        description: '',
        date_occurred: new Date().toISOString().split('T')[0],
        status: 'pending'
      });
    } catch (e) {
      alert('Error creating violation record');
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`/violations/${id}`, { status: newStatus });
      fetchViolations();
    } catch (e) {
      alert('Error updating status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await axios.delete(`/violations/${id}`);
      fetchViolations();
    } catch (e) {
      alert('Error deleting record');
    }
  };

  const filteredViolations = violations.filter(v => 
    v.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAdminOrFaculty = user?.role === 'admin' || user?.role === 'faculty';

  return (
    <div style={S.container}>
      <header style={S.header}>
        <div>
          <h1 style={S.title}>{user?.role === 'student' ? 'My Violation History' : 'Violation Records'}</h1>
          <p style={S.subtitle}>
            {user?.role === 'student' 
              ? 'View and track your disciplinary records.' 
              : 'Manage and monitor student violations and disciplinary status.'}
          </p>
        </div>
        {isAdminOrFaculty && (
          <button style={S.addBtn} onClick={() => setShowModal(true)}>
            + Report Violation
          </button>
        )}
      </header>

      {isAdminOrFaculty && (
        <div style={S.filterBar}>
          <input 
            type="text" 
            placeholder="Search by student name or violation type..." 
            style={S.searchInput}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      <div style={S.card}>
        <div style={S.tableWrapper}>
          <table style={S.table}>
            <thead>
              <tr style={S.tr}>
                {isAdminOrFaculty && <th style={S.th}>Student</th>}
                <th style={S.th}>Violation Type</th>
                <th style={S.th}>Description</th>
                <th style={S.th}>Date</th>
                <th style={S.th}>Status</th>
                <th style={S.th}>Reporter</th>
                {isAdminOrFaculty && <th style={S.th}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={S.tdCenter}>Loading records...</td></tr>
              ) : filteredViolations.length === 0 ? (
                <tr><td colSpan={7} style={S.tdCenter}>No violation records found.</td></tr>
              ) : filteredViolations.map(v => (
                <tr key={v.id} style={S.tr}>
                  {isAdminOrFaculty && (
                    <td style={S.td}>
                      <div style={S.studentInfo}>
                        <div style={S.avatar}>{v.user?.name?.charAt(0)}</div>
                        <span>{v.user?.name}</span>
                      </div>
                    </td>
                  )}
                  <td style={S.td}><span style={S.vType}>{v.type}</span></td>
                  <td style={S.td}><div style={S.vDesc}>{v.description}</div></td>
                  <td style={S.td}>{new Date(v.date_occurred).toLocaleDateString()}</td>
                  <td style={S.td}>
                    <span style={{
                      ...S.statusBadge,
                      backgroundColor: v.status === 'resolved' ? '#1cc88a' : '#f6c23e'
                    }}>
                      {v.status}
                    </span>
                  </td>
                  <td style={S.td}>{v.reporter?.name}</td>
                  {isAdminOrFaculty && (
                    <td style={S.td}>
                      <div style={S.actions}>
                        {v.status !== 'resolved' && (
                          <button 
                            style={S.actionBtn} 
                            title="Mark as Resolved" 
                            onClick={() => handleStatusUpdate(v.id, 'resolved')}
                          >
                            ✅
                          </button>
                        )}
                        {user.role === 'admin' && (
                          <button 
                            style={S.deleteBtn} 
                            title="Delete" 
                            onClick={() => handleDelete(v.id)}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tooltip-ish form or full modal */}
      {showModal && (
        <div style={S.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <h3>Report New Violation</h3>
              <button onClick={() => setShowModal(false)} style={S.closeBtn}>×</button>
            </div>
            <form style={S.form} onSubmit={handleSubmit}>
              <div style={S.formGroup}>
                <label style={S.label}>Student</label>
                <select 
                  style={S.input} 
                  required 
                  value={form.user_id}
                  onChange={e => setForm({...form, user_id: e.target.value})}
                >
                  <option value="">Select a student...</option>
                  {allUsers.filter(u => u.role === 'student').map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                  ))}
                </select>
              </div>
              <div style={S.formRow}>
                <div style={S.formGroup}>
                  <label style={S.label}>Violation Type</label>
                  <select 
                    style={S.input} 
                    required 
                    value={form.type}
                    onChange={e => setForm({...form, type: e.target.value})}
                  >
                    <option value="">Select type...</option>
                    <option value="Dress Code">Dress Code</option>
                    <option value="ID Card Policy">ID Card Policy</option>
                    <option value="Late for Class">Late for Class</option>
                    <option value="Academic Dishonesty">Academic Dishonesty</option>
                    <option value="Vandalism">Vandalism</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={S.formGroup}>
                  <label style={S.label}>Date Occurred</label>
                  <input 
                    type="date" 
                    style={S.input} 
                    required 
                    value={form.date_occurred}
                    onChange={e => setForm({...form, date_occurred: e.target.value})}
                  />
                </div>
              </div>
              <div style={S.formGroup}>
                <label style={S.label}>Description of Offense</label>
                <textarea 
                  style={{ ...S.input, height: '100px', resize: 'none' }} 
                  required 
                  placeholder="Provide details about the incident..."
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                />
              </div>
              <div style={S.modalFooter}>
                <button type="button" style={S.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" style={S.saveBtn}>Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const S = {
  container: { padding: '24px', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
  title: { fontSize: '28px', fontWeight: '700', color: '#1f2f70', margin: '0 0 8px 0' },
  subtitle: { fontSize: '15px', color: '#858796', margin: 0 },
  addBtn: { padding: '12px 24px', backgroundColor: '#e74a3b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },
  filterBar: { marginBottom: '24px' },
  searchInput: { width: '100%', padding: '12px 20px', borderRadius: '10px', border: '1px solid #d1d3e2', fontSize: '15px', outline: 'none' },
  card: { backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '16px 20px', backgroundColor: '#f8f9fc', color: '#4e73df', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', borderBottom: '2px solid #e3e6f0' },
  td: { padding: '16px 20px', borderBottom: '1px solid #e3e6f0', fontSize: '14px', color: '#5a5c69', verticalAlign: 'middle' },
  tdCenter: { padding: '40px', textAlign: 'center', color: '#858796' },
  tr: { transition: 'background 0.2s' },
  vType: { fontWeight: '600', color: '#2e59d9' },
  vDesc: { maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  statusBadge: { padding: '4px 12px', borderRadius: '20px', color: 'white', fontSize: '12px', fontWeight: '700', textTransform: 'capitalize' },
  studentInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#4e73df', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' },
  actions: { display: 'flex', gap: '10px' },
  actionBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '4px' },
  
  // Modal styles
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 },
  modal: { backgroundColor: 'white', borderRadius: '15px', width: '90%', maxWidth: '550px', boxShadow: '0 15px 50px rgba(0,0,0,0.2)', overflow: 'hidden' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e3e6f0', backgroundColor: '#f8f9fc' },
  closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#858796' },
  form: { padding: '24px' },
  formGroup: { marginBottom: '20px' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  label: { display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700', color: '#1f2f70' },
  input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d3e2', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' },
  cancelBtn: { padding: '10px 20px', backgroundColor: '#f8f9fc', color: '#5a5c69', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  saveBtn: { padding: '10px 20px', backgroundColor: '#e74a3b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }
};

export default Violations;

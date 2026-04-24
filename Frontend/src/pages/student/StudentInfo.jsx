import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const StudentInfo = () => {
  const { user, updateProfile } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);

  // Sync edit form with user data when modal opens
  useEffect(() => {
    if (user && showEditModal) {
      const sp = user.student_profile || {};
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        id: user.user_id || user.id || '',
        course: user.course || '',
        year: user.year || '',
        profile_pic_base64: user.profile_pic_base64 || '',
        
        // Student Profile details
        phone: sp.phone || '',
        address: sp.address || '',
        birth_date: sp.birth_date ? new Date(sp.birth_date).toISOString().split('T')[0] : '',
        nationality: sp.nationality || '',
        gender: sp.gender || '',
        zip_code: sp.zip_code || '',
        guardian_name: sp.guardian_name || '',
        guardian_relationship: sp.guardian_relationship || '',
        guardian_contact: sp.guardian_contact || '',
        guardian_address: sp.guardian_address || '',
        academic_history: sp.academic_history || [],
        non_academic_activities: sp.non_academic_activities || [],
        skills: sp.skills || [],
        affiliations: sp.affiliations || []
      });
    }
  }, [user, showEditModal]);

  if (!user) return <div style={S.loading}>Loading profile...</div>;

  const sp = user.student_profile || {};

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
    const minorChanges = {};
    const majorChanges = {};
    const studentProfile = {
      // List fields (direct save)
      academic_history: editForm.academic_history,
      non_academic_activities: editForm.non_academic_activities,
      skills: editForm.skills,
      affiliations: editForm.affiliations,
      // All personal info stored in student_profiles table
      phone: editForm.phone,
      address: editForm.address,
      birth_date: editForm.birth_date,
      nationality: editForm.nationality,
      gender: editForm.gender,
      zip_code: editForm.zip_code,
      guardian_name: editForm.guardian_name,
      guardian_relationship: editForm.guardian_relationship,
      guardian_contact: editForm.guardian_contact,
      guardian_address: editForm.guardian_address,
    };

    if (editForm.profile_pic_base64 !== user.profile_pic_base64) {
      minorChanges.profile_pic_base64 = editForm.profile_pic_base64;
    }

    // Changes to users table fields require approval
    if (editForm.name !== user.name) majorChanges.name = editForm.name;
    if (editForm.email !== user.email) majorChanges.email = editForm.email;
    if (editForm.course !== user.course) majorChanges.course = editForm.course;
    if (editForm.year !== user.year) majorChanges.year = editForm.year;


    const res = await updateProfile(minorChanges, majorChanges, studentProfile);
    if (res.success) {
      alert(res.message);
      setShowEditModal(false);
    } else {
      alert(res.error);
    }
  };

  const handleAddListItem = (field) => {
    const value = prompt(`Add to ${field}:`);
    if (value) setEditForm({ ...editForm, [field]: [...editForm[field], value] });
  };

  const handleRemoveListItem = (field, index) => {
    const newList = [...editForm[field]];
    newList.splice(index, 1);
    setEditForm({ ...editForm, [field]: newList });
  };

  return (
    <div style={S.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <h1 style={{ ...S.pageTitle, marginBottom: 0 }}>Student Profile</h1>
        <button style={S.editButton} onClick={() => setShowEditModal(true)}>
          ✏️ Edit Profile
        </button>
      </div>

      <div style={S.profileHeader}>
        <div style={S.profileAvatar}>
          {user.profile_pic_base64 ? (
            <img src={user.profile_pic_base64} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            user.name?.charAt(0) || 'S'
          )}
        </div>
        <div style={S.profileInfo}>
          <h2 style={S.profileName}>{user.name}</h2>
          <p style={S.profileId}>Student ID: {user.user_id || user.id}</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <span style={S.statusBadge}>CCS Student</span>
            <span style={{ ...S.statusBadge, backgroundColor: '#4e73df' }}>{user.course}</span>
            <span style={{ ...S.statusBadge, backgroundColor: '#858796' }}>{user.year}</span>
          </div>
        </div>
      </div>

      <div style={S.infoGrid}>
        {/* Personal Card */}
        <div style={S.infoCard}>
          <h3 style={S.cardTitle}>📋 Personal Information</h3>
          <div style={S.infoList}>
            <InfoItem label="Email" value={user.email} />
            <InfoItem label="Phone" value={sp.phone || 'Not set'} />
            <InfoItem label="Gender" value={sp.gender || 'Not set'} />
            <InfoItem label="Date of Birth" value={sp.birth_date ? new Date(sp.birth_date).toLocaleDateString() : 'Not set'} />
            <InfoItem label="Nationality" value={sp.nationality || 'Not set'} />
            <InfoItem label="Address" value={sp.address || 'Not set'} />
            <InfoItem label="Zip Code" value={sp.zip_code || 'Not set'} />
            <InfoItem label="Year Level" value={user.year || 'Not set'} />
          </div>
        </div>

        {/* Academic Card */}
        <div style={S.infoCard}>
          <h3 style={S.cardTitle}>🎓 Academic History</h3>
          <div style={S.infoList}>
            {sp.academic_history?.length > 0 ? (
              sp.academic_history.map((h, i) => (
                <div key={i} style={S.qualItem}>
                  <span style={S.qualDot}>•</span>
                  <span>{typeof h === 'string' ? h : `${h.school} - ${h.degree} (${h.year})`}</span>
                </div>
              ))
            ) : (
              <p style={{ color: '#858796', fontSize: '13px', margin: 0 }}>No academic records found.</p>
            )}
          </div>
        </div>

        {/* Competencies */}
        <div style={S.infoCard}>
          <h3 style={S.cardTitle}>⚡ Skills & Competencies</h3>
          <div style={S.tagCloud}>
            {sp.skills?.length > 0 ? (
              sp.skills.map((skill, i) => <span key={i} style={S.tag}>{skill}</span>)
            ) : (
              <p style={{ color: '#858796', fontSize: '13px', margin: 0 }}>No skills listed yet.</p>
            )}
          </div>
        </div>

        {/* Guardian Info */}
        <div style={S.infoCard}>
          <h3 style={S.cardTitle}>👨‍👩‍👧 Guardian Information</h3>
          <div style={S.infoList}>
            <InfoItem label="Guardian Name" value={sp.guardian_name || 'Not set'} />
            <InfoItem label="Relationship" value={sp.guardian_relationship || 'Not set'} />
            <InfoItem label="Guardian Contact" value={sp.guardian_contact || 'Not set'} />
            <InfoItem label="Guardian Address" value={sp.guardian_address || 'Not set'} />
          </div>
        </div>

        {/* Affiliations */}
        <div style={S.infoCard}>
          <h3 style={S.cardTitle}>🏛️ Affiliations & Activities</h3>
          <div style={S.infoList}>
             {sp.affiliations?.length > 0 ? (
              sp.affiliations.map((a, i) => (
                <div key={i} style={S.qualItem}>
                  <span style={{ ...S.qualDot, color: '#f6c23e' }}>★</span>
                  <span>{a}</span>
                </div>
              ))
            ) : (
              <p style={{ color: '#858796', fontSize: '13px', margin: 0 }}>No organizations joined.</p>
            )}
          </div>
        </div>

        {/* Disciplinary Summary */}
        <div style={{ ...S.infoCard, gridColumn: 'span 2', borderLeft: '4px solid #e74a3b' }}>
          <h3 style={{ ...S.cardTitle, color: '#e74a3b' }}>⚠️ Disciplinary Record</h3>
          {user.violations?.length > 0 ? (
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={S.vStatItem}>
                 <div style={S.vStatValue}>{user.violations.length}</div>
                 <div style={S.vStatLabel}>Total Offenses</div>
              </div>
              <div style={{ flex: 1 }}>
                {user.violations.slice(0, 2).map((v, i) => (
                  <div key={i} style={S.miniViolation}>
                    <span style={{ fontWeight: '700' }}>{v.type}</span>
                    <span style={{ color: '#858796' }}>{new Date(v.date_occurred).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#1cc88a' }}>
              <span style={{ fontSize: '24px' }}>🛡️</span>
              <p style={{ margin: 0, fontWeight: '700' }}>Exemplary standing. No disciplinary records found.</p>
            </div>
          )}
        </div>
      </div>

      {showEditModal && editForm && (
        <div style={S.modalOverlay}>
          <div style={S.modal}>
            <div style={S.modalHeader}>
              <h3 style={{ margin: 0 }}>Update Profile</h3>
              <button onClick={() => setShowEditModal(false)} style={S.closeButton}>×</button>
            </div>
            <div style={S.modalBody}>
              <div style={S.warningBox}>
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <p><strong>Admin Oversight:</strong> Changes to Name, Identity, Academic level, and Personal contact information require administrator approval. Only skills and profile pictures update instantly.</p>
              </div>

               {/* Avatar Section */}
               <div style={S.formGroup}>
                <label style={S.label}>Profile Picture</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ ...S.profileAvatar, width: '60px', height: '60px', fontSize: '24px' }}>
                    {editForm.profile_pic_base64 ? (
                      <img src={editForm.profile_pic_base64} alt="P" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (user.name?.charAt(0))}
                  </div>
                  <label style={S.uploadBtn}>
                    {editForm.profile_pic_base64 ? 'Change Photo' : 'Upload Photo'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              <div style={S.formRow}>
                <FormGroup label="Full Name (Requires Approval)">
                  <input style={S.input} value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                </FormGroup>
                <FormGroup label="Student ID (LOCKED)">
                  <input style={{ ...S.input, backgroundColor: '#f8f9fc', cursor: 'not-allowed' }} value={editForm.id} disabled title="ID cannot be changed by the user" />
                </FormGroup>
              </div>

              <div style={S.formRow}>
                <FormGroup label="Course (Requires Approval)">
                  <input style={S.input} value={editForm.course} onChange={e => setEditForm({...editForm, course: e.target.value})} />
                </FormGroup>
                <FormGroup label="Year Level (Requires Approval)">
                  <select style={S.input} value={editForm.year} onChange={e => setEditForm({...editForm, year: e.target.value})}>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </FormGroup>
              </div>

              <div style={S.formRow}>
                <FormGroup label="Phone">
                  <input style={S.input} value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                </FormGroup>
                <FormGroup label="Gender (Requires Approval)">
                  <select style={S.input} value={editForm.gender} onChange={e => setEditForm({...editForm, gender: e.target.value})}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </FormGroup>
              </div>

              <div style={S.formRow}>
                <FormGroup label="Nationality">
                  <input style={S.input} value={editForm.nationality} onChange={e => setEditForm({...editForm, nationality: e.target.value})} />
                </FormGroup>
                <FormGroup label="Zip Code (Requires Approval)">
                  <input style={S.input} value={editForm.zip_code} onChange={e => setEditForm({...editForm, zip_code: e.target.value})} />
                </FormGroup>
              </div>

              <FormGroup label="Home Address">
                <input style={S.input} value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} />
              </FormGroup>

              <h4 style={S.subTitle}>👨‍👩‍👧 Guardian Information (Requires Approval)</h4>
              <div style={S.formRow}>
                <FormGroup label="Guardian Name">
                  <input style={S.input} value={editForm.guardian_name} onChange={e => setEditForm({...editForm, guardian_name: e.target.value})} />
                </FormGroup>
                <FormGroup label="Relationship to Student">
                  <input style={S.input} value={editForm.guardian_relationship} onChange={e => setEditForm({...editForm, guardian_relationship: e.target.value})} placeholder="e.g. Mother, Father, Uncle" />
                </FormGroup>
              </div>
              <div style={S.formRow}>
                <FormGroup label="Guardian Contact Number">
                  <input style={S.input} value={editForm.guardian_contact} onChange={e => setEditForm({...editForm, guardian_contact: e.target.value})} />
                </FormGroup>
                <FormGroup label="Guardian Address">
                  <input style={S.input} value={editForm.guardian_address} onChange={e => setEditForm({...editForm, guardian_address: e.target.value})} />
                </FormGroup>
              </div>

              {/* Dynamic Lists */}
              <div style={{ marginTop: '24px' }}>
                <h4 style={S.subTitle}>Academic, Social, & Competencies</h4>
                <ListEditor 
                    label="Academic History" 
                    items={editForm.academic_history} 
                    onRemove={i => handleRemoveListItem('academic_history', i)}
                    onAdd={() => handleAddListItem('academic_history')}
                />
                <ListEditor 
                    label="Skills & Tools" 
                    items={editForm.skills} 
                    onRemove={i => handleRemoveListItem('skills', i)}
                    onAdd={() => handleAddListItem('skills')}
                />
                <ListEditor 
                    label="Affiliations" 
                    items={editForm.affiliations} 
                    onRemove={i => handleRemoveListItem('affiliations', i)}
                    onAdd={() => handleAddListItem('affiliations')}
                />
              </div>
            </div>
            <div style={S.modalFooter}>
              <button onClick={() => setShowEditModal(false)} style={S.cancelButton}>Cancel</button>
              <button 
                style={S.saveButton} 
                onClick={handleSave}
              >
                Request Updates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div style={S.infoItem}>
    <span style={S.infoLabel}>{label}</span>
    <span style={S.infoValue}>{value}</span>
  </div>
);

const FormGroup = ({ label, children }) => (
  <div style={S.formGroup}>
    <label style={S.label}>{label}</label>
    {children}
  </div>
);

const ListEditor = ({ label, items, onAdd, onRemove }) => (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
        <label style={S.label}>{label}</label>
        <button onClick={onAdd} style={S.actionBtnMini}>+ Add</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {items?.map((item, i) => (
          <div key={i} style={S.listItem}>
            <span style={{ fontSize: '13px' }}>{item}</span>
            <button onClick={() => onRemove(i)} style={S.removeBtnMini}>×</button>
          </div>
        ))}
      </div>
    </div>
);

const S = {
  container: { maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' },
  pageTitle: { fontSize: '24px', fontWeight: '700', color: '#1f2f70' },
  loading: { textAlign: 'center', padding: '60px', color: '#858796' },
  
  profileHeader: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
    gap: '24px', backgroundColor: 'white', borderRadius: '16px', padding: '32px',
    marginBottom: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
  },
  profileAvatar: {
    width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#4e73df',
    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '48px', fontWeight: '700', flexShrink: 0, border: '4px solid #f8f9fc'
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: '24px', fontWeight: '800', color: '#1f2f70', margin: 0 },
  profileId: { fontSize: '14px', color: '#858796', marginTop: '4px' },
  statusBadge: { display: 'inline-block', padding: '4px 12px', backgroundColor: '#1cc88a', color: 'white', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' },
  
  editButton: { padding: '8px 16px', backgroundColor: '#1f2f70', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },
  
  infoGrid: { display: 'flex', flexDirection: 'column', gap: '20px' },
  infoCard: { backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' },
  cardTitle: { fontSize: '17px', fontWeight: '700', color: '#1f2f70', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid #f8f9fc' },
  
  infoList: { display: 'flex', flexDirection: 'column', gap: '14px' },
  infoItem: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f8f9fc', paddingBottom: '8px' },
  infoLabel: { color: '#858796', fontSize: '13px', fontWeight: '500' },
  infoValue: { color: '#1f2f70', fontSize: '13px', fontWeight: '700' },
  
  tagCloud: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  tag: { padding: '6px 14px', backgroundColor: '#f0f2ff', color: '#4e73df', borderRadius: '10px', fontSize: '12px', fontWeight: '700' },
  
  qualItem: { display: 'flex', gap: '10px', alignItems: 'center', fontSize: '13px', color: '#5a5c69' },
  qualDot: { color: '#1cc88a', fontSize: '20px' },
  
  vStatItem: { padding: '16px', backgroundColor: '#fff5f5', borderRadius: '16px', textAlign: 'center', minWidth: '120px' },
  vStatValue: { fontSize: '24px', fontWeight: '800', color: '#e74a3b' },
  vStatLabel: { fontSize: '10px', color: '#c53030', fontWeight: '700', textTransform: 'uppercase' },
  miniViolation: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #ffebea', fontSize: '13px' },
  
  // Modal
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(31, 47, 112, 0.4)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 },
  modal: { backgroundColor: 'white', borderRadius: '24px', width: 'min(95%, 650px)', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' },
  modalHeader: { padding: '24px 32px', borderBottom: '1px solid #f0f2f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  closeButton: { background: 'none', border: 'none', fontSize: '28px', color: '#b7b9cc', cursor: 'pointer' },
  warningBox: { display: 'flex', gap: '12px', padding: '16px', backgroundColor: '#fff8e1', color: '#856404', borderRadius: '12px', marginBottom: '24px', alignItems: 'center', fontSize: '12px' },
  modalBody: { padding: '32px' },
  formRow: { display: 'flex', flexWrap: 'wrap', gap: '16px' },
  formGroup: { flex: '1 1 250px', marginBottom: '16px' },
  label: { display: 'block', fontSize: '12px', fontWeight: '700', color: '#858796', textTransform: 'uppercase', marginBottom: '8px' },
  input: { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #d1d3e2', fontSize: '14px', color: '#1f2f70', boxSizing: 'border-box' },
  modalFooter: { padding: '24px 32px', borderTop: '1px solid #f0f2f5', display: 'flex', justifyContent: 'flex-end', gap: '12px' },
  cancelButton: { padding: '10px 20px', background: 'none', border: 'none', color: '#858796', fontWeight: '600', cursor: 'pointer' },
  saveButton: { padding: '10px 24px', backgroundColor: '#1cc88a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' },
  uploadBtn: { padding: '8px 16px', backgroundColor: '#f8f9fc', border: '1px solid #4e73df', color: '#4e73df', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
  subTitle: { fontSize: '14px', fontWeight: '800', color: '#1f2f70', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.5px' },
  
  actionBtnMini: { padding: '4px 10px', backgroundColor: '#f0f2ff', border: 'none', borderRadius: '6px', fontSize: '11px', color: '#4e73df', fontWeight: '700', cursor: 'pointer' },
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#f8f9fc', borderRadius: '10px' },
  removeBtnMini: { background: 'none', border: 'none', color: '#e74a3b', fontSize: '18px', cursor: 'pointer' }
};

// Add desktop media query
if (typeof window !== 'undefined') {
  const mq = window.matchMedia('(min-width: 1024px)');
  const updateLayout = (e) => {
    S.profileHeader.flexDirection = e.matches ? 'row' : 'column';
    S.profileHeader.textAlign = e.matches ? 'left' : 'center';
    S.infoGrid.display = 'grid';
    S.infoGrid.gridTemplateColumns = e.matches ? 'repeat(2, 1fr)' : '1fr';
  };
  mq.addListener(updateLayout);
  updateLayout(mq);
}

export default StudentInfo;
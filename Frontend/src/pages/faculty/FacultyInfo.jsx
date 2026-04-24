import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const FacultyInfo = () => {
  const { user, updateProfile } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [profilePic, setProfilePic] = useState(user?.profilePic || null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, profilePic: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.name,
    facultyId: user?.id,
    email: user?.email,
    contact: user?.phone || '',
    address: user?.address || '',
    birthDate: user?.birth_date || '',
    nationality: user?.nationality || '',
    gender: user?.gender || '',
    zip_code: user?.zip_code || '',
  });

  const [emergencyContact, setEmergencyContact] = useState({
    name: user?.emergency_contact_name || '',
    relationship: user?.emergency_contact_relationship || '',
    number: user?.emergency_contact_number || '',
    address: user?.emergency_contact_address || '',
  });

  const [employmentInfo, setEmploymentInfo] = useState({
    department: user?.department,
    position: '',
    specialization: user?.specialization,
    employmentStatus: '',
    dateHired: '',
    yearsOfService: '',
    advisorOf: ''
  });

  const [currentCourses, setCurrentCourses] = useState([]);

  const [qualifications, setQualifications] = useState(user?.qualifications || []);
  const [showQualModal, setShowQualModal] = useState(false);
  const [newQualInput, setNewQualInput] = useState('');

  const handleOpenQualModal = () => {
    setNewQualInput('');
    setShowQualModal(true);
  };

  const handleAddQualification = () => {
    if (newQualInput.trim()) {
      setEditForm(prev => ({ ...prev, qualifications: [...prev.qualifications, newQualInput.trim()] }));
      setShowQualModal(false);
      setNewQualInput('');
    }
  };

  const handleRemoveQualification = (index) => {
    const newQuals = [...editForm.qualifications];
    newQuals.splice(index, 1);
    setEditForm(prev => ({ ...prev, qualifications: newQuals }));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <h1 style={{ ...styles.pageTitle, marginBottom: 0 }}>Faculty Information</h1>
        <button 
          style={styles.editButton} 
          onClick={() => {
            setEditForm({
              fullName: personalInfo.fullName || '',
              facultyId: personalInfo.facultyId || '',
              email: personalInfo.email || '',
              contact: personalInfo.contact || '',
              address: personalInfo.address || '',
              gender: personalInfo.gender || '',
              zip_code: personalInfo.zip_code || '',
              department: employmentInfo.department || '',
              specialization: employmentInfo.specialization || '',
              profilePic: profilePic,
              qualifications: qualifications || [],
              emergency_contact_name: emergencyContact.name || '',
              emergency_contact_relationship: emergencyContact.relationship || '',
              emergency_contact_number: emergencyContact.number || '',
              emergency_contact_address: emergencyContact.address || '',
            });
            setShowEditModal(true);
          }}
        >
          ✏️ Edit Profile
        </button>
      </div>

      <div style={styles.profileHeader}>
        <div style={styles.profileAvatar}>
          {profilePic ? (
            <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            personalInfo.fullName?.charAt(0) || 'F'
          )}
        </div>
        <div style={styles.profileInfo}>
          <h2 style={styles.profileName}>{personalInfo.fullName}</h2>
          <p style={styles.profileId}>Faculty ID: {user?.user_id || user?.id}</p>
          <span style={styles.statusBadge}>Active</span>
        </div>
      </div>

      <div style={styles.infoGrid}>
        <div style={styles.infoCard}>
          <h3 style={styles.cardTitle}>📋 Personal Information</h3>
          <div style={styles.infoList}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Email:</span>
              <span>{personalInfo.email}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Contact:</span>
              <span>{personalInfo.contact || 'Not set'}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Gender:</span>
              <span>{personalInfo.gender || 'Not set'}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Address:</span>
              <span>{personalInfo.address || 'Not set'}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Zip Code:</span>
              <span>{personalInfo.zip_code || 'Not set'}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Birth Date:</span>
              <span>{personalInfo.birthDate || 'Not set'}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Nationality:</span>
              <span>{personalInfo.nationality || 'Not set'}</span>
            </div>
          </div>
        </div>

        {/* Emergency Contact Card */}
        <div style={styles.infoCard}>
          <h3 style={styles.cardTitle}>🚨 Emergency Contact</h3>
          <div style={styles.infoList}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Name:</span>
              <span>{emergencyContact.name || 'Not set'}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Relationship:</span>
              <span>{emergencyContact.relationship || 'Not set'}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Contact Number:</span>
              <span>{emergencyContact.number || 'Not set'}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Address:</span>
              <span>{emergencyContact.address || 'Not set'}</span>
            </div>
          </div>
        </div>

        <div style={styles.infoCard}>
          <h3 style={styles.cardTitle}>💼 Employment Details</h3>
          <div style={styles.infoList}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Department:</span>
              <span>{employmentInfo.department}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Position:</span>
              <span>{employmentInfo.position}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Specialization:</span>
              <span>{employmentInfo.specialization}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Status:</span>
              <span>{employmentInfo.employmentStatus}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Date Hired:</span>
              <span>{employmentInfo.dateHired}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Years of Service:</span>
              <span>{employmentInfo.yearsOfService} years</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Advisor of:</span>
              <span>{employmentInfo.advisorOf}</span>
            </div>
          </div>
        </div>

        <div style={styles.coursesCard}>
          <h3 style={styles.cardTitle}>📚 Current Courses</h3>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Course Code</th>
                  <th style={styles.th}>Course Title</th>
                  <th style={styles.th}>Schedule</th>
                  <th style={styles.th}>Students</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentCourses.length > 0 ? (
                  currentCourses.map((course, index) => (
                    <tr key={index}>
                      <td style={styles.td}>{course.code}</td>
                      <td style={styles.td}>{course.title}</td>
                      <td style={styles.td}>{course.schedule}</td>
                      <td style={styles.td}>{course.students}</td>
                      <td style={styles.td}>
                        <button style={styles.actionButton}>View Class</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ ...styles.td, textAlign: 'center', color: '#858796', padding: '24px' }}>
                      No courses currently assigned.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={styles.qualificationsCard}>
          <h3 style={styles.cardTitle}>🎓 Qualifications & Education</h3>
          <div style={styles.qualificationsList}>
            {qualifications.length > 0 ? (
              qualifications.map((qual, index) => (
                <div key={index} style={styles.qualificationItem}>
                  <span style={styles.qualificationDot}>•</span>
                  <span>{qual}</span>
                </div>
              ))
            ) : (
              <p style={{ color: '#858796', fontSize: '14px', margin: 0 }}>No qualifications listed.</p>
            )}
          </div>
        </div>
      </div>

      {showEditModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Edit Profile</h3>
              <button onClick={() => setShowEditModal(false)} style={styles.closeButton}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.warningBox}>
                <span style={{fontSize: '20px'}}>⚠️</span>
                <p><strong>Note:</strong> Changes to Name, Email, ID, Department, and Specialization require administration approval. Contact, Address, and Profile Picture will update instantly.</p>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Profile Picture (Instant Update)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ ...styles.profileAvatar, width: '60px', height: '60px', fontSize: '24px' }}>
                    {editForm.profilePic ? (
                      <img src={editForm.profilePic} alt="Preview" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      personalInfo.fullName?.charAt(0) || 'F'
                    )}
                  </div>
                  <label style={styles.uploadBtn}>
                    {editForm.profilePic ? 'Change Picture' : 'Upload Picture'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              <div style={styles.warningBox}>
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <p><strong>Admin Oversight:</strong> Changes to Name, Identity, Specialization, and Contact details require administrator approval. Only qualifications and profile pictures update instantly.</p>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name (Requires Approval)</label>
                  <input style={styles.input} value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Faculty ID (LOCKED)</label>
                  <input style={{ ...styles.input, backgroundColor: '#f8f9fc', cursor: 'not-allowed' }} value={editForm.facultyId} disabled title="ID cannot be changed by the user" />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address (Requires Approval)</label>
                  <input style={styles.input} type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Department (Requires Approval)</label>
                  <input style={styles.input} value={editForm.department} onChange={e => setEditForm({...editForm, department: e.target.value})} />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Specialization (Requires Approval)</label>
                <input style={styles.input} value={editForm.specialization} onChange={e => setEditForm({...editForm, specialization: e.target.value})} />
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Contact Number (Requires Approval)</label>
                  <input style={styles.input} value={editForm.contact} onChange={e => setEditForm({...editForm, contact: e.target.value})} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Gender (Requires Approval)</label>
                  <select style={styles.input} value={editForm.gender} onChange={e => setEditForm({...editForm, gender: e.target.value})}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Home Address (Requires Approval)</label>
                  <input style={styles.input} value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Zip Code (Requires Approval)</label>
                  <input style={styles.input} value={editForm.zip_code} onChange={e => setEditForm({...editForm, zip_code: e.target.value})} />
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div style={{ marginTop: '8px', marginBottom: '16px', padding: '16px', backgroundColor: '#fff5f5', borderRadius: '12px', border: '1px solid #fecaca' }}>
                <h4 style={{ ...styles.label, color: '#c53030', fontSize: '13px', marginBottom: '16px' }}>🚨 EMERGENCY CONTACT (Requires Approval)</h4>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Emergency Contact Name</label>
                    <input style={styles.input} value={editForm.emergency_contact_name} onChange={e => setEditForm({...editForm, emergency_contact_name: e.target.value})} placeholder="Full name" />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Relationship</label>
                    <input style={styles.input} value={editForm.emergency_contact_relationship} onChange={e => setEditForm({...editForm, emergency_contact_relationship: e.target.value})} placeholder="e.g. Spouse, Parent, Sibling" />
                  </div>
                </div>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Contact Number</label>
                    <input style={styles.input} value={editForm.emergency_contact_number} onChange={e => setEditForm({...editForm, emergency_contact_number: e.target.value})} placeholder="Phone number" />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Address</label>
                    <input style={styles.input} value={editForm.emergency_contact_address} onChange={e => setEditForm({...editForm, emergency_contact_address: e.target.value})} placeholder="Home address" />
                  </div>
                </div>
              </div>

               <div style={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
                  <label style={styles.label}>Qualifications & Education (Requires Approval)</label>
                  <button 
                    onClick={handleOpenQualModal}
                    type="button"
                    style={{ ...styles.actionButton, backgroundColor: '#4e73df' }}
                  >
                    + Add Qualification
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {editForm.qualifications.map((qual, i) => (
                    <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#f8f9fc', padding: '8px 12px', borderRadius: '8px' }}>
                      <span style={{ flex: 1, fontSize: '14px' }}>{qual}</span>
                      <button 
                        onClick={() => handleRemoveQualification(i)}
                        style={{ background: 'none', border: 'none', color: '#e74a3b', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {editForm.qualifications.length === 0 && (
                    <p style={{ color: '#858796', fontSize: '13px', textAlign: 'center', fontStyle: 'italic' }}>No qualifications added.</p>
                  )}
                </div>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowEditModal(false)} style={styles.cancelButton}>Cancel</button>
              <button 
                style={styles.saveButton}
                onClick={async () => {
                  let minorChanges = {};
                  let majorChanges = {};

                  // Minor (instant) — profile picture
                  if (editForm.profilePic && editForm.profilePic !== user?.profile_pic_base64) {
                    minorChanges.profile_pic_base64 = editForm.profilePic;
                  }

                  // Major (require approval)
                  if (editForm.fullName !== user?.name) majorChanges.name = editForm.fullName;
                  if (editForm.email !== user?.email) majorChanges.email = editForm.email;
                  if (editForm.department !== user?.department) majorChanges.department = editForm.department;
                  
                  // Personal fields requiring approval
                  if (editForm.address !== (personalInfo.address || '')) majorChanges.address = editForm.address;
                  if (editForm.contact !== (personalInfo.contact || '')) majorChanges.phone = editForm.contact;
                  if (editForm.gender !== (personalInfo.gender || '')) majorChanges.gender = editForm.gender;
                  if (editForm.zip_code !== (personalInfo.zip_code || '')) majorChanges.zip_code = editForm.zip_code;
                  if (editForm.specialization !== (user?.specialization || '')) majorChanges.specialization = editForm.specialization;

                  // Emergency contact fields
                  if (editForm.emergency_contact_name !== (emergencyContact.name || '')) majorChanges.emergency_contact_name = editForm.emergency_contact_name;
                  if (editForm.emergency_contact_relationship !== (emergencyContact.relationship || '')) majorChanges.emergency_contact_relationship = editForm.emergency_contact_relationship;
                  if (editForm.emergency_contact_number !== (emergencyContact.number || '')) majorChanges.emergency_contact_number = editForm.emergency_contact_number;
                  if (editForm.emergency_contact_address !== (emergencyContact.address || '')) majorChanges.emergency_contact_address = editForm.emergency_contact_address;

                  // Check if qualifications changed
                  if (JSON.stringify(editForm.qualifications) !== JSON.stringify(user?.qualifications || [])) {
                    majorChanges.qualifications = editForm.qualifications;
                  }

                  const result = await updateProfile(minorChanges, majorChanges);
                  if (result.success) {
                    alert(result.message);
                    setShowEditModal(false);
                  } else {
                    alert('Error: ' + result.error);
                  }
                }}
              >
                Save Profile
              </button>
            </div>
          </div>
         </div>
      )}

      {/* New Qualification Modal */}
      {showQualModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modal, maxWidth: '400px' }}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>Add Qualification</h3>
              <button onClick={() => setShowQualModal(false)} style={styles.closeButton}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Qualification Title</label>
                <input 
                  style={styles.input} 
                  value={newQualInput} 
                  onChange={e => setNewQualInput(e.target.value)}
                  placeholder="e.g., PhD in Computer Science"
                  autoFocus
                />
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowQualModal(false)} style={styles.cancelButton}>Cancel</button>
              <button 
                onClick={handleAddQualification} 
                style={styles.saveButton}
                disabled={!newQualInput.trim()}
              >
                Add to List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  pageTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1f2f70',
    marginBottom: '24px'
  },
  profileHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease'
  },
  profileAvatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: '#1cc88a',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    fontWeight: '600',
    flexShrink: 0
  },
  profileInfo: {
    flex: 1
  },
  profileName: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#1f2f70',
    marginBottom: '4px'
  },
  profileId: {
    fontSize: '13px',
    color: '#858796',
    marginBottom: '8px'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: '#1cc88a',
    color: 'white',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600'
  },
  editButton: {
    padding: '8px 16px',
    backgroundColor: '#1f2f70',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
  },
  coursesCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    width: '100%',
    overflowX: 'auto'
  },
  qualificationsCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
  },
  cardTitle: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#1f2f70',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '2px solid #f8f9fc'
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '8px 0',
    borderBottom: '1px solid #f8f9fc',
    gap: '10px'
  },
  infoLabel: {
    color: '#858796',
    fontSize: '13px',
    fontWeight: '500',
    whiteSpace: 'nowrap'
  },
  tableContainer: {
    overflowX: 'auto',
    minWidth: '100%'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '600px'
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    backgroundColor: '#f8f9fc',
    color: '#5a5c69',
    fontSize: '13px',
    fontWeight: '600',
    borderBottom: '2px solid #e3e6f0'
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #e3e6f0',
    fontSize: '13px'
  },
  actionButton: {
    padding: '4px 10px',
    backgroundColor: '#1cc88a',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '11px',
    cursor: 'pointer'
  },
  qualificationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  qualificationItem: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: '#f8f9fc',
    borderRadius: '8px',
    fontSize: '13px'
  },
  qualificationDot: {
    color: '#1cc88a',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: 'min(95%, 600px)',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
    padding: '16px 20px', borderBottom: '1px solid #e3e6f0'
  },
  closeButton: {
    background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#858796'
  },
  modalBody: {
    padding: '20px'
  },
  modalFooter: {
    display: 'flex', justifyContent: 'flex-end', gap: '10px',
    padding: '16px 20px', borderTop: '1px solid #e3e6f0',
    flexWrap: 'wrap'
  },
  formRow: {
    display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px'
  },
  formGroup: {
    marginBottom: '16px',
    flex: '1 1 240px'
  },
  label: {
    display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#5a5c69'
  },
  input: {
    width: '100%', padding: '10px', border: '1px solid #d1d3e2', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box'
  },
  cancelButton: {
    padding: '10px 20px', backgroundColor: '#f8f9fc', color: '#5a5c69', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600'
  },
  saveButton: {
    padding: '10px 20px', backgroundColor: '#1cc88a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600'
  },
  warningBox: {
    display: 'flex', gap: '12px', padding: '12px',
    backgroundColor: '#fff3cd', color: '#856404', borderRadius: '8px',
    marginBottom: '20px', alignItems: 'center', fontSize: '12px'
  },
  uploadBtn: {
    padding: '8px 16px',
    backgroundColor: '#f8f9fc',
    color: '#1f2f70',
    border: '1px solid #1f2f70',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'inline-block'
  }
};

// Add desktop media query for FacultyInfo
if (typeof window !== 'undefined') {
  const mq = window.matchMedia('(min-width: 769px)');
  const updateLayout = (e) => {
    styles.profileHeader.flexDirection = e.matches ? 'row' : 'column';
    styles.profileHeader.textAlign = e.matches ? 'left' : 'center';
    styles.profileHeader.alignItems = e.matches ? 'center' : 'center';
    styles.infoGrid.display = 'grid';
    styles.infoGrid.gridTemplateColumns = e.matches ? 'repeat(2, 1fr)' : '1fr';
    styles.coursesCard.gridColumn = e.matches ? 'span 2' : 'auto';
    styles.qualificationsCard.gridColumn = e.matches ? 'span 2' : 'auto';
  };
  mq.addListener(updateLayout);
  updateLayout(mq);
}


export default FacultyInfo;
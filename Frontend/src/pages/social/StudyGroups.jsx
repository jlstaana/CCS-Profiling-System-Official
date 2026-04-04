import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';

const StudyGroups = () => {
  const { user } = useAuth();
  const { studyGroups, loading, joinStudyGroup, leaveStudyGroup, createStudyGroup } = useSocial();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    description: '',
    schedule: '',
    maxMembers: '10'
  });

  const handleJoinGroup = async (groupId) => {
    await joinStudyGroup(groupId);
  };

  const handleLeaveGroup = async (groupId) => {
    await leaveStudyGroup(groupId);
  };

  const handleCreateGroup = async () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    await createStudyGroup(formData);
    setSaving(false);
    setShowCreateModal(false);
    setFormData({ name: '', course: '', description: '', schedule: '', maxMembers: '10' });
  };

  const filteredGroups = filter === 'all'
    ? studyGroups
    : studyGroups.filter(g => g.course === filter);

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '16px'
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#1f2f70',
      margin: 0
    },
    createButton: {
      padding: '10px 20px',
      backgroundColor: '#1cc88a',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      ':hover': {
        backgroundColor: '#169b6b',
        transform: 'translateY(-2px)'
      }
    },
    filterBar: {
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
      flexWrap: 'wrap'
    },
    filterButton: {
      padding: '8px 20px',
      border: '1px solid #d1d3e2',
      borderRadius: '20px',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backgroundColor: 'white',
      color: '#5a5c69'
    },
    activeFilter: {
      backgroundColor: '#1f2f70',
      color: 'white',
      borderColor: '#1f2f70'
    },
    groupsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '20px'
    },
    groupCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
      transition: 'transform 0.3s ease',
      ':hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
      }
    },
    groupHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px'
    },
    groupName: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2f70',
      margin: 0,
      flex: 1
    },
    courseBadge: {
      padding: '4px 8px',
      backgroundColor: '#f8f9fc',
      color: '#1cc88a',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600'
    },
    createdBy: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '12px',
      fontSize: '13px',
      color: '#858796'
    },
    creatorAvatar: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      backgroundColor: '#4e73df',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: '600'
    },
    facultyAvatar: {
      backgroundColor: '#1cc88a'
    },
    description: {
      fontSize: '14px',
      color: '#5a5c69',
      lineHeight: '1.6',
      marginBottom: '16px'
    },
    tags: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
      marginBottom: '16px'
    },
    tag: {
      padding: '4px 8px',
      backgroundColor: '#f8f9fc',
      color: '#5a5c69',
      borderRadius: '4px',
      fontSize: '11px'
    },
    groupDetails: {
      backgroundColor: '#f8f9fc',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '16px'
    },
    detailRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
      fontSize: '13px',
      ':last-child': {
        marginBottom: 0
      }
    },
    detailLabel: {
      color: '#858796',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    membersList: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    memberAvatar: {
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      backgroundColor: '#4e73df',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '11px',
      fontWeight: '600',
      border: '2px solid white'
    },
    moreMembers: {
      fontSize: '11px',
      color: '#858796',
      marginLeft: '4px'
    },
    groupFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTop: '1px solid #f8f9fc',
      paddingTop: '16px'
    },
    joinButton: {
      padding: '8px 20px',
      backgroundColor: '#1cc88a',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      ':hover': {
        backgroundColor: '#169b6b',
        transform: 'translateY(-2px)'
      }
    },
    leaveButton: {
      padding: '8px 20px',
      backgroundColor: '#e74a3b',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      ':hover': {
        backgroundColor: '#c73a2b',
        transform: 'translateY(-2px)'
      }
    },
    viewButton: {
      padding: '8px 16px',
      backgroundColor: '#1f2f70',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '6px',
      fontSize: '13px',
      transition: 'all 0.3s ease',
      ':hover': {
        backgroundColor: '#2a3a8c'
      }
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      width: '90%',
      maxWidth: '500px',
      padding: '24px',
      maxHeight: '90vh',
      overflowY: 'auto'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1f2f70',
      margin: 0
    },
    modalClose: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#858796'
    },
    formGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      marginBottom: '6px',
      fontSize: '13px',
      fontWeight: '500',
      color: '#5a5c69'
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #d1d3e2',
      borderRadius: '6px',
      fontSize: '14px',
      outline: 'none',
      ':focus': {
        borderColor: '#1cc88a'
      }
    },
    select: {
      width: '100%',
      padding: '10px',
      border: '1px solid #d1d3e2',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: 'white'
    },
    textarea: {
      width: '100%',
      padding: '10px',
      border: '1px solid #d1d3e2',
      borderRadius: '6px',
      fontSize: '14px',
      resize: 'vertical',
      minHeight: '80px'
    },
    modalActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      marginTop: '20px'
    },
    cancelButton: {
      padding: '10px 20px',
      backgroundColor: '#f8f9fc',
      color: '#5a5c69',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer'
    },
    submitButton: {
      padding: '10px 20px',
      backgroundColor: '#1cc88a',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      ':disabled': {
        opacity: 0.5,
        cursor: 'not-allowed'
      }
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Study Groups</h1>
        <button
          style={styles.createButton}
          onClick={() => setShowCreateModal(true)}
        >
          + Create Study Group
        </button>
      </div>

      {/* Filter Bar */}
      <div style={styles.filterBar}>
        <button 
          style={{
            ...styles.filterButton,
            ...(filter === 'all' ? styles.activeFilter : {})
          }}
          onClick={() => setFilter('all')}
        >
          All Groups
        </button>
        <button 
          style={{
            ...styles.filterButton,
            ...(filter === 'CS 301' ? styles.activeFilter : {})
          }}
          onClick={() => setFilter('CS 301')}
        >
          CS 301
        </button>
        <button 
          style={{
            ...styles.filterButton,
            ...(filter === 'CS 302' ? styles.activeFilter : {})
          }}
          onClick={() => setFilter('CS 302')}
        >
          CS 302
        </button>
        <button 
          style={{
            ...styles.filterButton,
            ...(filter === 'CS 303' ? styles.activeFilter : {})
          }}
          onClick={() => setFilter('CS 303')}
        >
          CS 303
        </button>
        <button 
          style={{
            ...styles.filterButton,
            ...(filter === 'CS 304' ? styles.activeFilter : {})
          }}
          onClick={() => setFilter('CS 304')}
        >
          CS 304
        </button>
      </div>

      <div style={styles.groupsGrid}>
        {filteredGroups.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#858796' }}>No study groups found. Create one!</div>
        ) : filteredGroups.map(group => {
          const isJoined = group.isMember;
          const isCreator = group.createdBy === user?.name;

          return (
            <div key={group.id} style={styles.groupCard}>
              <div style={styles.groupHeader}>
                <h3 style={styles.groupName}>{group.name}</h3>
                <span style={styles.courseBadge}>{group.course}</span>
              </div>

              <div style={styles.createdBy}>
                <div style={styles.creatorAvatar}>
                  {(group.createdBy || 'U').charAt(0)}
                </div>
                <span>Created by {group.createdBy}</span>
              </div>

              <p style={styles.description}>{group.description}</p>

              <div style={styles.groupDetails}>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>👥 Members</span>
                  <span>{group.members}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>📅 Schedule</span>
                  <span>{group.schedule || 'TBD'}</span>
                </div>
              </div>

              <div style={styles.groupFooter}>
                {isCreator ? (
                  <span style={{ color: '#1cc88a', fontSize: '13px' }}>You created this group</span>
                ) : isJoined ? (
                  <button style={styles.leaveButton} onClick={() => handleLeaveGroup(group.id)}>
                    Leave Group
                  </button>
                ) : (
                  <button style={styles.joinButton} onClick={() => handleJoinGroup(group.id)}>
                    Join Group
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Create Study Group</h3>
              <button 
                style={styles.modalClose}
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Group Name</label>
              <input
                type="text"
                style={styles.input}
                placeholder="e.g., Database Systems Study Group"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Course</label>
              <select
                style={styles.select}
                value={formData.course}
                onChange={(e) => setFormData({...formData, course: e.target.value})}
              >
                <option value="">Select Course</option>
                <option value="CS 301">CS 301 - Database Systems</option>
                <option value="CS 302">CS 302 - Web Development</option>
                <option value="CS 303">CS 303 - Algorithms</option>
                <option value="CS 304">CS 304 - Software Engineering</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                style={styles.textarea}
                placeholder="Describe your study group's purpose and goals..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Schedule</label>
              <input
                type="text"
                style={styles.input}
                placeholder="e.g., Wednesdays at 3 PM"
                value={formData.schedule}
                onChange={(e) => setFormData({...formData, schedule: e.target.value})}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Maximum Members</label>
              <select
                style={styles.select}
                value={formData.maxMembers}
                onChange={(e) => setFormData({...formData, maxMembers: e.target.value})}
              >
                <option value="5">5 members</option>
                <option value="10">10 members</option>
                <option value="15">15 members</option>
                <option value="20">20 members</option>
                <option value="25">25 members</option>
              </select>
            </div>

            <div style={styles.modalActions}>
              <button 
                style={styles.cancelButton}
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                style={styles.submitButton}
                onClick={handleCreateGroup}
                disabled={!formData.name || saving}
              >
                {saving ? 'Creating…' : 'Create Group'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyGroups;
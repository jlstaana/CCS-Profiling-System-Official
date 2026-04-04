import React, { useState } from 'react';

const UsersManagement = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@ccs.edu',
      role: 'student',
      status: 'active',
      department: 'CS',
      yearLevel: '3rd Year',
      lastActive: '2 hours ago'
    },
    {
      id: 2,
      name: 'Dr. Maria Santos',
      email: 'maria.santos@ccs.edu',
      role: 'faculty',
      status: 'active',
      department: 'CS',
      specialization: 'Database Systems',
      lastActive: '1 hour ago'
    },
    {
      id: 3,
      name: 'Prof. Juan Dela Cruz',
      email: 'juan.delacruz@ccs.edu',
      role: 'faculty',
      status: 'active',
      department: 'IT',
      specialization: 'Networking',
      lastActive: '3 hours ago'
    },
    {
      id: 4,
      name: 'Alice Johnson',
      email: 'alice.johnson@ccs.edu',
      role: 'student',
      status: 'inactive',
      department: 'CS',
      yearLevel: '2nd Year',
      lastActive: '5 days ago'
    },
    {
      id: 5,
      name: 'Dr. Michael Chen',
      email: 'michael.chen@ccs.edu',
      role: 'admin',
      status: 'active',
      department: 'CS',
      position: 'Department Chair',
      lastActive: 'Just now'
    },
    {
      id: 6,
      name: 'Bob Williams',
      email: 'bob.williams@ccs.edu',
      role: 'student',
      status: 'active',
      department: 'IT',
      yearLevel: '1st Year',
      lastActive: '1 day ago'
    }
  ];

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    students: users.filter(u => u.role === 'student').length,
    faculty: users.filter(u => u.role === 'faculty').length,
    admins: users.filter(u => u.role === 'admin').length
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.role === filter;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
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

  const getStatusBadgeColor = (status) => {
    return status === 'active' ? '#1cc88a' : '#858796';
  };

  const UserModal = ({ user, onClose }) => {
    const isNew = !user;

    return (
      <div style={styles.modalOverlay}>
        <div style={styles.modal}>
          <div style={styles.modalHeader}>
            <h3>{isNew ? 'Add New User' : 'Edit User'}</h3>
            <button onClick={onClose} style={styles.closeButton}>×</button>
          </div>
          <div style={styles.modalBody}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>
              <input 
                type="text" 
                style={styles.input} 
                defaultValue={user?.name || ''}
                placeholder="Enter full name"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input 
                type="email" 
                style={styles.input} 
                defaultValue={user?.email || ''}
                placeholder="Enter email address"
              />
            </div>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Role</label>
                <select style={styles.select} defaultValue={user?.role || 'student'}>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Status</label>
                <select style={styles.select} defaultValue={user?.status || 'active'}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Department</label>
              <select style={styles.select} defaultValue={user?.department || 'CS'}>
                <option value="CS">Computer Science</option>
                <option value="IT">Information Technology</option>
                <option value="IS">Information Systems</option>
              </select>
            </div>
            {(!user || user.role === 'student') && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Year Level</label>
                <select style={styles.select} defaultValue={user?.yearLevel || '1st Year'}>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            )}
            {(!user || user.role === 'faculty') && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Specialization</label>
                <input 
                  type="text" 
                  style={styles.input} 
                  defaultValue={user?.specialization || ''}
                  placeholder="Enter specialization"
                />
              </div>
            )}
            {(!user || user.role === 'admin') && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Position</label>
                <input 
                  type="text" 
                  style={styles.input} 
                  defaultValue={user?.position || ''}
                  placeholder="Enter position"
                />
              </div>
            )}
            {isNew && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <input 
                  type="password" 
                  style={styles.input} 
                  placeholder="Enter password"
                />
              </div>
            )}
          </div>
          <div style={styles.modalFooter}>
            {!isNew && (
              <button style={styles.deleteButton}>Delete User</button>
            )}
            <button onClick={onClose} style={styles.cancelButton}>Cancel</button>
            <button style={styles.saveButton}>
              {isNew ? 'Create User' : 'Save Changes'}
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
          onClick={() => {
            setSelectedUser(null);
            setShowUserModal(true);
          }}
        >
          + Add New User
        </button>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👥</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{stats.total}</div>
            <div style={styles.statLabel}>Total Users</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{stats.active}</div>
            <div style={styles.statLabel}>Active Users</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🎓</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{stats.students}</div>
            <div style={styles.statLabel}>Students</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👨‍🏫</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{stats.faculty}</div>
            <div style={styles.statLabel}>Faculty</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👑</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{stats.admins}</div>
            <div style={styles.statLabel}>Admins</div>
          </div>
        </div>
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
          <button
            onClick={() => setFilter('all')}
            style={{
              ...styles.filterButton,
              backgroundColor: filter === 'all' ? '#1f2f70' : 'transparent',
              color: filter === 'all' ? 'white' : '#5a5c69'
            }}
          >
            All
          </button>
          <button
            onClick={() => setFilter('student')}
            style={{
              ...styles.filterButton,
              backgroundColor: filter === 'student' ? '#1f2f70' : 'transparent',
              color: filter === 'student' ? 'white' : '#5a5c69'
            }}
          >
            Students
          </button>
          <button
            onClick={() => setFilter('faculty')}
            style={{
              ...styles.filterButton,
              backgroundColor: filter === 'faculty' ? '#1f2f70' : 'transparent',
              color: filter === 'faculty' ? 'white' : '#5a5c69'
            }}
          >
            Faculty
          </button>
          <button
            onClick={() => setFilter('admin')}
            style={{
              ...styles.filterButton,
              backgroundColor: filter === 'admin' ? '#1f2f70' : 'transparent',
              color: filter === 'admin' ? 'white' : '#5a5c69'
            }}
          >
            Admins
          </button>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>User</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Department</th>
              <th style={styles.th}>Details</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Last Active</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} style={styles.tr}>
                <td style={styles.td}>
                  <div style={styles.userInfo}>
                    <div style={styles.userAvatar}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div style={styles.userName}>{user.name}</div>
                      <div style={styles.userEmail}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.roleBadge,
                    backgroundColor: getRoleBadgeColor(user.role)
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={styles.td}>{user.department}</td>
                <td style={styles.td}>
                  {user.role === 'student' && user.yearLevel}
                  {user.role === 'faculty' && user.specialization}
                  {user.role === 'admin' && user.position}
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusBadgeColor(user.status)
                  }}>
                    {user.status}
                  </span>
                </td>
                <td style={styles.td}>{user.lastActive}</td>
                <td style={styles.td}>
                  <button
                    style={styles.editButton}
                    onClick={() => {
                      setSelectedUser(user);
                      setShowUserModal(true);
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showUserModal && (
        <UserModal
          user={selectedUser}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1f2f70'
  },
  addButton: {
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
  },
  statIcon: {
    fontSize: '24px',
    width: '48px',
    height: '48px',
    backgroundColor: '#f8f9fc',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statContent: {
    flex: 1
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2f70',
    marginBottom: '4px'
  },
  statLabel: {
    fontSize: '12px',
    color: '#858796'
  },
  controls: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  searchBar: {
    flex: 1,
    minWidth: '300px'
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d3e2',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    ':focus': {
      borderColor: '#1f2f70'
    }
  },
  filterButtons: {
    display: 'flex',
    gap: '8px'
  },
  filterButton: {
    padding: '8px 16px',
    border: '1px solid #d1d3e2',
    borderRadius: '20px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'auto',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '1000px'
  },
  th: {
    textAlign: 'left',
    padding: '16px',
    backgroundColor: '#f8f9fc',
    color: '#5a5c69',
    fontSize: '14px',
    fontWeight: '600',
    borderBottom: '2px solid #e3e6f0'
  },
  tr: {
    ':hover': {
      backgroundColor: '#f8f9fc'
    }
  },
  td: {
    padding: '16px',
    borderBottom: '1px solid #e3e6f0',
    fontSize: '14px'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#1f2f70',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '16px'
  },
  userName: {
    fontWeight: '600',
    color: '#1f2f70',
    marginBottom: '4px'
  },
  userEmail: {
    fontSize: '12px',
    color: '#858796'
  },
  roleBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  editButton: {
    padding: '6px 12px',
    backgroundColor: '#1f2f70',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
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
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e3e6f0'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#858796'
  },
  modalBody: {
    padding: '20px'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    padding: '20px',
    borderTop: '1px solid #e3e6f0'
  },
  formGroup: {
    marginBottom: '16px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#5a5c69'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #d1d3e2',
    borderRadius: '6px',
    fontSize: '14px'
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #d1d3e2',
    borderRadius: '6px',
    fontSize: '14px'
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#f8f9fc',
    color: '#5a5c69',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  saveButton: {
    padding: '10px 20px',
    backgroundColor: '#1cc88a',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#169b6b'
    }
  },
  deleteButton: {
    padding: '10px 20px',
    backgroundColor: '#e74a3b',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    marginRight: 'auto',
    ':hover': {
      backgroundColor: '#c73a2b'
    }
  }
};

export default UsersManagement;
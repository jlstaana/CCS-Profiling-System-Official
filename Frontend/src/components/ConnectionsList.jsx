import React, { useState } from 'react';
import ConnectButton from './ConnectButton';

const ConnectionsList = ({ users, connections = [], onConnect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState('all'); // all, connections, suggestions

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const connectedUsers = filteredUsers.filter(u => connections.includes(u.id));
  const suggestions = filteredUsers.filter(u => !connections.includes(u.id));

  const getTabUsers = () => {
    switch(tab) {
      case 'connections': return connectedUsers;
      case 'suggestions': return suggestions;
      default: return filteredUsers;
    }
  };

  const mockUsers = users || [];

  const styles = {
    container: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
      overflow: 'hidden'
    },
    header: {
      padding: '20px',
      borderBottom: '1px solid #e3e6f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2f70',
      margin: 0
    },
    count: {
      backgroundColor: '#1cc88a',
      color: 'white',
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: '600'
    },
    search: {
      margin: '20px',
      position: 'relative'
    },
    searchInput: {
      width: '100%',
      padding: '12px 16px 12px 40px',
      border: '1px solid #d1d3e2',
      borderRadius: '25px',
      fontSize: '14px',
      outline: 'none',
      ':focus': {
        borderColor: '#4e73df'
      }
    },
    searchIcon: {
      position: 'absolute',
      left: '20px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#858796'
    },
    tabs: {
      display: 'flex',
      padding: '0 20px',
      borderBottom: '1px solid #f8f9fc'
    },
    tab: {
      padding: '12px 20px',
      border: 'none',
      background: 'none',
      fontSize: '14px',
      cursor: 'pointer',
      color: '#858796',
      borderBottom: tab === 'all' ? '3px solid #1f2f70' : 'none',
      ':hover': {
        color: '#1f2f70'
      }
    },
    activeTab: {
      color: '#1f2f70',
      fontWeight: '600'
    },
    list: {
      maxHeight: '400px',
      overflowY: 'auto'
    },
    user: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px 20px',
      borderBottom: '1px solid #f8f9fc',
      ':hover': {
        backgroundColor: '#f8f9fc'
      }
    },
    avatar: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      backgroundColor: '#4e73df',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: '600'
    },
    info: {
      flex: 1
    },
    name: {
      fontSize: '15px',
      fontWeight: '600',
      color: '#1f2f70',
      marginBottom: '2px'
    },
    meta: {
      fontSize: '13px',
      color: '#858796',
      display: 'flex',
      gap: '8px'
    },
    roleBadge: {
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '600',
      backgroundColor: '#e8f4fd'
    },
    facultyRole: {
      backgroundColor: '#d4edda'
    },
    empty: {
      textAlign: 'center',
      padding: '40px 20px',
      color: '#858796'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Academic Network</h3>
        <div style={styles.count}>{getTabUsers().length}</div>
      </div>
      
      <div style={styles.search}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          type="text"
          placeholder="Search people by name or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.tabs}>
        <button style={{...styles.tab, ...(tab === 'all' && styles.activeTab)}} onClick={() => setTab('all')}>
          All
        </button>
        <button style={{...styles.tab, ...(tab === 'connections' && styles.activeTab)}} onClick={() => setTab('connections')}>
          Connections
        </button>
        <button style={{...styles.tab, ...(tab === 'suggestions' && styles.activeTab)}} onClick={() => setTab('suggestions')}>
          Suggestions
        </button>
      </div>

      <div style={styles.list}>
        {getTabUsers().length > 0 ? (
          getTabUsers().map(user => (
            <div key={user.id} style={styles.user}>
              <div style={styles.avatar}>{user.avatar}</div>
              <div style={styles.info}>
                <div style={styles.name}>{user.name}</div>
                <div style={styles.meta}>
                  <span style={{
                    ...styles.roleBadge,
                    ...(user.role === 'faculty' && styles.facultyRole)
                  }}>
                    {user.role}
                  </span>
                  <span>• {user.department}</span>
                </div>
              </div>
              <ConnectButton 
                userName={user.name} 
                connected={connections.includes(user.id)}
                onConnect={() => onConnect(user.id)}
              />
            </div>
          ))
        ) : (
          <div style={styles.empty}>
            No users found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionsList;


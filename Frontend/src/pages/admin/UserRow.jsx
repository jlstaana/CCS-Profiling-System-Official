import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserRow = ({ user, onEdit }) => {
  const navigate = useNavigate();

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin': return '#e74a3b';
      case 'faculty': return '#1cc88a';
      case 'student': return '#4e73df';
      default: return '#858796';
    }
  };

  const handleRowClick = () => {
    navigate(`/users/${user.id}`);
  };

  return (
    <tr style={styles.tr} onClick={handleRowClick} className="user-row">
      <td style={styles.td}>
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>
            {user.profile_pic_base64 ? (
              <img src={user.profile_pic_base64} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div style={styles.userName}>{user.name}</div>
            <div style={styles.userEmail}>{user.email}</div>
          </div>
        </div>
      </td>
      <td style={styles.td}>
        <code style={{ fontSize: '13px', color: '#1f2f70', fontWeight: '600' }}>
          {user.user_id || user.id}
        </code>
      </td>
      <td style={styles.td}>
        <span style={{ ...styles.roleBadge, backgroundColor: getRoleBadgeColor(user.role) }}>
          {user.role}
        </span>
      </td>
      <td style={styles.td}>{user.department || '—'}</td>
      <td style={styles.td}>{user.course || '—'}</td>
      <td style={styles.td}>{new Date(user.created_at).toLocaleDateString()}</td>
      <td style={styles.td} onClick={(e) => e.stopPropagation()}>
        <button
          style={styles.editButton}
          onClick={() => onEdit(user)}
        >
          Edit
        </button>
      </td>
    </tr>
  );
};

const styles = {
  tr: { transition: 'background 0.15s', cursor: 'pointer' },
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
  editButton: { padding: '5px 12px', backgroundColor: '#1f2f70', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }
};

export default UserRow;

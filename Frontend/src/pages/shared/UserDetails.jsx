import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app we'd fetch specific user info by ID here
    // e.g., axios.get(`/admin/users/${id}`)
    const fetchUser = async () => {
      try {
        const res = await axios.get(`/admin/users`); 
        // We do a hacky find here just since we don't know if /admin/users/:id endpoint is active
        const found = res.data.find(u => u.id.toString() === id);
        setUser(found || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) return <div style={styles.container}>Loading user details...</div>;
  if (!user) return <div style={styles.container}>User not found.</div>;

  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={() => navigate(-1)}>
        ← Back to Users
      </button>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.avatar}>
            {user.profile_pic_base64 ? (
              <img src={user.profile_pic_base64} alt={user.name} style={styles.avatarImg} />
            ) : (
              <span style={styles.avatarInitial}>{user.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <h2 style={styles.name}>{user.name}</h2>
            <p style={styles.role}>{user.role.toUpperCase()}</p>
          </div>
        </div>
        
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <span style={styles.label}>Email:</span>
            <span style={styles.value}>{user.email}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.label}>Department:</span>
            <span style={styles.value}>{user.department || 'N/A'}</span>
          </div>
          {user.role === 'student' && (
            <div style={styles.infoItem}>
              <span style={styles.label}>Course:</span>
              <span style={styles.value}>{user.course || 'N/A'}</span>
            </div>
          )}
          <div style={styles.infoItem}>
            <span style={styles.label}>Joined:</span>
            <span style={styles.value}>{new Date(user.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {user.bio && (
          <div style={styles.bioSection}>
            <h3 style={styles.bioTitle}>Biography</h3>
            <p style={styles.bioText}>{user.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    maxWidth: '800px',
    margin: '0 auto'
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#1f2f70',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '20px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid #eee'
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#1f2f70',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  avatarInitial: {
    color: 'white',
    fontSize: '32px',
    fontWeight: 'bold'
  },
  name: {
    margin: '0 0 5px 0',
    fontSize: '24px',
    color: '#333'
  },
  role: {
    margin: 0,
    color: '#888',
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '1px'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '30px'
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontSize: '12px',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  value: {
    fontSize: '16px',
    color: '#333',
    fontWeight: '500'
  },
  bioSection: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #eee'
  },
  bioTitle: {
    fontSize: '16px',
    color: '#333',
    marginBottom: '10px'
  },
  bioText: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.6'
  }
};

export default UserDetails;

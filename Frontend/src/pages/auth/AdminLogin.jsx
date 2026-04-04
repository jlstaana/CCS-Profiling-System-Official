import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginLayout from './LoginLayout';
import styles from '../../styles/Login.module.css';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const email = username.includes('@') ? username : `${username}@admin.ccs.edu`;
    const res = await login(email, password);
    
    if (res.success) {
      if (res.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        setError('Unauthorized Access: Administrative credentials required.');
      }
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <LoginLayout 
      role="Administrator"
      title="System Governance"
      subtitle="Administrative access to CCS Profiling & Governance tools."
      welcomeTitle="Oversee the Ecosystem."
      welcomeDesc="Your oversight ensures the integrity and growth of our college profiling standards. Authenticate to access the high-level dashboard."
    >
      {error && (
        <div className={styles.errorBox}>
          <span>🛡️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.inputField}>
          <label className={styles.label}>Admin Identifier</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>🔐</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              placeholder="Admin ID or Username"
              required
              disabled={loading}
              style={{ borderColor: '#36b9cc' }}
            />
          </div>
        </div>

        <div className={styles.inputField}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className={styles.label}>Root Password</label>
          </div>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>👁️‍🗨️</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
              required
              disabled={loading}
              style={{ borderColor: '#36b9cc' }}
            />
          </div>
        </div>

        <button 
          type="submit" 
          className={styles.submitBtn}
          disabled={loading}
          style={{ backgroundColor: '#2c3e50', border: '1px solid #34495e' }} // Admin Branding
        >
          {loading ? (
            <>Initializing Access...</>
          ) : (
            <>Enter System Dashboard</>
          )}
        </button>
      </form>

      <div className={styles.footer}>
        <Link to="/student" className={styles.navLink}>Student Access</Link>
        <Link to="/faculty" className={styles.navLink}>Faculty Access</Link>
      </div>

      <div style={{ marginTop: '3rem', textAlign: 'center', opacity: 0.5 }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em' }}>
          HIGH-SECURITY ZONE • ENCRYPTED SESSION
        </p>
      </div>
    </LoginLayout>
  );
};

export default AdminLogin;
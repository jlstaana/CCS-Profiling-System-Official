import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginLayout from './LoginLayout';
import styles from '../../styles/Login.module.css';

const FacultyLogin = () => {
  const [facultyId, setFacultyId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const email = facultyId.includes('@') ? facultyId : `${facultyId}@ccs.edu`;
    const res = await login(email, password);
    
    if (res.success) {
      if (res.user.role === 'faculty') {
        navigate('/faculty-dashboard');
      } else {
        setError('Unauthorized: Access restricted to faculty accounts.');
      }
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <LoginLayout 
      role="Faculty"
      title="Faculty Portal"
      subtitle="Manage your academic profile, courses, and student interactions."
      welcomeTitle="Empowering Academic Excellence."
      welcomeDesc="As a faculty member, your expertise drives our community forward. Securely access your administrative tools and profile management."
    >
      {error && (
        <div className={styles.errorBox}>
          <span>⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.inputField}>
          <label className={styles.label}>Faculty ID / Email</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>👨‍🏫</span>
            <input
              type="text"
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
              className={styles.input}
              placeholder="e.g. FAC-2024-001"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className={styles.inputField}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className={styles.label}>Password</label>
          </div>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>🔑</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
        </div>

        <button 
          type="submit" 
          className={styles.submitBtn}
          disabled={loading}
          style={{ backgroundColor: '#1cc88a' }} // Faculty Branding
        >
          {loading ? (
            <>Verifying...</>
          ) : (
            <>Faculty Sign In</>
          )}
        </button>
      </form>

      <div className={styles.footer}>
        <Link to="/student" className={styles.navLink}>Student Portal</Link>
        <Link to="/admin" className={styles.navLink}>System Admin</Link>
      </div>

      <div style={{ marginTop: '2.5rem', textAlign: 'center', opacity: 0.6 }}>
        <p style={{ fontSize: '0.8rem' }}>
          Restricted access for authorized CCS Faculty personnel only.
        </p>
      </div>
    </LoginLayout>
  );
};

export default FacultyLogin;
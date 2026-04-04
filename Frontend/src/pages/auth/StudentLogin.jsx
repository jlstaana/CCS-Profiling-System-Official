import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginLayout from './LoginLayout';
import styles from '../../styles/Login.module.css';

const StudentLogin = () => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const email = studentId.includes('@') ? studentId : `${studentId}@ccs.edu`;
    const res = await login(email, password);
    
    if (res.success) {
      if (res.user.role === 'student') {
        navigate('/student-dashboard');
      } else {
        setError('Unauthorized: Access restricted to student accounts.');
      }
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <LoginLayout 
      role="Student"
      title="Student Portal"
      subtitle="Access your academic profile and keep your information up to date."
      welcomeTitle="Shape Your Future with CCS."
      welcomeDesc="Join the next generation of tech leaders. Your profile is the key to your academic and professional journey."
    >
      {error && (
        <div className={styles.errorBox}>
          <span>⚠️</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.inputField}>
          <label className={styles.label}>Student ID / Username</label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>👤</span>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className={styles.input}
              placeholder="e.g. CCS-2024-001"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className={styles.inputField}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className={styles.label}>Secure Password</label>
          </div>
          <div className={styles.inputWrapper}>
            <span className={styles.inputIcon}>🔒</span>
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
        >
          {loading ? (
            <>Authenticating...</>
          ) : (
            <>Sign In to Portal</>
          )}
        </button>
      </form>

      <div className={styles.footer}>
        <Link to="/faculty" className={styles.navLink}>Faculty Access</Link>
        <Link to="/admin" className={styles.navLink}>Admin Portal</Link>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: '#858796' }}>
          By signing in, you agree to the CCS Data Privacy Policy.
        </p>
      </div>
    </LoginLayout>
  );
};

export default StudentLogin;

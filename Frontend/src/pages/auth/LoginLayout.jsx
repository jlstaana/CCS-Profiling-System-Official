import React from 'react';
import styles from '../../styles/Login.module.css';

const LoginLayout = ({ children, role, title, subtitle, welcomeTitle, welcomeDesc }) => {
  // Use a high-quality fallback image if the local asset isn't served
  const bgImage = "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1920";

  return (
    <div className={styles.loginContainer}>
      {/* Left Side: Visual Hub */}
      <section className={styles.visualSide}>
        <img 
          src={bgImage} 
          alt="Academic Campus" 
          className={styles.visualBackground} 
        />
        <div className={styles.visualOverlay}></div>
        <div className={styles.visualContent}>
          <div className={styles.brandLogo}>
            <span role="img" aria-label="Logo">🏛️</span>
            <span>CCS PORTAL</span>
          </div>
          
          <div className={styles.welcomeText}>
            <div className={styles.roleIndicator}>{role} Access</div>
            <h1>{welcomeTitle}</h1>
            <p>{welcomeDesc}</p>
          </div>

          <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>
            © 2026 College of Computer Studies • Profiling System v2.0
          </div>
        </div>
      </section>

      {/* Right Side: Form Content */}
      <section className={styles.formSide}>
        <div className={styles.formCard}>
          <header className={styles.formHeader}>
            <h1 className={styles.formTitle}>{title}</h1>
            <p className={styles.formSubtitle}>{subtitle}</p>
          </header>
          
          {children}
        </div>
      </section>
    </div>
  );
};

export default LoginLayout;

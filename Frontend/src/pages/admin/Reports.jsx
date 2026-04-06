import React from 'react';

const Reports = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>System Reports</h1>
      <p style={styles.subtitle}>Confidential reports area. Restricted to Administrators.</p>
      
      <div style={styles.card}>
        <div style={styles.reportIcon}>📊</div>
        <h3 style={styles.reportTitle}>User Activity</h3>
        <p style={styles.reportDesc}>Monthly breakdown of active users and new sign-ups.</p>
        <button style={styles.button}>Generate Report</button>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '24px' },
  title: { color: '#1f2f70', fontSize: '28px', marginBottom: '8px' },
  subtitle: { color: '#666', marginBottom: '30px' },
  card: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    maxWidth: '400px',
    textAlign: 'center'
  },
  reportIcon: { fontSize: '48px', marginBottom: '16px' },
  reportTitle: { fontSize: '20px', marginBottom: '8px', color: '#333' },
  reportDesc: { color: '#666', marginBottom: '20px', fontSize: '14px' },
  button: {
    backgroundColor: '#1cc88a',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

export default Reports;

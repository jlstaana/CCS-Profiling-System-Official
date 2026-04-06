import React, { useState } from 'react';
import axios from 'axios';

const Reports = () => {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const generateReport = async () => {
    setGenerating(true);
    setError('');
    
    try {
      // Pull user data from backend
      const res = await axios.get('/admin/users');
      const users = res.data;
      
      if (!users || users.length === 0) {
        setError('No users found to generate a report.');
        return;
      }

      // Prepare CSV format
      const headers = ['ID', 'Name', 'Email', 'Role', 'Department', 'Course', 'Join Date'];
      const rows = users.map(u => [
        u.id || u.user_id || '',
        `"${u.name}"`, 
        `"${u.email}"`, 
        u.role || '',
        u.department || '', 
        u.course || '',
        new Date(u.created_at).toLocaleDateString()
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
      ].join('\n');

      // Trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `User_Activity_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error(err);
      setError('Failed to generate report. Make sure you are authenticated as an admin.');
    } finally {
      setGenerating(false);
    }
  };
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>System Reports</h1>
      <p style={styles.subtitle}>Confidential reports area. Restricted to Administrators.</p>
      
      <div style={styles.card}>
        <div style={styles.reportIcon}>📊</div>
        <h3 style={styles.reportTitle}>User Activity</h3>
        <p style={styles.reportDesc}>Monthly breakdown of active users and new sign-ups.</p>
        {error && <p style={{ color: 'red', fontSize: '12px' }}>{error}</p>}
        <button 
          style={styles.button} 
          onClick={generateReport}
          disabled={generating}
        >
          {generating ? 'Generating...' : 'Generate Report'}
        </button>
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
    fontWeight: 'bold',
    opacity: 0.9,
    width: '100%',
    marginTop: '10px'
  }
};

export default Reports;

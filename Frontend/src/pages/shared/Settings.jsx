import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');

  const S = {
    container: { maxWidth: '900px', margin: '0 auto', padding: '24px 16px' },
    header: { marginBottom: '32px' },
    title: { fontSize: '2rem', fontWeight: '800', color: '#1f2f70', margin: 0 },
    subtitle: { fontSize: '1rem', color: '#858796', marginTop: '4px' },
    
    layout: { display: 'grid', gridTemplateColumns: '250px 1fr', gap: '32px' },
    sidebar: { display: 'flex', flexDirection: 'column', gap: '8px' },
    sideBtn: { padding: '12px 16px', border: 'none', borderRadius: '12px', textAlign: 'left', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: '12px' },
    activeBtn: { backgroundColor: '#4e73df', color: 'white', boxShadow: '0 4px 12px rgba(78, 115, 223, 0.2)' },
    inactiveBtn: { backgroundColor: 'white', color: '#5a5c69', border: '1px solid #f0f2f5' },
    
    content: { backgroundColor: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #f0f2f5' },
    sectionTitle: { fontSize: '1.25rem', fontWeight: '700', color: '#1f2f70', marginBottom: '24px', borderBottom: '2px solid #f8f9fc', paddingBottom: '12px' },
    
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#858796', textTransform: 'uppercase', marginBottom: '8px' },
    input: { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #d1d3e2', fontSize: '1rem', color: '#1f2f70', outline: 'none', focus: { borderColor: '#4e73df' }, boxSizing: 'border-box' },
    
    saveBtn: { padding: '12px 32px', backgroundColor: '#4e73df', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease', marginTop: '16px' },
    
    dangerZone: { marginTop: '40px', padding: '24px', backgroundColor: '#fff5f5', borderRadius: '16px', border: '1px solid #fed7d7' },
    dangerTitle: { color: '#e53e3e', margin: '0 0 8px', fontSize: '1rem', fontWeight: '700' },
    dangerDesc: { color: '#c53030', fontSize: '0.9rem', margin: '0 0 16px' },
    dangerBtn: { padding: '10px 20px', backgroundColor: '#e53e3e', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' },
  };

  const renderAccount = () => (
    <div>
      <h3 style={S.sectionTitle}>Account Information</h3>
      <div style={S.formGroup}>
        <label style={S.label}>Full Name</label>
        <input style={S.input} type="text" defaultValue={user?.name} />
      </div>
      <div style={S.formGroup}>
        <label style={S.label}>Email Address</label>
        <input style={S.input} type="email" defaultValue={user?.email} />
      </div>
      <div style={S.formGroup}>
        <label style={S.label}>Role</label>
        <input style={{...S.input, backgroundColor: '#f8f9fc', cursor: 'not-allowed'}} type="text" value={user?.role?.toUpperCase()} readOnly />
      </div>
      <button style={S.saveBtn}>Update Profile</button>

      <div style={S.dangerZone}>
        <h4 style={S.dangerTitle}>Deactivate Account</h4>
        <p style={S.dangerDesc}>Once you deactivate your account, there is no going back. Please be certain.</p>
        <button style={S.dangerBtn}>Deactivate My Account</button>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div>
      <h3 style={S.sectionTitle}>Security Settings</h3>
      <div style={S.formGroup}>
        <label style={S.label}>Current Password</label>
        <input style={S.input} type="password" placeholder="••••••••" />
      </div>
      <div style={S.formGroup}>
        <label style={S.label}>New Password</label>
        <input style={S.input} type="password" />
      </div>
      <div style={S.formGroup}>
        <label style={S.label}>Confirm New Password</label>
        <input style={S.input} type="password" />
      </div>
      <button style={S.saveBtn}>Change Password</button>
    </div>
  );

  const renderNotifications = () => (
    <div>
      <h3 style={S.sectionTitle}>Notification Preferences</h3>
      <p style={{color: '#858796'}}>Manage how you receive alerts and updates from the system.</p>
      {[
        { t: 'Email Notifications', d: 'Receive summaries of social activity', val: true },
        { t: 'Browser Alerts', d: 'Get instant notifications for messages', val: true },
        { t: 'Marketing emails', d: 'Receive news about system updates', val: false },
      ].map((item, i) => (
        <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #f8f9fc'}}>
          <div>
            <div style={{fontWeight: '700', color: '#1f2f70'}}>{item.t}</div>
            <div style={{fontSize: '0.85rem', color: '#858796'}}>{item.d}</div>
          </div>
          <input type="checkbox" defaultChecked={item.val} style={{width: 20, height: 20}} />
        </div>
      ))}
      <button style={S.saveBtn}>Save Changes</button>
    </div>
  );

  return (
    <div style={S.container}>
      <div style={S.header}>
        <h1 style={S.title}>Settings</h1>
        <p style={S.subtitle}>Manage your account settings and set e-mail preferences.</p>
      </div>

      <div style={S.layout}>
        <aside style={S.sidebar}>
          <button 
            style={{...S.sideBtn, ...(activeTab === 'account' ? S.activeBtn : S.inactiveBtn)}}
            onClick={() => setActiveTab('account')}
          >
            👤 Account
          </button>
          <button 
            style={{...S.sideBtn, ...(activeTab === 'security' ? S.activeBtn : S.inactiveBtn)}}
            onClick={() => setActiveTab('security')}
          >
            🔒 Security
          </button>
          <button 
            style={{...S.sideBtn, ...(activeTab === 'notif' ? S.activeBtn : S.inactiveBtn)}}
            onClick={() => setActiveTab('notif')}
          >
            🔔 Notifications
          </button>
        </aside>

        <main style={S.content}>
          {activeTab === 'account' && renderAccount()}
          {activeTab === 'security' && renderSecurity()}
          {activeTab === 'notif' && renderNotifications()}
        </main>
      </div>
    </div>
  );
};

export default Settings;

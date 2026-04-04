import React, { useState } from 'react';

const ConnectButton = ({ userName, connected = false, onConnect }) => {
  const [localConnected, setLocalConnected] = useState(connected);
  const [requesting, setRequesting] = useState(false);

  const handleConnect = async () => {
    if (requesting) return;
    setRequesting(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
    setLocalConnected(true);
    onConnect?.();
    setRequesting(false);
  };

  const statusText = localConnected ? 'Connected' : 'Connect';
  const bgColor = localConnected ? '#1cc88a' : '#4e73df';

  const styles = {
    button: {
      padding: '8px 16px',
      backgroundColor: bgColor,
      color: 'white',
      border: 'none',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      whiteSpace: 'nowrap',
      ':hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      },
      ':disabled': {
        backgroundColor: '#a0a0a0',
        cursor: 'not-allowed',
        transform: 'none'
      }
    },
    icon: {
      fontSize: '14px'
    },
    spinner: {
      width: '14px',
      height: '14px',
      border: '2px solid rgba(255,255,255,0.3)',
      borderTop: '2px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }
  };

  return (
    <button 
      onClick={handleConnect} 
      disabled={localConnected || requesting}
      style={styles.button}
      title={localConnected ? 'Connection request sent' : 'Send connection request'}
    >
      {requesting ? (
        <span style={styles.spinner}></span>
      ) : localConnected ? (
        '👥'
      ) : (
        '➕'
      )}
      {statusText}
    </button>
  );
};

export default ConnectButton;


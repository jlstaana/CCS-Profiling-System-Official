import React, { useState } from 'react';

const ConnectButton = ({ 
  userName, 
  connected = false, 
  onConnect,
  variant = 'default', // 'default', 'icon', 'compact'
  size = 'md' // 'sm', 'md', 'lg'
}) => {
  const [localConnected, setLocalConnected] = useState(connected);
  const [requesting, setRequesting] = useState(false);

  const handleConnect = async () => {
    if (requesting || localConnected) return;
    
    setRequesting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLocalConnected(true);
    if (onConnect) {
      onConnect(userName);
    }
    setRequesting(false);
  };

  // Size mappings
  const sizeStyles = {
    sm: {
      padding: '4px 12px',
      fontSize: '11px',
      iconSize: '12px'
    },
    md: {
      padding: '8px 16px',
      fontSize: '13px',
      iconSize: '14px'
    },
    lg: {
      padding: '12px 24px',
      fontSize: '14px',
      iconSize: '16px'
    }
  };

  const variantStyles = {
    default: {
      width: 'auto'
    },
    icon: {
      width: '36px',
      height: '36px',
      padding: '8px',
      borderRadius: '50%',
      justifyContent: 'center'
    },
    compact: {
      padding: '4px 12px',
      fontSize: '11px'
    }
  };

  const statusText = localConnected ? 'Connected' : 'Connect';
  const bgColor = localConnected ? '#1cc88a' : '#4e73df';
  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];

  const styles = {
    button: {
      padding: currentSize.padding,
      backgroundColor: bgColor,
      color: 'white',
      border: 'none',
      borderRadius: variant === 'icon' ? '50%' : '20px',
      fontSize: currentSize.fontSize,
      fontWeight: '600',
      cursor: localConnected || requesting ? 'default' : 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: variant === 'icon' ? 'center' : 'flex-start',
      gap: '6px',
      whiteSpace: 'nowrap',
      width: currentVariant.width,
      height: variant === 'icon' ? currentVariant.width : 'auto',
      opacity: localConnected ? 0.9 : 1,
      ...(variant !== 'icon' && { minWidth: '100px' }),
      ':hover': !localConnected && !requesting ? {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        backgroundColor: localConnected ? '#169b6b' : '#2a3a8c'
      } : {}
    },
    icon: {
      fontSize: currentSize.iconSize
    },
    spinner: {
      width: currentSize.iconSize,
      height: currentSize.iconSize,
      border: `2px solid rgba(255,255,255,0.3)`,
      borderTop: '2px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }
  };

  // Add keyframes for spinner animation
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);

  const getIcon = () => {
    if (requesting) {
      return <span style={styles.spinner}></span>;
    }
    if (localConnected) {
      return <span style={styles.icon}>✓</span>;
    }
    if (variant === 'icon') {
      return <span style={styles.icon}>➕</span>;
    }
    return <span style={styles.icon}>👥</span>;
  };

  return (
    <button 
      onClick={handleConnect} 
      disabled={localConnected || requesting}
      style={styles.button}
      title={localConnected ? `Connected to ${userName}` : `Send connection request to ${userName}`}
    >
      {getIcon()}
      {variant !== 'icon' && !requesting && (
        <span>{statusText}</span>
      )}
      {variant !== 'icon' && requesting && (
        <span>Connecting...</span>
      )}
    </button>
  );
};

export default ConnectButton;
import React, { useState } from 'react';

const SocialButtons = ({ likes = 0, comments = 0, shares = 0, onLike, onComment, onShare, liked = false, compact = false }) => {
  const [localLiked, setLocalLiked] = useState(liked);

  const handleLike = () => {
    setLocalLiked(!localLiked);
    onLike?.(!localLiked);
  };

  const styles = {
    container: {
      display: 'flex',
      gap: compact ? '8px' : '12px',
      alignItems: 'center',
      marginTop: compact ? '4px' : '8px'
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: compact ? '4px 8px' : '6px 12px',
      background: 'none',
      border: 'none',
      borderRadius: '20px',
      fontSize: compact ? '12px' : '14px',
      cursor: 'pointer',
      color: '#858796',
      transition: 'all 0.3s ease',
      ':hover': {
        backgroundColor: '#f8f9fc',
        color: '#1f2f70'
      }
    },
    active: {
      color: '#e74a3b',
      fontWeight: '600'
    },
    count: {
      fontWeight: '500',
      fontSize: '12px'
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={handleLike} style={{...styles.button, ...(localLiked && styles.active)}}>
        {localLiked ? '❤️' : '🤍'} 
        <span style={styles.count}>{likes + (localLiked ? 1 : 0)}</span>
      </button>
      <button onClick={onComment} style={styles.button}>
        💬 <span style={styles.count}>{comments}</span>
      </button>
      <button onClick={onShare} style={styles.button}>
        ➤ <span style={styles.count}>{shares}</span>
      </button>
    </div>
  );
};

export default SocialButtons;


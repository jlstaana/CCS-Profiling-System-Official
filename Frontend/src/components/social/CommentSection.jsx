import React, { useState } from 'react';

const CommentSection = ({ comments = [], onAddComment }) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role?.toLowerCase()) {
      case 'student': return { backgroundColor: '#e8f5e9', color: '#1cc88a' };
      case 'faculty': return { backgroundColor: '#e3f2fd', color: '#4e73df' };
      case 'admin': return { backgroundColor: '#fff8e1', color: '#f6c23e' };
      default: return { backgroundColor: '#f8f9fc', color: '#858796' };
    }
  };

  const styles = {
    container: {
      marginTop: '16px',
      padding: '16px',
      backgroundColor: '#fafbfc',
      borderRadius: '16px',
      border: '1px solid #f0f2f5'
    },
    header: {
      fontSize: '0.9rem',
      fontWeight: '700',
      color: '#1f2f70',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    count: {
      backgroundColor: '#ebf0ff',
      color: '#4e73df',
      padding: '2px 8px',
      borderRadius: '10px',
      fontSize: '0.75rem'
    },
    commentsList: {
      maxHeight: '400px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      marginBottom: '20px',
      paddingRight: '4px'
    },
    comment: {
      display: 'flex',
      gap: '12px',
      backgroundColor: 'white',
      padding: '12px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
      border: '1px solid #f0f2f5'
    },
    avatar: {
      width: '32px',
      height: '32px',
      borderRadius: '8px',
      backgroundColor: '#f0f2f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.9rem',
      fontWeight: '700',
      flexShrink: 0,
      objectFit: 'cover'
    },
    commentContent: {
      flex: 1
    },
    authorRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '4px',
      flexWrap: 'wrap'
    },
    author: {
      fontWeight: '700',
      color: '#1f2f70',
      fontSize: '0.85rem'
    },
    roleBadge: {
      fontSize: '0.65rem',
      padding: '1px 6px',
      borderRadius: '4px',
      fontWeight: '800',
      textTransform: 'uppercase'
    },
    text: {
      color: '#4a5568',
      fontSize: '0.9rem',
      lineHeight: '1.5',
      marginBottom: '4px'
    },
    time: {
      fontSize: '0.7rem',
      color: '#94a3b8'
    },
    form: {
      display: 'flex',
      gap: '10px'
    },
    input: {
      flex: 1,
      padding: '10px 16px',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '0.9rem',
      outline: 'none',
      backgroundColor: 'white',
      transition: 'all 0.2s ease'
    },
    submit: {
      padding: '8px 16px',
      backgroundColor: '#4e73df',
      color: 'white',
      border: 'none',
      borderRadius: '10px',
      fontSize: '0.85rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    empty: {
      textAlign: 'center',
      padding: '32px',
      color: '#94a3b8',
      fontSize: '0.85rem',
      fontStyle: 'italic'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        💬 Conversation
        <span style={styles.count}>{comments.length}</span>
      </div>
      
      <div style={styles.commentsList}>
        {comments.length === 0 ? (
          <div style={styles.empty}>
            Be the first to share your thoughts!
          </div>
        ) : (
          comments.map((comment, index) => (
            <div key={comment.id || index} style={styles.comment}>
              {comment.author?.avatar ? (
                <img src={comment.author.avatar} alt="Avatar" style={styles.avatar} />
              ) : (
                <div style={styles.avatar}>
                  {comment.author?.name?.charAt(0) || '?'}
                </div>
              )}
              <div style={styles.commentContent}>
                <div style={styles.authorRow}>
                  <span style={styles.author}>{comment.author?.name}</span>
                  {comment.author?.role && (
                    <span style={{...styles.roleBadge, ...getRoleBadgeStyle(comment.author.role)}}>
                      {comment.author.role}
                    </span>
                  )}
                  <span style={styles.time}>{comment.timestamp || 'Just now'}</span>
                </div>
                <div style={styles.text}>{comment.content}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          style={styles.input}
          maxLength={500}
        />
        <button 
          type="submit" 
          disabled={!newComment.trim()} 
          style={styles.submit}
          onMouseOver={(e) => e.target.style.backgroundColor = '#224abe'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#4e73df'}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default CommentSection;
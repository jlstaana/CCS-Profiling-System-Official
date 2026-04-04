import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import CommentSection from '../../components/social/CommentSection';
import styles from './SocialFeed.module.css';

const SocialFeed = () => {
  const { user } = useAuth();
  const { posts, loading, createPost, likePost, addComment } = useSocial();

  const [newPost, setNewPost] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [posting, setPosting] = useState(false);
  const [expandedComments, setExpandedComments] = useState({});
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() && !imagePreview) return;
    setPosting(true);
    try {
      await createPost({ 
        content: newPost,
        image_path: imagePreview // Send base64 to backend
      });
      setNewPost('');
      removeImage();
      setShowPostModal(false);
    } finally {
      setPosting(false);
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const getRoleClass = (role) => {
    switch (role?.toLowerCase()) {
      case 'student': return styles.roleStudent;
      case 'faculty': return styles.roleFaculty;
      case 'admin': return styles.roleAdmin;
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Social Feed</h1>
        <button className={styles.createButton} onClick={() => setShowPostModal(true)}>
          + Create Post
        </button>
      </div>

      <div className={styles.createPostCard} onClick={() => setShowPostModal(true)}>
        <div className={styles.createPostPlaceholder}>
          {user?.profile_pic_base64 ? (
            <img src={user.profile_pic_base64} alt="Me" className={styles.userAvatar} />
          ) : (
            <div className={styles.userAvatar}>{user?.name?.charAt(0)}</div>
          )}
          <span className={styles.placeholderText}>What's on your mind, {user?.name?.split(' ')[0]}?</span>
        </div>
      </div>

      {loading ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>⏳</span>
          Loading your community feed...
        </div>
      ) : posts.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🌿</span>
          No posts yet. Be the first to share something!
        </div>
      ) : (
        <div className={styles.postsList}>
          {posts.map(post => (
            <div key={post.id} className={styles.postCard}>
              <div className={styles.postHeader}>
                <div className={styles.postAuthor}>
                  {post.author?.avatar ? (
                    <img src={post.author.avatar} alt="Author" className={styles.authorAvatar} />
                  ) : (
                    <div className={styles.authorAvatar}>{post.author?.name?.charAt(0) || '?'}</div>
                  )}
                  <div className={styles.authorInfo}>
                    <div className={styles.authorName}>
                      {post.author?.name}
                      <span className={`${styles.roleBadge} ${getRoleClass(post.author?.role)}`} style={{marginLeft: '8px'}}>
                        {post.author?.role}
                      </span>
                    </div>
                    <div className={styles.authorMeta}>
                      <span>{post.author?.department}</span>
                      <span>•</span>
                      <span>{post.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>

              {post.content && <div className={styles.postContent}>{post.content}</div>}

              {post.image_path && (
                <div className={styles.postImageContainer}>
                  <img src={post.image_path} alt="Post Content" className={styles.postImage} />
                </div>
              )}

              <div className={styles.postStats}>
                <span>❤️ {post.likes} likes</span>
                <span className={styles.commentCount}>💬 {post.comments?.length || 0} comments</span>
              </div>

              <div className={styles.postActions}>
                <button
                  className={`${styles.actionButton} ${post.liked ? styles.likedButton : ''}`}
                  onClick={() => likePost(post.id)}
                >
                  {post.liked ? '❤️ Liked' : '🤍 Like'}
                </button>
                <button className={styles.actionButton} onClick={() => toggleComments(post.id)}>
                  💬 Comment
                </button>
                <button 
                  className={styles.actionButton} 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/social/feed#post-${post.id}`);
                    alert('Post link copied to clipboard!');
                  }}
                >
                  🔗 Share
                </button>
              </div>

              {expandedComments[post.id] && (
                <CommentSection
                  comments={post.comments || []}
                  onAddComment={(text) => addComment(post.id, text)}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {showPostModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPostModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Create Post</h3>
              <button className={styles.modalClose} onClick={() => setShowPostModal(false)}>×</button>
            </div>
            
            <div className={styles.modalBody}>
              <textarea
                className={styles.modalTextarea}
                placeholder="What's on your mind?"
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                autoFocus
              />

              {imagePreview && (
                <div className={styles.imagePreview}>
                  <img src={imagePreview} alt="Preview" className={styles.previewImg} />
                  <button className={styles.removePreview} onClick={removeImage}>×</button>
                </div>
              )}

              <div className={styles.imageUploadArea}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  id="post-image-upload"
                />
                <label htmlFor="post-image-upload" className={styles.uploadLabel}>
                  📸 {imagePreview ? 'Change Photo' : 'Add Photo'}
                </label>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.modalCancel} onClick={() => setShowPostModal(false)}>Cancel</button>
              <button
                className={styles.modalPost}
                onClick={handleCreatePost}
                disabled={(!newPost.trim() && !imagePreview) || posting}
              >
                {posting ? 'Posting...' : 'Post to Feed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialFeed;
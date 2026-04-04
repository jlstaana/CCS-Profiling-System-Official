import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/Navbar.module.css';

const TYPE_ICONS = {
  connection_request:  '🤝',
  connection_accepted: '✅',
  post_like:           '❤️',
  post_comment:        '💬',
  new_message:         '✉️',
  new_post:            '📢',
  group_join:          '👥',
  profile_approved:    '✅',
  profile_rejected:    '❌',
};

const Navbar = ({ toggleMobileMenu, showMenuButton }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadNotificationsCount,
  } = useSocial();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentMessages, setRecentMessages] = useState([]);
  const notificationRef = useRef(null);
  const messagesRef = useRef(null);
  const profileRef = useRef(null);

  const unreadNotifications = getUnreadNotificationsCount();

  // Fetch recent conversations for messages dropdown
  const fetchRecentMessages = async () => {
    if (!user || !axios.defaults.headers.common['Authorization']) return;
    try {
      const res = await axios.get('/messages/conversations');
      const sorted = [...res.data].sort((a, b) => {
        const timeA = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
        const timeB = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
        return timeB - timeA;
      });
      setRecentMessages(sorted.slice(0, 5));
    } catch (e) { /* silent */ }
  };

  useEffect(() => {
    fetchRecentMessages();
    const interval = setInterval(fetchRecentMessages, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const unreadMessages = recentMessages.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) setShowNotifications(false);
      if (messagesRef.current && !messagesRef.current.contains(event.target)) setShowMessages(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':   return '#e74a3b';
      case 'faculty': return '#1cc88a';
      case 'student': return '#4e73df';
      default:        return '#858796';
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/${user.role}-dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const getUserInfoPath = () => {
    return `/${user?.role}-dashboard/${user?.role}-info`;
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead();
    setShowNotifications(false);
  };

  const handleNotifClick = async (notif) => {
    if (!notif.read) await markNotificationAsRead(notif.id);
    setShowNotifications(false);
  };

  const getNotifLink = (notif) => {
    const base = `/${user?.role}-dashboard`;
    let link = notif.link || '/';

    // Map common backend paths to frontend routes
    if (link === '/profile' || link === '/profile-requests') {
      if (user?.role === 'admin' && link === '/profile-requests') {
        link = '/approvals';
      } else if (link === '/profile') {
        link = `/${user?.role}-info`;
      }
    }

    // Ensure the link is prefixed with the dashboard base if it isn't already
    if (!link.startsWith(base)) {
      return `${base}${link.startsWith('/') ? link : '/' + link}`;
    }
    return link;
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarLeft}>
        {showMenuButton && (
          <button onClick={toggleMobileMenu} className={styles.menuButton} aria-label="Toggle menu">
            <span className={styles.hamburger}></span>
            <span className={styles.hamburger}></span>
            <span className={styles.hamburger}></span>
          </button>
        )}
        <div className={styles.welcomeText}>
          Welcome, <strong>{user?.name?.split(' ')[0] || 'User'}</strong>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className={styles.searchContainer}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search profiles, courses, or events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className={styles.userInfo}>
        {/* Notifications */}
        <div className={styles.dropdownContainer} ref={notificationRef}>
          <button
            className={`${styles.iconButton} ${unreadNotifications > 0 ? styles.hasBadge : ''}`}
            onClick={() => { setShowNotifications(v => !v); setShowMessages(false); setShowProfile(false); }}
          >
            <span className={styles.icon}>🔔</span>
            {unreadNotifications > 0 && <span className={styles.badge}>{unreadNotifications}</span>}
          </button>

          {showNotifications && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <h3 className={styles.dropdownTitle}>Notifications</h3>
                {unreadNotifications > 0 && (
                  <button onClick={handleMarkAllRead} className={styles.markAllRead}>Mark all read</button>
                )}
              </div>
              <div className={styles.dropdownList}>
                {notifications.length > 0 ? (
                  notifications.slice(0, 6).map(notif => (
                    <Link
                      key={notif.id}
                      to={getNotifLink(notif)}
                      className={`${styles.dropdownItem} ${!notif.read ? styles.unread : ''}`}
                      onClick={() => handleNotifClick(notif)}
                    >
                      <span style={{ fontSize: 18, marginRight: 8, flexShrink: 0 }}>{TYPE_ICONS[notif.type] || '🔔'}</span>
                      <div className={styles.dropdownItemContent}>
                        <p className={styles.dropdownItemText}>{notif.message}</p>
                        <span className={styles.dropdownItemTime}>{notif.time}</span>
                      </div>
                      {!notif.read && <span className={styles.unreadDot}></span>}
                    </Link>
                  ))
                ) : (
                  <div className={styles.dropdownEmpty}>No notifications</div>
                )}
              </div>
              <div className={styles.dropdownFooter}>
                <Link to={`/${user?.role}-dashboard/notifications`} className={styles.viewAllLink} onClick={() => setShowNotifications(false)}>View all</Link>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className={styles.dropdownContainer} ref={messagesRef}>
          <button
            className={`${styles.iconButton} ${unreadMessages > 0 ? styles.hasBadge : ''}`}
            onClick={() => { setShowMessages(v => !v); setShowNotifications(false); setShowProfile(false); }}
          >
            <span className={styles.icon}>💬</span>
            {unreadMessages > 0 && <span className={styles.badge}>{unreadMessages}</span>}
          </button>

          {showMessages && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <h3 className={styles.dropdownTitle}>Messages</h3>
                <Link to={`/${user?.role}-dashboard/messages`} className={styles.newMessageLink} onClick={() => setShowMessages(false)}>+ New</Link>
              </div>
              <div className={styles.dropdownList}>
                {recentMessages.length > 0 ? (
                  recentMessages.map(conv => (
                    <Link
                      key={conv.id}
                      to={`/${user?.role}-dashboard/messages`}
                      className={`${styles.dropdownItem} ${styles.messageItem} ${conv.unread_count > 0 ? styles.unread : ''}`}
                      onClick={() => setShowMessages(false)}
                    >
                      <div className={styles.messageAvatar}>{(conv.other_user?.name || '?').charAt(0)}</div>
                      <div className={styles.messageContent}>
                        <div className={styles.messageHeader}>
                          <span className={styles.messageSender}>{conv.other_user?.name}</span>
                          <span className={styles.messageTime}>
                            {conv.last_message?.created_at ? new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <p className={styles.messagePreview}>{conv.last_message?.content || 'No messages yet'}</p>
                      </div>
                      {conv.unread_count > 0 && <span className={styles.unreadDot}></span>}
                    </Link>
                  ))
                ) : (
                  <div className={styles.dropdownEmpty}>No messages yet</div>
                )}
              </div>
              <div className={styles.dropdownFooter}>
                <Link to={`/${user?.role}-dashboard/messages`} className={styles.viewAllLink} onClick={() => setShowMessages(false)}>View all messages</Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className={styles.dropdownContainer} ref={profileRef} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className={styles.roleBadge} style={{ backgroundColor: getRoleBadgeColor(user?.role) }}>
            {user?.role}
          </span>
          
          <div 
            className={`${styles.userAvatarWrapper} ${showProfile ? styles.activeAvatar : ''}`} 
            onClick={() => { setShowProfile(v => !v); setShowNotifications(false); setShowMessages(false); }}
          >
            <div className={styles.userAvatar} style={{ overflow: 'hidden' }}>
              {user?.profile_pic_base64 ? (
                <img src={user.profile_pic_base64} alt="P" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (user?.name?.charAt(0) || 'U')}
            </div>
          </div>

          {showProfile && (
            <div className={`${styles.dropdown} ${styles.profileDropdown}`}>
              <div className={styles.profileHeader}>
                <span className={styles.profileName}>{user?.name}</span>
                <span className={styles.profileEmail}>{user?.email}</span>
              </div>
              <Link to={getUserInfoPath()} className={styles.profileLink} onClick={() => setShowProfile(false)}>
                <span className={styles.profileIcon}>👤</span> My Profile
              </Link>
              <Link to={`/${user?.role}-dashboard/settings`} className={styles.profileLink} onClick={() => setShowProfile(false)}>
                <span className={styles.profileIcon}>⚙️</span> Settings
              </Link>
              <button onClick={logout} className={`${styles.profileLink} ${styles.logoutProfile}`} style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}>
                <span className={styles.profileIcon}>↪</span> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
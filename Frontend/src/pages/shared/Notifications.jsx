import React from 'react';
import { useSocial } from '../../context/SocialContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const TYPE_CONFIG = {
  connection_request:  { icon: '🤝', color: '#4e73df', label: 'Connection' },
  connection_accepted: { icon: '✅', color: '#1cc88a', label: 'Connection' },
  post_like:           { icon: '❤️', color: '#e74a3b', label: 'Post' },
  post_comment:        { icon: '💬', color: '#36b9cc', label: 'Comment' },
  new_message:         { icon: '✉️', color: '#f6c23e', label: 'Message' },
  new_post:            { icon: '📢', color: '#4e73df', label: 'Post' },
  group_join:          { icon: '👥', color: '#1cc88a', label: 'Group' },
  profile_approved:    { icon: '✅', color: '#1cc88a', label: 'Profile' },
  profile_rejected:    { icon: '❌', color: '#e74a3b', label: 'Profile' },
  profile_request:     { icon: '👤', color: '#f6c23e', label: 'Request' },
  new_event:           { icon: '📅', color: '#4e73df', label: 'Event' },
  new_course:          { icon: '📚', color: '#1cc88a', label: 'Course' },
  new_material:        { icon: '📄', color: '#36b9cc', label: 'Material' },
};

const Notifications = () => {
  const { user } = useAuth();
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    loading 
  } = useSocial();

  const handleNotifClick = (notif) => {
    if (!notif.read) markNotificationAsRead(notif.id);
  };

  const getNotifLink = (notif) => {
    const base = `/${user?.role}-dashboard`;
    const link = notif.link || '/';
    return `${base}${link.startsWith('/') ? link : '/' + link}`;
  };

  return (
    <div style={S.container}>
      <div style={S.header}>
        <h1 style={S.title}>Notifications</h1>
        {notifications.some(n => !n.read) && (
          <button style={S.markAllBtn} onClick={markAllNotificationsAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      <div style={S.list}>
        {loading ? (
          <div style={S.emptyState}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div style={S.emptyState}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map(notif => {
            const config = TYPE_CONFIG[notif.type] || { icon: '🔔', color: '#858796', label: 'System' };
            return (
              <Link
                key={notif.id}
                to={getNotifLink(notif)}
                style={{ ...S.item, ...(notif.read ? {} : S.unreadItem) }}
                onClick={() => handleNotifClick(notif)}
              >
                <div style={{ ...S.iconBox, backgroundColor: config.color }}>
                  {config.icon}
                </div>
                <div style={S.content}>
                  <div style={S.itemMeta}>
                    <span style={{ ...S.roleLabel, color: config.color }}>{config.label}</span>
                    <span style={S.time}>{notif.time}</span>
                  </div>
                  <p style={S.message}>{notif.message}</p>
                </div>
                {!notif.read && <div style={S.unreadDot}></div>}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

const S = {
  container: {
    maxWidth: 800,
    margin: '0 auto',
    padding: '20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1f2f70',
    margin: 0
  },
  markAllBtn: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#4e73df',
    border: '1px solid #4e73df',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    textDecoration: 'none',
    color: 'inherit',
    position: 'relative',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  unreadItem: {
    backgroundColor: '#f8f9fc',
    borderLeft: '4px solid #4e73df'
  },
  iconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: 'white',
    flexShrink: 0
  },
  content: {
    flex: 1,
    minWidth: 0
  },
  itemMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px'
  },
  roleLabel: {
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  time: {
    fontSize: '12px',
    color: '#858796'
  },
  message: {
    fontSize: '14px',
    color: '#5a5c69',
    margin: 0,
    lineHeight: '1.4'
  },
  unreadDot: {
    width: '10px',
    height: '10px',
    backgroundColor: '#4e73df',
    borderRadius: '50%',
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    color: '#858796'
  }
};

export default Notifications;

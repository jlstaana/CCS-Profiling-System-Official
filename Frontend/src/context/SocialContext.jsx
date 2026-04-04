import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const SocialContext = createContext(null);

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) throw new Error('useSocial must be used within a SocialProvider');
  return context;
};

export const SocialProvider = ({ children }) => {
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [studyGroups, setStudyGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  // Network
  const [allUsers, setAllUsers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  // Notifications — fetched from backend
  const [notifications, setNotifications] = useState([]);

  // ── Fetch social data ──────────────────────────────────────────────────
  const fetchSocialData = useCallback(async () => {
    if (!user || !axios.defaults.headers.common['Authorization']) return;
    setLoading(true);
    try {
      const [postsRes, usersRes, connectionsRes, groupsRes] = await Promise.all([
        axios.get('/social/posts'),
        axios.get('/social/users'),
        axios.get('/social/connections'),
        axios.get('/social/study-groups'),
      ]);

      setPosts(postsRes.data.map(p => ({
        id: p.id,
        content: p.content,
        image_path: p.image_path,
        timestamp: new Date(p.created_at).toLocaleDateString(),
        likes: p.likes_count || 0,
        liked: false,
        author: {
          id: p.user?.id,
          name: p.user?.name,
          role: p.user?.role,
          avatar: p.user?.profile_pic_base64 || null,
          department: p.user?.department || 'CCS',
          specialization: p.user?.specialization || null,
        },
        comments: (p.comments || []).map(c => ({
          id: c.id,
          content: c.content,
          timestamp: new Date(c.created_at).toLocaleDateString(),
          author: {
            id: c.user?.id,
            name: c.user?.name,
            role: c.user?.role,
            avatar: c.user?.profile_pic_base64 || null,
          },
        })),
      })));

      setAllUsers(usersRes.data);

      const activeConnections = [];
      const incomingRequests = [];
      connectionsRes.data.forEach(conn => {
        if (conn.status === 'accepted') {
          activeConnections.push(conn.requester_id === user.id ? conn.receiver_id : conn.requester_id);
        } else if (conn.status === 'pending' && conn.receiver_id === user.id) {
          incomingRequests.push({
            id: conn.id,
            fromId: conn.requester?.id,
            fromName: conn.requester?.name,
            role: conn.requester?.role,
            avatar: conn.requester?.name?.charAt(0),
            timestamp: new Date(conn.created_at).toLocaleDateString(),
          });
        }
      });
      setConnections(activeConnections);
      setPendingRequests(incomingRequests);

      setStudyGroups(groupsRes.data.map(g => ({
        id: g.id,
        name: g.name,
        schedule: g.schedule,
        agenda: g.agenda,
        course: g.course || '',
        description: g.agenda || '',
        createdBy: g.creator?.name,
        members: g.members?.length || 0,
        isMember: g.members?.some(m => m.user?.id === user.id),
      })));
    } catch (err) {
      console.error('Failed to load social data', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ── Fetch notifications from backend ──────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!user || !axios.defaults.headers.common['Authorization']) return;
    try {
      const res = await axios.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    if (user && axios.defaults.headers.common['Authorization']) {
      fetchSocialData();
      fetchNotifications();
    }
  }, [user, fetchSocialData, fetchNotifications]);

  // Poll notifications every 30 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  // ── Posts ──────────────────────────────────────────────────────────────
  const createPost = async (postData) => {
    try {
      await axios.post('/social/posts', postData);
      await fetchSocialData();
    } catch (err) { console.error(err); }
  };

  const likePost = async (postId) => {
    try {
      await axios.post(`/social/posts/${postId}/like`);
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked }
          : p
      ));
    } catch (err) { console.error(err); }
  };

  const addComment = async (postId, commentText) => {
    try {
      await axios.post(`/social/posts/${postId}/comments`, { content: commentText });
      await fetchSocialData();
    } catch (err) { console.error(err); }
  };

  // ── Study Groups ───────────────────────────────────────────────────────
  const joinStudyGroup = async (groupId) => {
    await axios.post(`/social/study-groups/${groupId}/join`);
    await fetchSocialData();
  };
  const leaveStudyGroup = async (groupId) => {
    await axios.post(`/social/study-groups/${groupId}/leave`);
    await fetchSocialData();
  };
  const createStudyGroup = async (groupData) => {
    await axios.post('/social/study-groups', groupData);
    await fetchSocialData();
  };

  // ── Connections ────────────────────────────────────────────────────────
  const sendConnectionRequest = async (person) => {
    await axios.post(`/social/connections/${person.id}`);
    await fetchNotifications(); // refresh so we see local update quickly
  };
  const acceptConnection = async (requestId) => {
    await axios.post(`/social/connections/request/${requestId}/accept`);
    await fetchSocialData();
  };
  const declineConnection = async (requestId) => {
    await axios.post(`/social/connections/request/${requestId}/decline`);
    await fetchSocialData();
  };

  // ── Notifications ──────────────────────────────────────────────────────
  const markNotificationAsRead = async (notifId) => {
    try {
      await axios.post(`/notifications/${notifId}/read`);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    } catch (err) { console.error(err); }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await axios.post('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) { console.error(err); }
  };

  const clearNotifications = () => setNotifications([]);
  const getUnreadNotificationsCount = () => notifications.filter(n => !n.read).length;

  const value = {
    posts, studyGroups, loading,
    fetchSocialData,
    createPost, likePost, addComment,
    joinStudyGroup, leaveStudyGroup, createStudyGroup,
    allUsers, connections, pendingRequests,
    sendConnectionRequest, acceptConnection, declineConnection,
    notifications, fetchNotifications,
    markNotificationAsRead, markAllNotificationsAsRead,
    clearNotifications, getUnreadNotificationsCount,
  };

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
};
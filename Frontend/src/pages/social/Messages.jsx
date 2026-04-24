import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import styles from './Messages.module.css';

const Messages = () => {
  const { user } = useAuth();
  const { allUsers } = useSocial();

  // Conversations from API
  const [conversations, setConversations] = useState([]);
  const [convLoading, setConvLoading] = useState(true);

  // Selected chat
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);

  // Input
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // New message modal
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newMsgSearch, setNewMsgSearch] = useState('');

  // User Info modal
  const [showUserInfo, setShowUserInfo] = useState(false);

  // Sidebar search
  const [searchTerm, setSearchTerm] = useState('');

  // ── Fetch conversations on mount ──
  const fetchConversations = async () => {
    setConvLoading(true);
    try {
      const res = await axios.get('/messages/conversations');
      setConversations(res.data);
    } catch (e) { console.error(e); }
    finally { setConvLoading(false); }
  };

  useEffect(() => { fetchConversations(); }, []);

  // ── Fetch messages when a conversation is selected ──
  const openConversation = async (conv) => {
    setSelectedConvId(conv.id);
    setMsgLoading(true);
    try {
      const res = await axios.get(`/messages/conversations/${conv.id}/messages`);
      setMessages(res.data);
      // Mark as read
      axios.post(`/messages/conversations/${conv.id}/read`).catch(() => {});
    } catch (e) { console.error(e); }
    finally { setMsgLoading(false); }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send message ──
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConvId || sending) return;
    setSending(true);
    try {
      const res = await axios.post(`/messages/conversations/${selectedConvId}`, {
        content: messageInput,
      });
      setMessages(prev => [...prev, res.data]);
      setMessageInput('');
      
      // Update last message preview in sidebar and MOVE TO TOP
      setConversations(prev => {
        const index = prev.findIndex(c => c.id === selectedConvId);
        if (index === -1) return prev;
        
        const updatedConv = {
          ...prev[index],
          last_message: { ...res.data, created_at: new Date().toISOString() },
          unread_count: 0
        };
        
        const rest = prev.filter(c => c.id !== selectedConvId);
        return [updatedConv, ...rest];
      });
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  // ── Start new conversation from modal ──
  const handleStartConversation = async (otherUser) => {
    setShowNewMessage(false);
    // Check if conversation already exists
    const existing = conversations.find(c => c.other_user?.id === otherUser.id);
    if (existing) { openConversation(existing); return; }
    // Open a virtual conversation (first message will create it on the backend)
    const virtual = {
      id: `new-${otherUser.id}`,
      other_user: otherUser,
      last_message: null,
      unread_count: 0,
      _isNew: true,
      _newUserId: otherUser.id,
    };
    setConversations(prev => [virtual, ...prev]);
    setSelectedConvId(virtual.id);
    setMessages([]);
  };

  // If currently in a "new" (virtual) conversation and user sends a message, create it via the API
  const handleSendNewConversation = async () => {
    if (!messageInput.trim() || sending) return;
    const conv = conversations.find(c => c.id === selectedConvId);
    if (!conv?._isNew) return;
    setSending(true);
    try {
      // Send first message — backend creates the conversation
      const res = await axios.post(`/messages/conversations/${conv._newUserId}`, {
        content: messageInput,
      });
      setMessageInput('');
      
      // Refresh conversations to get the real one from server
      const convsRes = await axios.get('/messages/conversations');
      const updatedConvs = convsRes.data;
      setConversations(updatedConvs);
      
      // Find the new real conversation ID
      const realConvId = res.data?.conversation_id || res.data?.id;
      if (realConvId) {
        setSelectedConvId(realConvId);
        const msgRes = await axios.get(`/messages/conversations/${realConvId}/messages`);
        setMessages(msgRes.data);
      }
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  const isNewConv = conversations.find(c => c.id === selectedConvId)?._isNew;

  // Derive and Sort Conversations
  const sortedConvs = [...conversations].sort((a, b) => {
    const timeA = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : Infinity;
    const timeB = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : Infinity;
    // New conversations (without last_message) stay at top, then by time
    if (a._isNew) return -1;
    if (b._isNew) return 1;
    return timeB - timeA;
  });

  const filteredConvs = sortedConvs.filter(c =>
    (c.other_user?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNewUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(newMsgSearch.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(newMsgSearch.toLowerCase())
  );

  const selectedConv = conversations.find(c => c.id === selectedConvId);

  const getAvatarBg = (role) => role === 'admin' ? '#e74a3b' : role === 'faculty' ? '#4e73df' : '#1cc88a';

  return (
    <div className={`${styles.container} ${selectedConv ? styles.chatOpen : ''}`}>
      {/* ── Sidebar ── */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Messages</h2>
          <button className={styles.newBtn} onClick={() => { setNewMsgSearch(''); setShowNewMessage(true); }}>✉+</button>
        </div>
        <div className={styles.searchBox}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search conversations…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.convList}>
          {convLoading ? (
            <div className={styles.hint}>Loading…</div>
          ) : filteredConvs.length === 0 ? (
            <div className={styles.hint}>No conversations yet.</div>
          ) : filteredConvs.map(conv => (
            <div
              key={conv.id}
              className={`${styles.convItem} ${selectedConvId === conv.id ? styles.convActive : ''}`}
              onClick={() => conv._isNew ? setSelectedConvId(conv.id) : openConversation(conv)}
            >
              <div className={styles.avatar} style={{ backgroundColor: getAvatarBg(conv.other_user?.role) }}>
                {(conv.other_user?.name || '?').charAt(0)}
              </div>
              <div className={styles.convInfo}>
                <div className={styles.convHeader}>
                  <span className={styles.convName}>{conv.other_user?.name || 'Unknown'}</span>
                  <span className={styles.convTime}>
                    {conv.last_message ? new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <div className={styles.convPreview}>
                  {conv._isNew ? 'New conversation' : (conv.last_message?.content || 'No messages yet')}
                </div>
                <div className={styles.convFooter}>
                  <span className={styles.roleLabel}>{conv.other_user?.role}</span>
                  {conv.unread_count > 0 && <span className={styles.badge}>{conv.unread_count}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chat Area ── */}
      {selectedConv ? (
        <div className={styles.chatArea}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button className={styles.backBtn} onClick={() => setSelectedConvId(null)}>←</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className={styles.avatar} style={{ backgroundColor: getAvatarBg(selectedConv.other_user?.role), width: 44, height: 44 }}>
                    {(selectedConv.other_user?.name || '?').charAt(0)}
                  </div>
                  <div>
                    <div className={styles.chatName}>{selectedConv.other_user?.name}</div>
                    <div className={styles.chatMeta}>{selectedConv.other_user?.role} · {selectedConv.other_user?.department || selectedConv.other_user?.course || ''}</div>
                  </div>
                </div>
              </div>
              
              <button 
                className={styles.infoBtn} 
                onClick={() => setShowUserInfo(true)}
                title="User Information"
              >
                ℹ️
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className={styles.msgContainer}>
            {msgLoading ? (
              <div className={styles.hint}>Loading messages…</div>
            ) : messages.length === 0 ? (
              <div className={styles.hint}>No messages yet. Say hello! 👋</div>
            ) : messages.map((msg, i) => {
              const isMe = msg.sender_id === user?.id;
              return (
                <div key={msg.id || i} className={isMe ? styles.sentWrapper : styles.recvWrapper}>
                  {!isMe && (
                    <div className={styles.msgAvatar} style={{ backgroundColor: getAvatarBg(selectedConv.other_user?.role) }}>
                      {(selectedConv.other_user?.name || '?').charAt(0)}
                    </div>
                  )}
                  <div className={`${styles.bubble} ${isMe ? styles.sentBubble : styles.recvBubble}`}>
                    <div className={styles.msgText}>{msg.content}</div>
                    <div className={styles.msgTime}>
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={styles.inputBar}>
            <textarea
              className={styles.textInput}
              placeholder="Type a message…"
              value={messageInput}
              onChange={e => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
            />
            <button
              className={styles.sendBtn}
              onClick={isNewConv ? handleSendNewConversation : handleSendMessage}
              disabled={!messageInput.trim() || sending}
            >
              ➤
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>💬</div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1f2f70', marginBottom: 10 }}>Your Messages</h3>
          <p style={{ color: '#858796', marginBottom: '2rem' }}>Select a conversation or start a new one to begin chatting.</p>
          <button className={styles.startBtn} onClick={() => { setNewMsgSearch(''); setShowNewMessage(true); }}>
            New Message
          </button>
        </div>
      )}

      {/* ── New Message Modal ── */}
      {showNewMessage && (
        <div className={styles.overlay} onClick={() => setShowNewMessage(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1f2f70' }}>New Message</h3>
              <button onClick={() => setShowNewMessage(false)} className={styles.closeBtn}>×</button>
            </div>
            <div style={{ padding: '1.25rem' }}>
              <input
                className={styles.searchInput}
                type="text"
                placeholder="Search people by name or email…"
                value={newMsgSearch}
                onChange={e => setNewMsgSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              {filteredNewUsers.length === 0 ? (
                <div className={styles.hint}>
                  {newMsgSearch.length < 1 ? 'Start typing to search users…' : 'No users found.'}
                </div>
              ) : filteredNewUsers.map(u => (
                <div
                  key={u.id}
                  className={styles.userRow}
                  onClick={() => handleStartConversation(u)}
                >
                  <div className={styles.avatar} style={{ backgroundColor: getAvatarBg(u.role) }}>
                    {u.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#1f2f70', fontSize: '0.9rem' }}>{u.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#858796', textTransform: 'capitalize', fontWeight: 500 }}>
                      {u.role}{u.department ? ` · ${u.department}` : ''}{u.course ? ` · ${u.course}` : ''}
                    </div>
                  </div>
                  <span className={styles.msgBtnLink}>Message →</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* ── User Info Modal ── */}
      {showUserInfo && selectedConv?.other_user && (
        <div className={styles.overlay} onClick={() => setShowUserInfo(false)}>
          <div className={`${styles.modal} ${styles.profileModal}`} onClick={e => e.stopPropagation()}>
            <div className={styles.profileHeader}>
              <button className={styles.profileClose} onClick={() => setShowUserInfo(false)}>×</button>
              <div className={styles.profileAvatar} style={{ 
                backgroundColor: getAvatarBg(selectedConv.other_user.role),
                borderColor: 'rgba(255,255,255,0.4)'
              }}>
                {selectedConv.other_user.name.charAt(0)}
              </div>
              <h3 className={styles.profileName}>{selectedConv.other_user.name}</h3>
              <span className={styles.profileBadge}>{selectedConv.other_user.role}</span>
            </div>
            
            <div className={styles.profileBody}>
              <div className={styles.profileSection}>
                <span className={styles.profileInfoLabel}>Email Address</span>
                <span className={styles.profileInfoValue}>{selectedConv.other_user.email || 'No email provided'}</span>
              </div>
              
              {selectedConv.other_user.role === 'student' ? (
                <>
                  <div className={styles.profileSection}>
                    <span className={styles.profileInfoLabel}>Student ID</span>
                    <span className={styles.profileInfoValue}>{selectedConv.other_user.student_id || 'N/A'}</span>
                  </div>
                  <div className={styles.profileSection}>
                    <span className={styles.profileInfoLabel}>Course</span>
                    <span className={styles.profileInfoValue}>{selectedConv.other_user.course || 'N/A'}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.profileSection}>
                    <span className={styles.profileInfoLabel}>Employee ID</span>
                    <span className={styles.profileInfoValue}>{selectedConv.other_user.employee_id || 'N/A'}</span>
                  </div>
                  <div className={styles.profileSection}>
                    <span className={styles.profileInfoLabel}>Department</span>
                    <span className={styles.profileInfoValue}>{selectedConv.other_user.department || 'N/A'}</span>
                  </div>
                </>
              )}
              
              <div className={styles.profileSection}>
                <span className={styles.profileInfoLabel}>Specialization</span>
                <span className={styles.profileInfoValue}>{selectedConv.other_user.specialization || 'General'}</span>
              </div>
              
              <div className={styles.profileSection}>
                <span className={styles.profileInfoLabel}>Organizations / Joined</span>
                <div className={styles.profileInfoValue} style={{ fontSize: '0.85rem' }}>
                  {selectedConv.other_user.affiliations && selectedConv.other_user.affiliations.length > 0
                    ? selectedConv.other_user.affiliations.join(', ')
                    : 'No active organizations'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
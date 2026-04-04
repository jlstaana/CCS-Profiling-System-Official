import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const MessageContext = createContext(null);

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};

export const MessageProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]); // This would eventually use WebSockets/Pusher

  useEffect(() => {
    if (user && axios.defaults.headers.common['Authorization']) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/messages/conversations');
      setConversations(res.data);
      
      // If we have an active conversation, re-fetch its specific messages to keep it up-to-date
      if (activeConversation) {
        await loadConversationMessages(activeConversation.id);
      }
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    } finally {
      setLoading(false);
    }
  };

  const loadConversationMessages = async (otherUserId) => {
    try {
      const res = await axios.get(`/messages/conversations/${otherUserId}/messages`);
      
      // Look for existing conversation wrapper
      const conv = conversations.find(c => c.id === otherUserId);
      if (conv) {
        setActiveConversation({ ...conv, messages: res.data });
      } else {
        // Fallback if conversation is completely new
        fetchConversations();
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  const sendMessage = async (conversationId, content) => {
    try {
      const res = await axios.post(`/messages/conversations/${conversationId}`, { content });
      
      // Optimistic update locally for ultra-fast UI
      const newMessage = res.data;
      
      setConversations(prevConversations => 
        prevConversations.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              lastMessage: {
                content: newMessage.content,
                timestamp: newMessage.timestamp,
                senderId: newMessage.senderId
              },
              unreadCount: 0,
              updatedAt: newMessage.timestamp
            };
          }
          return conv;
        })
      );

      if (activeConversation?.id === conversationId) {
        setActiveConversation(prev => ({
          ...prev,
          messages: [...prev.messages, newMessage],
          lastMessage: {
            content: newMessage.content,
            timestamp: newMessage.timestamp,
            senderId: newMessage.senderId
          }
        }));
      }

    } catch (err) {
       console.error("Failed to send message", err);     
    }
  };

  const startNewConversation = async (participant) => {
    // Check if conversation already exists locally
    const existingConv = conversations.find(conv => conv.id === participant.id);

    if (existingConv) {
      // It exists, so we fetch its messages and set it active
      await loadConversationMessages(participant.id);
      return participant.id;
    }

    // Creating new local phantom conversation until a message is sent
    const newConversation = {
      id: participant.id,
      participants: [
        { id: user.id, name: user.name, avatar: user.name.charAt(0)??"U", role: user.role },
        { id: participant.id, name: participant.name, avatar: participant.avatar??"U", role: participant.role } // Using avatar instead of actual img
      ],
      messages: [],
      lastMessage: null,
      unreadCount: 0,
      updatedAt: new Date().toISOString()
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversation(newConversation);
    return newConversation.id;
  };

  const markAsRead = async (conversationId) => {
    try {
        await axios.post(`/messages/conversations/${conversationId}/read`);
        fetchConversations();
    } catch (err) {
        console.error("Failed to mark as read", err);
    }
  };

  const deleteConversation = (conversationId) => {
    // Backend delete not implemented for brevity, just clearing local state
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (activeConversation?.id === conversationId) {
      setActiveConversation(null);
    }
  };

  // Switch conversation triggers a fetch for the full message list
  const handleSetActiveConversation = (conv) => {
      if (!conv) {
          setActiveConversation(null);
          return;
      }
      // Temporary immediate set to avoid UI lag, then hydration
      setActiveConversation({ ...conv, messages: conv.messages || [] });
      loadConversationMessages(conv.id);
  };

  const searchUsers = (query) => {
    // Search is handled globally or out of scope for now
    return [];
  };

  const getUnreadCount = () => {
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  };

  const value = {
    conversations,
    activeConversation,
    onlineUsers,
    loading,
    setActiveConversation: handleSetActiveConversation,
    sendMessage,
    startNewConversation,
    markAsRead,
    deleteConversation,
    searchUsers,
    getUnreadCount
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};
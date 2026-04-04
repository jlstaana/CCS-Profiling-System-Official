import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import SocialButtons from '../../components/SocialButtons';
import CommentSection from '../../components/CommentSection';
import ConnectionsList from '../../components/ConnectionsList';
import MessageList from '../../components/MessageList';
import MessageChat from '../../components/MessageChat';

const SocialHub = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('events');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedChat, setSelectedChat] = useState('msg1');
  const [eventsState, setEventsState] = useState([]);
  const [messages, setMessages] = useState([]);
  
  const { allUsers, connections, sendConnectionRequest } = useSocial();

  useEffect(() => {
    setEventsState([]);
  }, []);

  const handleLike = (eventId, isLiked) => {
    setEventsState(eventsState.map(e => 
      e.id === eventId ? { ...e, liked: isLiked, likes: isLiked ? e.likes + 1 : e.likes - 1 } : e
    ));
  };

  const handleAddComment = (eventId, commentText) => {
    // Mock comment adding
    console.log('New comment:', commentText);
  };

  const handleConnect = (userId) => {
    const person = allUsers.find(u => u.id === userId);
    if (person) {
      sendConnectionRequest(person);
      alert(`Connection request sent to ${person.name}`);
    }
  };

  const handleSendMessage = (text) => {
    console.log('Sent message:', text);
  };

  const styles = {
    container: {
      padding: '24px',
      maxWidth: '1400px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '32px',
      paddingBottom: '20px',
      borderBottom: '2px solid #f8f9fc'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #1f2f70 0%, #4e73df 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      margin: 0
    },
    subtitle: {
      color: '#858796',
      fontSize: '16px',
      margin: 0
    },
    tabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '24px',
      padding: '4px',
      backgroundColor: '#f8f9fc',
      borderRadius: '12px',
      maxWidth: '400px'
    },
    tab: {
      padding: '12px 24px',
      border: 'none',
      background: 'none',
      borderRadius: '10px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      color: '#858796'
    },
    activeTab: {
      backgroundColor: 'white',
      color: '#1f2f70',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    content: {
      minHeight: '600px'
    },
    section: {
      display: activeTab === 'events' ? 'block' : 'none'
    },
    eventsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
      gap: '24px',
      marginBottom: '24px'
    },
    eventCard: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
    },
    eventCardHover: {
      transform: 'translateY(-8px)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.12)'
    },
    eventHeader: {
      marginBottom: '16px'
    },
    eventTitle: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#1f2f70',
      marginBottom: '8px',
      lineHeight: '1.3'
    },
    eventDate: {
      backgroundColor: '#e3f2fd',
      color: '#1976d2',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: '600',
      display: 'inline-block'
    },
    eventDesc: {
      color: '#5a5c69',
      lineHeight: '1.6',
      marginBottom: '20px'
    },
    networkSection: {
      display: 'grid',
      gridTemplateColumns: '1fr 400px',
      gap: '24px',
      height: 'calc(100vh - 240px)',
      marginTop: '24px'
    },
    messagesSection: {
      display: 'grid',
      gridTemplateColumns: '380px 1fr',
      gap: '0',
      height: 'calc(100vh - 240px)'
    },
    fullWidth: {
      display: activeTab === 'connections' ? 'block' : 'none'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Social Hub</h1>
        <p style={styles.subtitle}>Connect, discuss, and collaborate academically</p>
      </div>

      <div style={styles.tabs}>
        <button 
          style={{...styles.tab, ...(activeTab === 'events' && styles.activeTab)}}
          onClick={() => setActiveTab('events')}
        >
          🎉 Events
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === 'connections' && styles.activeTab)}}
          onClick={() => setActiveTab('connections')}
        >
          👥 Network
        </button>
        <button 
          style={{...styles.tab, ...(activeTab === 'messages' && styles.activeTab)}}
          onClick={() => setActiveTab('messages')}
        >
          💬 Messages
        </button>
      </div>

      <div style={styles.content}>
        {/* Events Tab */}
        {activeTab === 'events' && (
          <div>
            <div style={styles.eventsGrid}>
              {eventsState.map(event => (
                <div key={event.id} style={styles.eventCard}>
                  <div style={styles.eventHeader}>
                    <h3 style={styles.eventTitle}>{event.title}</h3>
                    <span style={styles.eventDate}>{event.date}</span>
                  </div>
                  <p style={styles.eventDesc}>{event.description}</p>
                  <SocialButtons 
                    likes={event.likes} 
                    comments={event.comments}
                    shares={event.shares}
                    liked={event.liked}
                    onLike={() => handleLike(event.id, !event.liked)}
                    onComment={() => setSelectedEvent(event)}
                    onShare={() => console.log('Shared event', event.id)}
                  />
                </div>
              ))}
            </div>
            {selectedEvent && (
              <div style={styles.eventCard}>
                <h3>{selectedEvent.title}</h3>
                <CommentSection 
                  comments={[
                    { author: 'John Doe', text: 'This looks awesome!', time: '1h ago' },
                    { author: 'You', text: 'Definitely attending!', time: '30min ago' }
                  ]}
                  onAddComment={(text) => handleAddComment(selectedEvent.id, text)}
                />
              </div>
            )}
          </div>
        )}

        {/* Connections Tab */}
        {activeTab === 'connections' && (
          <ConnectionsList 
            users={allUsers || []}
            connections={connections || []}
            onConnect={handleConnect}
          />
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div style={styles.messagesSection}>
            <MessageList 
              messages={[]}
              selectedChat={selectedChat}
              onSelectChat={setSelectedChat}
            />
            <MessageChat 
              contactName={''}
              onSendMessage={handleSendMessage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialHub;


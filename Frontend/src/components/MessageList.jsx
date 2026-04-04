import React, { useState } from 'react';
import { useSocial } from '../context/SocialContext';

const MessageList = ({ messages = [], selectedChat, onSelectChat }) => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [newRecipient, setNewRecipient] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showRequests, setShowRequests] = useState(false);

  const { allUsers, connections, pendingRequests, sendConnectionRequest, acceptConnection, declineConnection } = useSocial();

  const friends = allUsers.filter(u => connections.includes(u.id));
  const nonFriends = allUsers.filter(u => !connections.includes(u.id));

  const mockMessages = messages;

  const handleSearch = (query) => {
    setNewRecipient(query);
    if (query.length > 1) {
      // Search in both friends and non-friends
      const friendResults = friends.filter(f => 
        f.name.toLowerCase().includes(query.toLowerCase())
      ).map(f => ({ ...f, type: 'friend' }));
      
      const nonFriendResults = nonFriends.filter(nf => 
        nf.name.toLowerCase().includes(query.toLowerCase())
      ).map(nf => ({ ...nf, type: 'non-friend' }));
      
      setSearchResults([...friendResults, ...nonFriendResults]);
    } else {
      setSearchResults([]);
    }
  };

  const handleSendFriendRequest = (person) => {
    sendConnectionRequest(person);
    alert(`Connection request sent to ${person.name}!`);
  };

  const handleAcceptRequest = (requestId) => {
    acceptConnection(requestId);
    alert('Request accepted!');
  };

  const handleDeclineRequest = (requestId) => {
    declineConnection(requestId);
  };

  const handleStartChat = (person) => {
    console.log('Start chat with:', person.name);
    setShowNewModal(false);
    setNewRecipient('');
    setSearchResults([]);
    // In real app, this would open/create a conversation
  };

  // New Message Modal Component
  const NewMessageModal = ({ onClose }) => {
    const modalStyles = {
      overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001
      },
      modal: {
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px',
        padding: '24px',
        maxHeight: '80vh',
        overflowY: 'auto'
      },
      header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid #e3e6f0'
      },
      title: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#1f2f70',
        margin: 0
      },
      close: {
        background: 'none',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        color: '#858796',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        ':hover': {
          backgroundColor: '#f8f9fc'
        }
      },
      searchInput: {
        width: '100%',
        padding: '12px 16px',
        border: '1px solid #d1d3e2',
        borderRadius: '8px',
        fontSize: '14px',
        marginBottom: '20px',
        outline: 'none',
        ':focus': {
          borderColor: '#1f2f70'
        }
      },
      section: {
        marginBottom: '20px'
      },
      sectionTitle: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#858796',
        textTransform: 'uppercase',
        marginBottom: '12px'
      },
      resultItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '8px',
        backgroundColor: '#f8f9fc',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        ':hover': {
          backgroundColor: '#e9ecef'
        }
      },
      resultInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flex: 1
      },
      resultAvatar: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#4e73df',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        fontWeight: '600'
      },
      facultyAvatar: {
        backgroundColor: '#1cc88a'
      },
      resultDetails: {
        flex: 1
      },
      resultName: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#1f2f70',
        marginBottom: '2px'
      },
      resultMeta: {
        fontSize: '12px',
        color: '#858796'
      },
      friendBadge: {
        fontSize: '11px',
        color: '#1cc88a',
        fontWeight: '500'
      },
      actionButton: {
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        border: 'none',
        whiteSpace: 'nowrap'
      },
      messageBtn: {
        backgroundColor: '#1cc88a',
        color: 'white',
        ':hover': {
          backgroundColor: '#169b6b'
        }
      },
      addFriendBtn: {
        backgroundColor: '#1f2f70',
        color: 'white',
        ':hover': {
          backgroundColor: '#2a3a8c'
        }
      },
      pendingBadge: {
        backgroundColor: '#f6c23e',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '11px'
      },
      requestItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px',
        backgroundColor: '#fff3cd',
        borderRadius: '8px',
        marginBottom: '8px'
      },
      requestActions: {
        display: 'flex',
        gap: '8px'
      },
      acceptBtn: {
        padding: '4px 12px',
        backgroundColor: '#1cc88a',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '12px',
        cursor: 'pointer'
      },
      declineBtn: {
        padding: '4px 12px',
        backgroundColor: '#e74a3b',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '12px',
        cursor: 'pointer'
      },
      toggleRequests: {
        color: '#1f2f70',
        cursor: 'pointer',
        fontSize: '13px',
        marginBottom: '12px',
        display: 'inline-block'
      }
    };

    return (
      <div style={modalStyles.overlay}>
        <div style={modalStyles.modal}>
          <div style={modalStyles.header}>
            <h3 style={modalStyles.title}>New Message</h3>
            <button style={modalStyles.close} onClick={onClose}>×</button>
          </div>

          {/* Friend Requests Section */}
          {pendingRequests.length > 0 && (
            <div style={modalStyles.section}>
              <div style={modalStyles.sectionTitle}>
                Pending Friend Requests ({pendingRequests.length})
                <span 
                  style={modalStyles.toggleRequests}
                  onClick={() => setShowRequests(!showRequests)}
                >
                  {showRequests ? ' ▼' : ' ▶'}
                </span>
              </div>
              {showRequests && pendingRequests.map(request => (
                <div key={request.id} style={modalStyles.requestItem}>
                  <div style={modalStyles.resultInfo}>
                    <div style={modalStyles.resultAvatar}>
                      {request.avatar}
                    </div>
                    <div style={modalStyles.resultDetails}>
                      <div style={modalStyles.resultName}>{request.fromName}</div>
                      <div style={modalStyles.resultMeta}>
                        {request.role} • {request.timestamp}
                      </div>
                    </div>
                  </div>
                  <div style={modalStyles.requestActions}>
                    <button 
                      style={modalStyles.acceptBtn}
                      onClick={() => handleAcceptRequest(request.id)}
                    >
                      Accept
                    </button>
                    <button 
                      style={modalStyles.declineBtn}
                      onClick={() => handleDeclineRequest(request.id)}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <input
            type="text"
            placeholder="Search for people..."
            value={newRecipient}
            onChange={(e) => handleSearch(e.target.value)}
            style={modalStyles.searchInput}
            autoFocus
          />

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div style={modalStyles.section}>
              <div style={modalStyles.sectionTitle}>Search Results</div>
              {searchResults.map(person => (
                <div key={person.id} style={modalStyles.resultItem}>
                  <div style={modalStyles.resultInfo}>
                    <div style={{
                      ...modalStyles.resultAvatar,
                      ...(person.role === 'faculty' && modalStyles.facultyAvatar)
                    }}>
                      {person.avatar}
                    </div>
                    <div style={modalStyles.resultDetails}>
                      <div style={modalStyles.resultName}>{person.name}</div>
                      <div style={modalStyles.resultMeta}>
                        {person.role} • {person.department || person.course}
                        {person.type === 'friend' && (
                          <span style={modalStyles.friendBadge}> • Friend</span>
                        )}
                        {person.mutualFriends > 0 && (
                          <span> • {person.mutualFriends} mutual friends</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {person.type === 'friend' ? (
                    <button 
                      style={{...modalStyles.actionButton, ...modalStyles.messageBtn}}
                      onClick={() => handleStartChat(person)}
                    >
                      Message
                    </button>
                  ) : (
                    <button 
                      style={{...modalStyles.actionButton, ...modalStyles.addFriendBtn}}
                      onClick={() => handleSendFriendRequest(person)}
                    >
                      Add Friend
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          {!searchResults.length && newRecipient.length <= 1 && (
            <>
              {/* Friends Section */}
              <div style={modalStyles.section}>
                <div style={modalStyles.sectionTitle}>Your Friends</div>
                {friends.slice(0, 3).map(friend => (
                  <div key={friend.id} style={modalStyles.resultItem}>
                    <div style={modalStyles.resultInfo}>
                      <div style={{
                        ...modalStyles.resultAvatar,
                        ...(friend.role === 'faculty' && modalStyles.facultyAvatar)
                      }}>
                        {friend.avatar}
                      </div>
                      <div style={modalStyles.resultDetails}>
                        <div style={modalStyles.resultName}>{friend.name}</div>
                        <div style={modalStyles.resultMeta}>
                          {friend.role} • {friend.department || friend.course}
                          <span style={modalStyles.friendBadge}> • Friend</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      style={{...modalStyles.actionButton, ...modalStyles.messageBtn}}
                      onClick={() => handleStartChat(friend)}
                    >
                      Message
                    </button>
                  </div>
                ))}
              </div>

              {/* Suggested People (Non-Friends) */}
              <div style={modalStyles.section}>
                <div style={modalStyles.sectionTitle}>People You May Know</div>
                {nonFriends.slice(0, 3).map(person => (
                  <div key={person.id} style={modalStyles.resultItem}>
                    <div style={modalStyles.resultInfo}>
                      <div style={{
                        ...modalStyles.resultAvatar,
                        ...(person.role === 'faculty' && modalStyles.facultyAvatar)
                      }}>
                        {person.avatar}
                      </div>
                      <div style={modalStyles.resultDetails}>
                        <div style={modalStyles.resultName}>{person.name}</div>
                        <div style={modalStyles.resultMeta}>
                          {person.role} • {person.department || person.course}
                          {person.mutualFriends > 0 && (
                            <span> • {person.mutualFriends} mutual friends</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button 
                      style={{...modalStyles.actionButton, ...modalStyles.addFriendBtn}}
                      onClick={() => handleSendFriendRequest(person)}
                    >
                      Add Friend
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const styles = {
    container: {
      width: '320px',
      backgroundColor: 'white',
      borderRight: '1px solid #e3e6f0',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    },
    header: {
      padding: '20px',
      borderBottom: '1px solid #e3e6f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1f2f70',
      margin: 0
    },
    newMessage: {
      padding: '8px 16px',
      backgroundColor: '#1cc88a',
      color: 'white',
      border: 'none',
      borderRadius: '20px',
      fontSize: '13px',
      cursor: 'pointer',
      ':hover': {
        backgroundColor: '#169b6b'
      }
    },
    list: {
      flex: 1,
      overflowY: 'auto'
    },
    chatItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px 20px',
      cursor: 'pointer',
      borderBottom: '1px solid #f8f9fc',
      transition: 'background-color 0.2s',
      ':hover': {
        backgroundColor: '#f8f9fc'
      }
    },
    selected: {
      backgroundColor: '#f0f9ff'
    },
    avatar: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      backgroundColor: '#4e73df',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: '600',
      flexShrink: 0
    },
    facultyAvatar: {
      backgroundColor: '#1cc88a'
    },
    friendBadge: {
      position: 'relative',
      top: '-2px',
      right: '-2px',
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      backgroundColor: '#1cc88a',
      border: '2px solid white'
    },
    content: {
      flex: 1,
      minWidth: 0
    },
    name: {
      fontSize: '15px',
      fontWeight: '600',
      color: '#1f2f70',
      marginBottom: '2px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    preview: {
      fontSize: '13px',
      color: '#858796',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    meta: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '4px'
    },
    time: {
      fontSize: '12px',
      color: '#b7b9cc',
      whiteSpace: 'nowrap'
    },
    unreadBadge: {
      backgroundColor: '#4e73df',
      color: 'white',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '600',
      minWidth: '20px',
      textAlign: 'center'
    },
    empty: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#858796',
      fontSize: '14px',
      padding: '20px',
      textAlign: 'center'
    }
  };

  return (
    <>
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>Messages</h3>
          <button style={styles.newMessage} onClick={() => setShowNewModal(true)}>+ New</button>
        </div>
        
        <div style={styles.list}>
          {mockMessages.map(msg => (
            <div 
              key={msg.id}
              style={{
                ...styles.chatItem,
                ...(selectedChat === `msg${msg.id}` && styles.selected)
              }}
              onClick={() => onSelectChat(`msg${msg.id}`)}
            >
              <div style={{
                ...styles.avatar,
                ...(msg.role === 'faculty' && styles.facultyAvatar)
              }}>
                {msg.contact.charAt(0)}
              </div>
              
              <div style={styles.content}>
                <div style={styles.name}>{msg.contact}</div>
                <div style={styles.preview}>{msg.preview}</div>
              </div>
              
              <div style={styles.meta}>
                <span style={styles.time}>{msg.time}</span>
                {msg.unread > 0 && (
                  <div style={styles.unreadBadge}>{msg.unread}</div>
                )}
              </div>
            </div>
          ))}
          
          {mockMessages.length === 0 && (
            <div style={styles.empty}>
              No messages yet. Start a conversation!
            </div>
          )}
        </div>
      </div>
      
      {showNewModal && (
        <NewMessageModal onClose={() => {
          setShowNewModal(false);
          setNewRecipient('');
          setSearchResults([]);
        }} />
      )}
    </>
  );
};

export default MessageList;
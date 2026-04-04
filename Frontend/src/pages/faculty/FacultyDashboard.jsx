import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import styles from '../../styles/Dashboard.module.css';

const FacultyDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState([]);

  const quickActions = [
    { label: 'Add Material', icon: '📎', path: '/faculty-dashboard/instruction', color: '#4e73df' },
    { label: 'My Schedule', icon: '📅', path: '/faculty-dashboard/scheduling', color: '#1cc88a' },
    { label: 'Post Event', icon: '🎉', path: '/faculty-dashboard/events', color: '#f6c23e' },
    { label: 'Social Hub', icon: '💬', path: '/faculty-dashboard/social', color: '#36b9cc' },
    { label: 'Take Attendance', icon: '📊', path: '#', color: '#f6c23e' }
  ];

  const [todaySchedule, setTodaySchedule] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  return (
    <>
      <section className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>
          Welcome back, {user?.name}! 📚
        </h1>
        <p className={styles.welcomeSubtitle}>
          Here's your teaching overview for today.
        </p>
      </section>

      <section className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <article key={index} className={styles.statCard} style={{ '--stat-color': stat.color }}>
            <div className={styles.statIcon} style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.quickActionsGrid}>
        {quickActions.map((action, index) => (
          <Link
            key={index}
            to={action.path}
            className={styles.actionButton}
          >
            <span className={styles.actionIcon}>{action.icon}</span>
            <span>{action.label}</span>
          </Link>
        ))}
      </section>

      <section className={styles.mainGrid}>
        <article className={`${styles.card} ${styles.scheduleCard}`}>
          <header className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>📅 Today's Teaching Schedule</h2>
            <Link to="/faculty-dashboard/scheduling" className={styles.viewAllLink}>
              View Schedule →
            </Link>
          </header>
          <div className={styles.scheduleList}>
            {todaySchedule.map((item, index) => (
              <div key={index} className={styles.scheduleItem}>
                <div className={styles.scheduleTime}>{item.time}</div>
                <div className={styles.scheduleContent}>
                  <div className={styles.scheduleCourse}>{item.course}</div>
                  <div className={styles.scheduleMeta}>
                    <span>{item.room}</span> • <span>{item.students} students</span>
                  </div>
                </div>
                <button className={styles.scheduleAction}>View Class</button>
              </div>
            ))}
          </div>
        </article>

        <article className={`${styles.card} ${styles.activityCard}`}>
          <header className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>🔄 Recent Activity</h2>
          </header>
          <div className={styles.activityList}>
            {recentActivity.map((activity, index) => (
              <div key={index} className={styles.activityItem}>
                <div className={styles.activityDot}></div>
                <div className={styles.activityContent}>
                  <div className={styles.activityText}>{activity.action}</div>
                  <div className={styles.activityTime}>{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
};

// Note: These styles should be moved to your Dashboard.module.css file
// This is just for reference - DO NOT include in this component file
/*
.quickActionsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.actionButton {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 12px;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.actionButton:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.actionIcon {
  font-size: 1.25rem;
}

.scheduleAction {
  padding: 0.25rem 0.75rem;
  background-color: #1cc88a;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.scheduleAction:hover {
  background-color: #169b6b;
}

.activityDot {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
  background-color: #1cc88a;
  margin-top: 0.375rem;
  flex-shrink: 0;
}

.activityContent {
  flex: 1;
}

.activityText {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.activityTime {
  font-size: 0.75rem;
  color: #858796;
}
*/

export default FacultyDashboard;
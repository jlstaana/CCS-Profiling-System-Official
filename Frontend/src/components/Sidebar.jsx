import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styles from '../styles/Sidebar.module.css';

const Sidebar = ({ collapsed, mobileOpen, toggleSidebar, userRole, isMobile }) => {
  const location = useLocation();

  const getNavItems = () => {
    const basePath = `/${userRole}-dashboard`;
    
    switch(userRole) {
      case 'student':
        return [
          { path: '/dashboard', icon: '📊', label: 'Dashboard', section: 'main' },
          { path: `${basePath}/instruction`, icon: '📚', label: 'Instruction', section: 'academic' },
          { path: `${basePath}/scheduling`, icon: '📅', label: 'Scheduling', section: 'academic' },
          { path: `${basePath}/events`, icon: '🎉', label: 'Events', section: 'academic' },
          { path: `${basePath}/violations`, icon: '⚠️', label: 'My Violations', section: 'academic' },
          { path: `${basePath}/social`, icon: '🌐', label: 'Social Feed', section: 'social' },
          { path: `${basePath}/study-groups`, icon: '👥', label: 'Study Groups', section: 'social' },
        ];
      case 'faculty':
        return [
          { path: '/dashboard', icon: '📊', label: 'Dashboard', section: 'main' },
          { path: `${basePath}/instruction`, icon: '📚', label: 'Instruction', section: 'academic' },
          { path: `${basePath}/scheduling`, icon: '📅', label: 'Scheduling', section: 'academic' },
          { path: `${basePath}/events`, icon: '🎉', label: 'Events', section: 'academic' },
          { path: `${basePath}/violations`, icon: '⚠️', label: 'Violation Records', section: 'academic' },
          { path: `${basePath}/social`, icon: '🌐', label: 'Social Feed', section: 'social' },
          { path: `${basePath}/study-groups`, icon: '👥', label: 'Study Groups', section: 'social' },
        ];
      case 'admin':
        return [
          { path: '/dashboard', icon: '📊', label: 'Dashboard', section: 'main' },
          { path: '/users', icon: '👥', label: 'Manage Users', section: 'academic' },
          { path: '/reports', icon: '📝', label: 'Reports', section: 'main' },
          { path: `${basePath}/approvals`, icon: '✅', label: 'Profile Approvals', section: 'academic' },
          { path: `${basePath}/instruction`, icon: '📚', label: 'Instruction', section: 'academic' },
          { path: `${basePath}/scheduling`, icon: '📅', label: 'Scheduling', section: 'academic' },
          { path: `${basePath}/events`, icon: '🎉', label: 'Events', section: 'academic' },
          { path: `${basePath}/violations`, icon: '⚠️', label: 'Violation Records', section: 'academic' },
          { path: `${basePath}/social`, icon: '🌐', label: 'Social Feed', section: 'social' },
          { path: `${basePath}/study-groups`, icon: '👥', label: 'Study Groups', section: 'social' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  // Group items by section
  const mainItems = navItems.filter(item => item.section === 'main');
  const academicItems = navItems.filter(item => item.section === 'academic');
  const socialItems = navItems.filter(item => item.section === 'social');
  const toolsItems = navItems.filter(item => item.section === 'tools');

  const handleNavClick = () => {
    if (isMobile && toggleSidebar) {
      toggleSidebar();
    }
  };

  const renderNavLink = (item) => (
    <NavLink
      key={item.path}
      to={item.path}
      className={({ isActive }) => 
        `${styles.navLink} ${isActive || location.pathname === item.path ? styles.active : ''}`
      }
      onClick={handleNavClick}
      end={item.path === `/${userRole}-dashboard`} // Only exact match for dashboard
    >
      <span className={styles.navIcon}>{item.icon}</span>
      {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
    </NavLink>
  );

  const renderSection = (title, items) => {
    if (items.length === 0) return null;
    
    return (
      <div className={styles.navSection} key={title}>
        {!collapsed && (
          <div className={`${styles.sectionTitle} ${title === 'SOCIAL' ? styles.socialTitle : ''}`}>
            {title}
          </div>
        )}
        {items.map(renderNavLink)}
      </div>
    );
  };

  // Determine sidebar classes
  const sidebarClasses = [
    styles.sidebar,
    collapsed ? styles.collapsed : '',
    mobileOpen ? styles.mobileOpen : ''
  ].filter(Boolean).join(' ');

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <div className={styles.mobileOverlay} onClick={toggleSidebar} />
      )}

      <aside className={sidebarClasses}>
        {/* Logo Section */}
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🎓</span>
          {!collapsed && <span className={styles.logoText}>CCS Profiling</span>}
        </div>

        {/* Desktop Toggle Button */}
        {!isMobile && (
          <button 
            onClick={toggleSidebar} 
            className={styles.toggleBtn}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '→' : '←'}
          </button>
        )}

        {/* Mobile Header */}
        {isMobile && mobileOpen && (
          <div className={styles.mobileHeader}>
            <span className={styles.mobileTitle}>Menu</span>
            <button 
              onClick={toggleSidebar} 
              className={styles.mobileCloseBtn}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className={styles.nav}>
          {renderSection('MAIN', mainItems)}
          {renderSection('ACADEMIC', academicItems)}
          {renderSection('SOCIAL', socialItems)}
          {renderSection('TOOLS', toolsItems)}
        </nav>

        {/* Footer */}
        <div className={styles.footer}>
          {!collapsed && (
            <div className={styles.footerText}>
              <div>CCS Department</div>
              <small>Version 2.0.0</small>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
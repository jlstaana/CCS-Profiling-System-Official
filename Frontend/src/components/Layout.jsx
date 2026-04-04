import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import styles from '../styles/Layout.module.css';

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { user } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(false); // Don't force collapsed on mobile
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    if (isMobile && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [location]);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
      // Prevent body scroll when mobile menu is open
      document.body.style.overflow = !mobileMenuOpen ? 'hidden' : 'unset';
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  // Cleanup body overflow on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Determine main content classes based on sidebar state
  const getMainContentClasses = () => {
    if (isMobile) return styles.mainContent; // No margin on mobile
    
    // On desktop, apply appropriate margin class
    if (sidebarCollapsed) {
      return `${styles.mainContent} ${styles.withSidebarCollapsed}`;
    } else {
      return `${styles.mainContent} ${styles.withSidebar}`;
    }
  };

  return (
    <div className={styles.container}>
      <Sidebar 
        collapsed={sidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        toggleSidebar={toggleSidebar}
        userRole={user?.role}
        isMobile={isMobile}
      />
      
      {/* Mobile overlay */}
      {isMobile && mobileMenuOpen && (
        <div 
          className={styles.mobileOverlay}
          onClick={() => {
            setMobileMenuOpen(false);
            document.body.style.overflow = 'unset';
          }}
        />
      )}

      <div className={getMainContentClasses()}>
        <Navbar 
          toggleMobileMenu={toggleSidebar}
          showMenuButton={isMobile}
          mobileMenuOpen={mobileMenuOpen}
        />
        <main className={styles.content}>
          <div className={styles.pageContainer}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
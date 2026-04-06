import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from '../admin/AdminDashboard';
import FacultyDashboard from '../faculty/FacultyDashboard';
import StudentDashboard from '../student/StudentDashboard';

const UnifiedDashboard = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'faculty':
      return <FacultyDashboard />;
    case 'student':
      return <StudentDashboard />;
    default:
      return <div>Access Denied</div>;
  }
};

export default UnifiedDashboard;

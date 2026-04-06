import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocialProvider } from './context/SocialContext';
import { MessageProvider } from './context/MessageContext'; 
import { ProfileRequestProvider } from './context/ProfileRequestContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingFallback from './components/LoadingFallback';
import { ThemeProvider } from './context/ThemeContext';

// Unified Additions
const UnifiedDashboard = lazy(() => import('./pages/shared/UnifiedDashboard'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const UserDetails = lazy(() => import('./pages/shared/UserDetails'));

// Auth Pages
const StudentLogin = lazy(() => import('./pages/auth/StudentLogin'));
const FacultyLogin = lazy(() => import('./pages/auth/FacultyLogin'));
const AdminLogin = lazy(() => import('./pages/auth/AdminLogin'));

// Student Pages
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const StudentInfo = lazy(() => import('./pages/student/StudentInfo'));

// Faculty Pages
const FacultyDashboard = lazy(() => import('./pages/faculty/FacultyDashboard'));
const FacultyInfo = lazy(() => import('./pages/faculty/FacultyInfo'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UsersManagement = lazy(() => import('./pages/admin/UsersManagement'));
const AdminInfo = lazy(() => import('./pages/admin/AdminInfo'));
const ProfileApprovals = lazy(() => import('./pages/admin/ProfileApprovals'));

// Shared Pages
const Instruction = lazy(() => import('./pages/shared/Instruction'));
const Scheduling = lazy(() => import('./pages/shared/Scheduling'));
const Events = lazy(() => import('./pages/shared/Events'));
const Search = lazy(() => import('./pages/shared/Search'));
const Notifications = lazy(() => import('./pages/shared/Notifications'));
const Violations = lazy(() => import('./pages/shared/Violations'));
const Settings = lazy(() => import('./pages/shared/Settings'));

// Social Pages
const SocialFeed = lazy(() => import('./pages/social/SocialFeed'));
const StudyGroups = lazy(() => import('./pages/social/StudyGroups'));
const Messages = lazy(() => import('./pages/social/Messages'));

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <SocialProvider>
          <MessageProvider>
            <ProfileRequestProvider>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<StudentLogin />} />
                  <Route path="/faculty" element={<FacultyLogin />} />
                  <Route path="/admin" element={<AdminLogin />} />

                  {/* Student Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                    <Route path="/student-dashboard" element={<StudentDashboard />} />
                    <Route path="/student-dashboard/student-info" element={<StudentInfo />} />
                    <Route path="/student-dashboard/instruction" element={<Instruction />} />
                    <Route path="/student-dashboard/scheduling" element={<Scheduling />} />
                    <Route path="/student-dashboard/events" element={<Events />} />
                    <Route path="/student-dashboard/search" element={<Search />} />
                    {/* Social Pages */}
                    <Route path="/student-dashboard/social" element={<SocialFeed />} />
                    <Route path="/student-dashboard/study-groups" element={<StudyGroups />} />
                    <Route path="/student-dashboard/messages" element={<Messages />} />
                    <Route path="/student-dashboard/notifications" element={<Notifications />} />
                    <Route path="/student-dashboard/violations" element={<Violations />} />
                    <Route path="/student-dashboard/settings" element={<Settings />} />
                  </Route>

                  {/* Faculty Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['faculty']} />}>
                    <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
                    <Route path="/faculty-dashboard/faculty-info" element={<FacultyInfo />} />
                    <Route path="/faculty-dashboard/instruction" element={<Instruction />} />
                    <Route path="/faculty-dashboard/scheduling" element={<Scheduling />} />
                    <Route path="/faculty-dashboard/events" element={<Events />} />
                    <Route path="/faculty-dashboard/search" element={<Search />} />
                    {/* Social Pages */}
                    <Route path="/faculty-dashboard/social" element={<SocialFeed />} />
                    <Route path="/faculty-dashboard/study-groups" element={<StudyGroups />} />
                    <Route path="/faculty-dashboard/messages" element={<Messages />} />
                    <Route path="/faculty-dashboard/notifications" element={<Notifications />} />
                    <Route path="/faculty-dashboard/violations" element={<Violations />} />
                    <Route path="/faculty-dashboard/settings" element={<Settings />} />
                  </Route>

                  {/* Admin Routes */}
                  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    <Route path="/admin-dashboard/admin-info" element={<AdminInfo />} />
                    <Route path="/admin-dashboard/approvals" element={<ProfileApprovals />} />
                    <Route path="/admin-dashboard/users" element={<UsersManagement />} />
                    <Route path="/admin-dashboard/instruction" element={<Instruction />} />
                    <Route path="/admin-dashboard/scheduling" element={<Scheduling />} />
                    <Route path="/admin-dashboard/events" element={<Events />} />
                    <Route path="/admin-dashboard/search" element={<Search />} />
                    {/* Social Pages */}
                    <Route path="/admin-dashboard/social" element={<SocialFeed />} />
                    <Route path="/admin-dashboard/study-groups" element={<StudyGroups />} />
                    <Route path="/admin-dashboard/messages" element={<Messages />} />
                    <Route path="/admin-dashboard/notifications" element={<Notifications />} />
                    <Route path="/admin-dashboard/violations" element={<Violations />} />
                    <Route path="/admin-dashboard/settings" element={<Settings />} />
                  </Route>

                  {/* Unified Routes (Part 1, Part 2, Part 6) */}
                  <Route element={<ProtectedRoute allowedRoles={['admin', 'faculty', 'student']} />}>
                    <Route path="/dashboard" element={<UnifiedDashboard />} />
                    <Route path="/users" element={<UsersManagement />} />
                    <Route path="/users/:id" element={<UserDetails />} />
                  </Route>

                  <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/reports" element={<Reports />} />
                  </Route>

                  {/* Catch all */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </ProfileRequestProvider>
          </MessageProvider>
        </SocialProvider>
      </AuthProvider>
    </Router>
    </ThemeProvider>
  );
}

export default App;
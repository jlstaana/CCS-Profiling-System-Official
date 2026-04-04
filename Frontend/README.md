# CCS-Profiling-System-Presentation# 🎓 CCS Profiling System - Complete Documentation

A comprehensive React-based profiling system for the College of Computer Studies (CCS) that manages students, faculty, courses, schedules, events, and social interactions with role-based access control.

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [User Roles](#user-roles)
- [Pages & Components](#pages--components)
- [Social Features](#social-features)
- [Design System](#design-system)
- [Project Structure](#project-structure)
- [Responsive Design](#responsive-design)
- [API Integration](#api-integration)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The CCS Profiling System is a role-based platform designed to streamline academic management for the College of Computer Studies. It provides tailored experiences for three user types with complete academic and social features.

### Key Highlights
- **Role-Based Access**: Students, Faculty, and Admin with specific permissions
- **Academic Management**: Courses, schedules, events, and instruction materials
- **Social Networking**: Posts, comments, messages, study groups, and notifications
- **Real-Time Features**: Live messaging, online status, instant notifications
- **Responsive Design**: Works flawlessly on mobile, tablet, and desktop

## ✨ Features

### 🔐 Authentication & Authorization
- Role-based login pages for Students, Faculty, and Admin
- Protected routes with role verification
- Context API for auth state management
- Demo credentials for testing
- Session persistence with localStorage

### 👨‍🎓 Student Features
- Personal dashboard with academic stats
- View personal information and academic records
- Browse course materials and resources
- Check class schedules and upcoming events
- Social feed interaction (posts, likes, comments)
- Private messaging with faculty and peers
- Join and participate in study groups
- Real-time notifications

### 👨‍🏫 Faculty Features
- Teaching dashboard with course overview
- Manage personal and employment information
- Upload course materials (syllabi, slides, assignments)
- Create and manage class schedules
- Post announcements and events
- Mentor study groups
- Communicate with students via messages
- Post to social feed

### 👑 Admin Features
- System overview dashboard with analytics
- Complete user management (CRUD operations)
- Role-based user filtering
- Course and schedule oversight
- Event management
- System status monitoring
- Enrollment trend visualization
- Moderate social content

### 💬 Social Features

#### 📱 Social Feed
- Create posts with text content
- Like and comment on posts
- Different post types (announcements, events, opportunities)
- Role-based avatars (green for faculty)
- Real-time interaction updates
- Post engagement metrics

#### 💬 Messaging System
- Private one-on-one conversations
- Real-time message sending
- Read receipts (✓ sent, ✓✓ read)
- Online/offline user indicators
- Unread message badges
- Conversation history
- Search conversations
- Start new conversations with any user
- Message timestamps

#### 👥 Study Groups
- Browse available study groups by course
- Create new study groups
- Join/leave groups with member limits
- Group details (members, schedule, description)
- Member avatars display
- Filter groups by course (CS 301, 302, 303, 304)
- Upcoming session information
- Message count indicators

#### 🔔 Notifications
- Real-time notification dropdown in navbar
- Unread notification badges
- Different notification types:
  - Post likes
  - Comments on posts
  - Study group activity
  - Friend requests
  - Messages
- Mark as read functionality
- Mark all as read
- Click to navigate to relevant content
- Timestamp display

## 🛠 Tech Stack

### Frontend Framework
- **React 18** - Functional components with hooks
- **React Router v6** - Navigation and route protection
- **Context API** - State management (Auth, Social, Message)

### Styling
- **CSS-in-JS** with inline styles
- **CSS Modules** for component-specific styles
- **Responsive Design** with mobile-first approach
- **CSS Variables** for consistent theming

### Build Tools
- **Vite** - Fast development and building
- **ESLint** - Code linting
- **npm** - Package management

### UI/UX
- **Emoji Icons** - Visual communication
- **Loading Skeletons** - Async operations
- **Toast Notifications** - User feedback
- **Confirmation Modals** - Destructive actions
- **Keyboard Navigation** - Accessibility

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Step-by-Step Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ccs-profiling-system.git
cd ccs-profiling-system
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Install React Router**
```bash
npm install react-router-dom
# or
yarn add react-router-dom
```

4. **Start the development server**
```bash
npm run dev
# or
yarn dev
```

5. **Build for production**
```bash
npm run build
# or
yarn build
```

6. **Preview production build**
```bash
npm run preview
# or
yarn preview
```

## 🚀 Usage

### Demo Credentials

The system comes with pre-configured demo users for testing:

| Role | Username/ID | Password | Route |
|------|------------|----------|-------|
| **Student** | student123 | any | `/` |
| **Faculty** | Any input | any | `/faculty` |
| **Admin** | Any input | any | `/admin` |

### Accessing Different Portals

1. **Student Portal**: `http://localhost:5173/`
2. **Faculty Portal**: `http://localhost:5173/faculty`
3. **Admin Portal**: `http://localhost:5173/admin`

### Navigation

After login, use the sidebar to navigate:
- **Dashboard** - Main overview
- **Student/Faculty Info** - Personal details
- **Instruction** - Course materials
- **Scheduling** - Class schedules
- **Events** - Upcoming events
- **Social Feed** - Posts and interactions
- **Messages** - Private conversations
- **Study Groups** - Group management
- **Search** - Find anything
- **Notifications** (navbar) - Alerts and updates

## 👥 User Roles

### Student Dashboard
```
┌─────────────────────────────────────┐
│  Welcome back, John! 👋             │
├─────────────────────────────────────┤
│  📚6 Courses   ⭐3.75 GPA           │
├─────────────────────────────────────┤
│  🌐 SOCIAL HUB                       │
│  Feed • Messages • Groups • Notifs  │
├─────────────────────────────────────┤
│  📅 Today's Schedule                 │
│  9:00 AM - CS 301 Database Systems  │
│  11:00 AM - CS 302 Web Development  │
├─────────────────────────────────────┤
│  🎉 Upcoming Events                  │
│  Hackathon • Career Fair • Lecture  │
└─────────────────────────────────────┘
```

### Faculty Dashboard
```
┌─────────────────────────────────────┐
│  Welcome back, Dr. Santos! 📚       │
├─────────────────────────────────────┤
│  📚4 Courses   👥128 Students       │
├─────────────────────────────────────┤
│  ⚡ Quick Actions                    │
│  Add Material • Create Schedule     │
│  Post Event • Post Announcement     │
├─────────────────────────────────────┤
│  📅 Today's Teaching                 │
│  9:00 AM - CS 301 (32 students)     │
│  11:00 AM - CS 302 (28 students)    │
└─────────────────────────────────────┘
```

### Admin Dashboard
```
┌─────────────────────────────────────┐
│  Welcome back, Dr. Chen! 👑         │
├─────────────────────────────────────┤
│  👥1,284 Students  👨‍🏫48 Faculty    │
├─────────────────────────────────────┤
│  ⚡ System Actions                   │
│  Add User • Manage Courses          │
│  Create Event • Post Announcement   │
├─────────────────────────────────────┤
│  📊 Enrollment Trends                │
│  [Chart visualization]              │
└─────────────────────────────────────┘
```

## 📄 Pages & Components

### Authentication Pages
| Page | Route | Description |
|------|-------|-------------|
| Student Login | `/` | Student login with ID/password |
| Faculty Login | `/faculty` | Faculty login with green theme |
| Admin Login | `/admin` | Admin login with yellow theme |

### Student Pages
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/student-dashboard` | Overview with stats and schedule |
| Student Info | `/student-dashboard/student-info` | Personal and academic details |
| Instruction | `/student-dashboard/instruction` | Course materials viewer |
| Scheduling | `/student-dashboard/scheduling` | Class schedule viewer |
| Events | `/student-dashboard/events` | Event calendar and list |
| Search | `/student-dashboard/search` | Global search |
| Social Feed | `/student-dashboard/social` | Social media feed |
| Messages | `/student-dashboard/messages` | Private messaging |
| Study Groups | `/student-dashboard/study-groups` | Group management |

### Faculty Pages
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/faculty-dashboard` | Teaching overview |
| Faculty Info | `/faculty-dashboard/faculty-info` | Professional details |
| Instruction | `/faculty-dashboard/instruction` | Material management |
| Scheduling | `/faculty-dashboard/scheduling` | Schedule management |
| Events | `/faculty-dashboard/events` | Event management |
| Social Feed | `/faculty-dashboard/social` | Post announcements |
| Messages | `/faculty-dashboard/messages` | Message students |
| Study Groups | `/faculty-dashboard/study-groups` | Mentor groups |

### Admin Pages
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/admin-dashboard` | System overview |
| Users | `/admin-dashboard/users` | User management |
| Instruction | `/admin-dashboard/instruction` | Course oversight |
| Scheduling | `/admin-dashboard/scheduling` | Schedule oversight |
| Events | `/admin-dashboard/events` | Event oversight |
| Social Feed | `/admin-dashboard/social` | Content moderation |
| Messages | `/admin-dashboard/messages` | System messages |
| Study Groups | `/admin-dashboard/study-groups` | Group oversight |

## 💬 Social Features Deep Dive

### Social Feed Component
```jsx
<SocialFeed />
```
- Create posts with text content
- Like/unlike posts
- Comment on posts
- View engagement metrics
- Different post types with badges

### Messages Component
```jsx
<Messages />
```
- Real-time conversation list
- Online/offline indicators
- Unread message badges
- Message input with Enter to send
- File attachment support
- Read receipts

### Study Groups Component
```jsx
<StudyGroups />
```
- Browse all groups
- Filter by course
- Create new groups
- Join/leave functionality
- Member avatars display
- Group details view

### ConnectButton Component
```jsx
<ConnectButton 
  userName="John Doe"
  connected={false}
  variant="default"
  size="md"
  onConnect={() => {}}
/>
```
- Send friend requests
- Multiple variants (default, icon, compact)
- Multiple sizes (sm, md, lg)
- Loading states
- Success indicators

### CommentSection Component
```jsx
<CommentSection
  comments={comments}
  onAddComment={handleAddComment}
/>
```
- Display comment threads
- Add new comments
- Role-based avatars
- Timestamp display
- Empty state handling

## 🎨 Design System

### Color Palette
```css
Primary: #1f2f70     /* Deep blue - headers, primary buttons */
Secondary: #1cc88a    /* Mint green - success, faculty accent */
Accent: #f6c23e       /* Yellow - warnings, admin accent */
Danger: #e74a3b       /* Red - errors, destructive actions */
Info: #36b9cc         /* Cyan - information */
Background: #f8f9fc   /* Light gray - page background */
White: #ffffff        /* Cards and containers */
Text: #5a5c69        /* Body text */
Text Muted: #858796   /* Secondary text */
```

### Typography
- **Font Family**: 'Segoe UI', system fonts
- **Body Text**: 14px
- **Headings**: 16-24px
- **Small Text**: 11-12px
- **Line Height**: 1.5 for readability

### Component Styles
- **Cards**: Subtle shadows (0 4px 15px rgba(0,0,0,0.05))
- **Corners**: Rounded (8-14px)
- **Transitions**: Smooth (0.3s ease)
- **Buttons**: Gradient backgrounds, hover effects
- **Badges**: Color-coded role indicators
- **Avatars**: Circular with initials
- **Modals**: Centered with overlay

## 📁 Project Structure

```
ccs-profiling-system/
├── public/
│   ├── favicon.svg
│   └── index.html
├── src/
│   ├── components/
│   │   ├── social/
│   │   │   ├── CommentSection.jsx
│   │   │   └── ConnectButton.jsx
│   │   ├── Layout.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── Sidebar.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── MessageContext.jsx
│   │   └── SocialContext.jsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── StudentLogin.jsx
│   │   │   ├── FacultyLogin.jsx
│   │   │   └── AdminLogin.jsx
│   │   ├── student/
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── StudentInfo.jsx
│   │   ├── faculty/
│   │   │   ├── FacultyDashboard.jsx
│   │   │   └── FacultyInfo.jsx
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── UsersManagement.jsx
│   │   ├── shared/
│   │   │   ├── Instruction.jsx
│   │   │   ├── Scheduling.jsx
│   │   │   ├── Events.jsx
│   │   │   └── Search.jsx
│   │   └── social/
│   │       ├── SocialFeed.jsx
│   │       ├── StudyGroups.jsx
│   │       └── Messages.jsx
│   ├── styles/
│   │   ├── Dashboard.module.css
│   │   ├── Layout.module.css
│   │   ├── Navbar.module.css
│   │   └── Sidebar.module.css
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .gitignore
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

## 📱 Responsive Design

The system is fully responsive with three breakpoints:

### Desktop (1025px+)
- Full sidebar visible (280px)
- Multi-column layouts
- Expanded navigation
- Hover effects enabled

### Tablet (769px - 1024px)
- Collapsible sidebar option
- 2-column grids
- Adjusted spacing
- Touch-friendly targets

### Mobile (up to 768px)
- Hidden sidebar with menu button
- Single column layouts
- Full-width elements
- Stacked navigation
- Touch targets (44x44px)
- Bottom sheet modals

### Small Mobile (up to 480px)
- Reduced font sizes
- Icon-only buttons
- Minimal padding
- Simplified layouts

## 🔌 API Integration

### Context Providers

```jsx
// App.jsx
<AuthProvider>
  <SocialProvider>
    <MessageProvider>
      <Routes>
        {/* Application routes */}
      </Routes>
    </MessageProvider>
  </SocialProvider>
</AuthProvider>
```

### Authentication Context
```javascript
const { user, login, logout } = useAuth();
```

### Social Context
```javascript
const { 
  posts, 
  notifications, 
  studyGroups,
  createPost,
  likePost,
  addComment 
} = useSocial();
```

### Message Context
```javascript
const {
  conversations,
  sendMessage,
  startNewConversation,
  getUnreadCount
} = useMessages();
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Coding Standards
- Use functional components with hooks
- Follow existing code style
- Add comments for complex logic
- Test responsiveness
- Ensure accessibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **College of Computer Studies** - For the requirements and support
- **React Community** - For excellent documentation and tools
- **Open Source Contributors** - For inspiring solutions
- **Test Users** - For valuable feedback

## 📞 Support

For issues or questions:
- 📧 Email: support@ccs.edu
- 💬 Create an issue on GitHub
- 📚 Check the documentation

---

Version 2.0.0 | Last Updated: March 2026
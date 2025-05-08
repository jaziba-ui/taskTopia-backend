# TaskTopia Website

A full-stack task management system with user authentication, role-based access control, real-time notifications, and advanced filtering capabilities.

## Features

### ✅ User Authentication
- Sign up, login, logout functionality.
- JWT-based authentication with secure HTTP-only cookies.
- Password hashing using bcrypt.
- User roles (Admin, Manager, User) assigned at registration or by Admin.

### ✅ Task Management
- Create, update, delete, and view tasks.
- Tasks contain:
  - Title, description
  - Status (To Do, In Progress, Done)
  - Priority (Low, Medium, High)
  - Due Date
  - Assigned user (Manager/Admin only)

### ✅ Role-Based Access Control (RBAC)
- **Admin**: Full access to all tasks and user management.
- **Manager**: Can assign tasks and view team progress.
- **User**: Can only view and update their own tasks.

### ✅ Notifications
- In-app notification system with bell icon dropdown.
- Notifications triggered on:
  - Task assignment
  - Task updates
- Read/unread status for notifications.
- Notification badge for unread count.
- Custom notification settings (In-app / Email / Mute).

### ✅ Search & Filter
- Search tasks by title or description.
- Filter by:
  - Status
  - Priority
  - Due Date (before / after / today)

### ✅ UI & UX Enhancements
- Responsive design for mobile and desktop using Tailwind CSS.
- Icons integrated with `react-icons` for better visual hierarchy.
- Clean, accessible layout with modern UI components (cards, modals, buttons, etc.).

## Tech Stack

### 🔹 Frontend
- React.js
- Axios
- Tailwind CSS
- React Router DOM
- React Icons

### 🔹 Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Socket.IO (for real-time notifications)

### 🔹 Tools & Utilities
- Dotenv for environment variables
- CORS configuration
- Middleware for auth and role checks


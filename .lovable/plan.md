

# Visitor Management System (VMS)

## Overview
A premium SaaS-style Visitor Management System with glassmorphism design, smooth animations, and full visitor tracking functionality.

## Design System
- **Style**: Glassmorphism with soft gradients, neon accents, floating 3D shapes
- **Colors**: Deep purple/blue gradients for backgrounds, soft neon highlights (cyan, violet, pink)
- **Effects**: Backdrop blur cards, hover animations, smooth transitions, floating abstract shapes
- **Typography**: Clean modern fonts with proper hierarchy

## Pages & Features

### 1. Login Page
- Animated gradient background with floating 3D geometric shapes
- Centered glassmorphism card with pre-filled credentials (admin@gmail.com / admin@12)
- Glowing submit button with loading state
- Error toast on invalid credentials
- Frontend-only auth stored in React state/context

### 2. Dashboard
- Top navbar with admin profile info and logout button
- Sidebar navigation for all pages
- 4 stat cards with icons, hover 3D lift effects, and animated counters:
  - Total Visitors, Today's Visitors, Approved, Rejected
- Recent visitors mini-table
- Stats derived from in-memory visitor data

### 3. Add Visitor Page
- Modern form with icon-prefixed inputs and floating label feel
- Fields: Full Name, Email, Phone, Purpose, Person to Meet, Date & Time
- Real-time validation with inline error messages
- Submit with loading animation, success toast, and redirect

### 4. Visitor List Page
- Responsive data table with search bar and status filter dropdown
- Color-coded status badges (green=Approved, red=Rejected, yellow=Pending)
- Action buttons: Approve, Reject, Delete (with confirmation dialog)
- Sample seed data pre-loaded for demo

### 5. Shared Elements
- Auth context with protected routes
- Toast notifications for all actions
- Smooth page transitions
- Fully responsive layout (mobile hamburger menu)
- Floating decorative shapes on backgrounds for depth

## Architecture
- React Context for auth state and visitor data (no backend needed)
- React Router for page navigation
- All data stored in-memory with sample seed data
- Shadcn UI components styled with glassmorphism overrides


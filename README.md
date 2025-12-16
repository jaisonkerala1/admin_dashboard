# Admin Dashboard - Astrologer Platform Management

A modern, responsive admin dashboard for managing the entire Astrologer Platform. Built with React, TypeScript, and Tailwind CSS.

## Features

- **Dashboard Overview**: Platform-wide statistics and analytics
- **Astrologer Management**: Approve, suspend, edit, and delete astrologers
- **User Management**: View and manage all users/clients
- **Service Management**: Approve, reject, and manage astrologer services
- **Consultation Management**: Monitor and manage all consultations
- **Live Stream Monitoring**: Monitor active streams and force-end if needed
- **Review Moderation**: Moderate and delete inappropriate reviews
- **Discussion Moderation**: Moderate discussions, delete posts/comments
- **Analytics**: Revenue tracking, growth metrics, and insights

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide Icons
- **State Management**: Zustand
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Data Tables**: TanStack Table
- **Charts**: Recharts
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:5000`

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Update .env.local with your admin secret key
VITE_API_BASE_URL=http://localhost:5000/api
VITE_ADMIN_SECRET_KEY=your-admin-secret-key
```

### Development

```bash
# Start dev server (runs on port 3001)
npm run dev
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
admin_dashboard/
├── src/
│   ├── api/           # API client and endpoints
│   ├── components/    # Reusable components
│   │   ├── common/    # Common UI components
│   │   └── layout/    # Layout components
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components
│   ├── store/         # Zustand stores
│   ├── types/         # TypeScript definitions
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Main app component
│   └── main.tsx       # Entry point
├── public/            # Static assets
└── index.html         # HTML template
```

## Authentication

The admin dashboard uses a simple secret key authentication:
- Admin secret key is stored in backend `.env` as `ADMIN_SECRET_KEY`
- Frontend sends this key via `x-admin-key` header
- All admin API routes are protected with this authentication

## API Integration

All API calls are made to the backend at `/api/admin/*` endpoints. The admin routes include:

- `/api/admin/login` - Admin authentication
- `/api/admin/dashboard/stats` - Platform statistics
- `/api/admin/astrologers/*` - Astrologer CRUD operations
- `/api/admin/users/*` - User management
- `/api/admin/consultations/*` - Consultation management
- `/api/admin/services/*` - Service management
- `/api/admin/reviews/*` - Review moderation
- `/api/admin/live-streams/*` - Live stream monitoring
- `/api/admin/discussions/*` - Discussion moderation
- `/api/admin/analytics/*` - Analytics data

## License

Private - All rights reserved


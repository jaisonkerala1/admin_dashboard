# Admin Dashboard - Setup Guide

This guide will help you set up and run the Admin Dashboard for the Astrologer Platform.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Backend server running on `http://localhost:5000`

## Installation Steps

### 1. Install Dependencies

Open a terminal in the `admin_dashboard` folder and run:

```bash
npm install
```

This will install all required packages including:
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- React Router
- Axios
- Recharts (analytics charts)
- And more...

### 2. Configure Environment Variables

Create a `.env.local` file in the root of the `admin_dashboard` folder:

```bash
# Copy the example file
cp .env.example .env.local
```

Then edit `.env.local` and set your admin secret key:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_ADMIN_SECRET_KEY=your-secure-admin-key-change-this-in-production
```

**Important:** Make sure the `VITE_ADMIN_SECRET_KEY` matches the `ADMIN_SECRET_KEY` in your backend `.env` file!

### 3. Start Development Server

```bash
npm run dev
```

The admin dashboard will be available at:
```
http://localhost:3001
```

### 4. Login

Use the admin secret key you configured to login:

1. Open http://localhost:3001
2. Enter your `ADMIN_SECRET_KEY` from the backend `.env` file
3. Click "Sign In"

## Available Scripts

- `npm run dev` - Start development server (port 3001)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Backend Setup

Make sure your backend is configured correctly:

### 1. Backend Environment Variable

Your backend `.env` file should have:

```env
ADMIN_SECRET_KEY=your-secure-admin-key-change-this-in-production
```

### 2. Start Backend Server

Navigate to your backend folder and start the server:

```bash
cd backend
npm start
```

The backend should be running on `http://localhost:5000`

## Features Overview

Once logged in, you'll have access to:

### Dashboard
- Platform-wide statistics
- Astrologer, user, and consultation metrics
- Revenue overview
- Quick links to pending approvals

### Astrologer Management
- View all astrologers
- Approve pending applications
- Suspend/unsuspend astrologers
- Edit astrologer details
- View detailed stats for each astrologer

### User Management
- View all platform users
- Ban/unban users
- View user activity and spending
- Search and filter users

### Consultation Management
- Monitor all consultations
- View consultation history
- Filter by status (pending, ongoing, completed, cancelled)

### Service Management
- View all astrologer services
- Approve/reject service submissions
- Monitor service performance
- View ratings and reviews

### Review Moderation
- View all reviews
- Hide inappropriate reviews
- Delete reviews
- Track review statistics

### Live Stream Monitoring
- Monitor active live streams
- View viewer counts
- Force-end streams if needed
- View stream history

### Discussion Moderation
- View all community discussions
- Hide inappropriate content
- Delete discussions and comments
- Monitor engagement metrics

### Analytics
- Revenue breakdown (consultations, services, live streams)
- Growth metrics (users, astrologers, consultations)
- Interactive charts
- Date range filters (week, month, year)

## Tech Stack

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite (fast development & builds)
- **Styling:** Tailwind CSS (utility-first CSS)
- **State Management:** Zustand (lightweight state management)
- **Routing:** React Router v6
- **HTTP Client:** Axios with interceptors
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts (responsive charts)
- **Icons:** Lucide React

## Project Structure

```
admin_dashboard/
├── public/              # Static assets
│   └── favicon.svg
├── src/
│   ├── api/            # API client and endpoints
│   │   ├── client.ts   # Axios instance with interceptors
│   │   ├── auth.ts
│   │   ├── dashboard.ts
│   │   ├── astrologers.ts
│   │   ├── users.ts
│   │   ├── consultations.ts
│   │   ├── services.ts
│   │   ├── reviews.ts
│   │   ├── liveStreams.ts
│   │   ├── discussions.ts
│   │   └── analytics.ts
│   ├── components/
│   │   ├── common/     # Reusable UI components
│   │   └── layout/     # Layout components (Sidebar, Header)
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── store/          # Zustand stores
│   ├── styles/         # Global styles
│   ├── types/          # TypeScript definitions
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main app with routing
│   └── main.tsx        # Entry point
├── .env.example        # Environment variables template
├── package.json        # Dependencies and scripts
├── tailwind.config.js  # Tailwind configuration
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

## Troubleshooting

### Cannot connect to backend
- Ensure backend is running on `http://localhost:5000`
- Check if `VITE_API_BASE_URL` in `.env.local` is correct
- Verify CORS is enabled in backend

### Login fails
- Verify `VITE_ADMIN_SECRET_KEY` in frontend `.env.local` matches `ADMIN_SECRET_KEY` in backend `.env`
- Check browser console for error messages
- Verify backend `/api/admin/login` endpoint is working

### Port 3001 is already in use
Edit `vite.config.ts` and change the port:
```typescript
server: {
  port: 3002, // Change to any available port
  // ...
}
```

### Build errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

## Production Deployment

### 1. Build the application

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### 2. Environment Variables

For production, update your environment variables:

```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
VITE_ADMIN_SECRET_KEY=your-production-admin-key
```

### 3. Deploy

You can deploy the `dist/` folder to any static hosting service:

- Vercel
- Netlify
- AWS S3 + CloudFront
- Firebase Hosting
- Any web server (nginx, Apache)

## Security Notes

1. **Admin Secret Key:** Never commit your actual admin secret key to version control
2. **HTTPS:** Always use HTTPS in production
3. **Access Control:** Restrict access to the admin dashboard by IP or VPN if possible
4. **Key Rotation:** Regularly rotate the admin secret key
5. **Environment Files:** Never commit `.env.local` or `.env` files

## Support

For issues or questions:
1. Check the browser console for errors
2. Check the backend logs
3. Verify all environment variables are set correctly
4. Ensure both frontend and backend are running

## Next Steps

After setup, you might want to:
- Customize the color scheme in `tailwind.config.js`
- Add additional pages or features
- Configure analytics tracking
- Set up production deployment
- Add more admin users (requires backend changes)


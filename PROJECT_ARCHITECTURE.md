# 🏗️ Admin Dashboard - Architecture & Quick Fix Guide

> **Must read before making changes!** This document explains how the admin dashboard connects to the backend and how to fix common issues.

---

## 📁 Project Structure

```
Desktop/
├── admin_dashboard/              ← FRONTEND (Vercel)
│   ├── src/
│   │   ├── api/                  ← Backend API calls
│   │   ├── pages/                ← Dashboard pages
│   │   ├── components/           ← UI components
│   │   └── utils/                ← Helper functions
│   ├── vercel.json               ← Vercel config
│   └── vite.config.ts            ← Dev proxy (NOT used in prod)
│
└── astrologer_app/               ← BACKEND + MOBILE APP
    ├── backend/
    │   └── src/
    │       ├── server.js         ← ⚠️ CORS config here!
    │       ├── routes/
    │       │   └── admin.js      ← Admin API endpoints
    │       └── models/           ← Database schemas
    └── lib/                      ← Flutter mobile app
```

---

## 🔗 How They Connect

```
┌─────────────────────┐
│  Vercel (Frontend)  │  https://admin-dashboard-xxx.vercel.app
│  admin_dashboard/   │
└──────────┬──────────┘
           │
           │ API calls with x-admin-key header
           │
           ▼
┌─────────────────────┐
│ Railway (Backend)   │  https://astrologerapp-production.up.railway.app
│ astrologer_app/     │
│    backend/         │
└─────────────────────┘
```

### Key Connection Points:

1. **Frontend API Client:** `admin_dashboard/src/api/client.ts`
2. **Backend Entry:** `astrologer_app/backend/src/server.js`
3. **Admin Routes:** `astrologer_app/backend/src/routes/admin.js`

---

## ⚙️ Configuration Files

### Frontend (Vercel)
| File | Purpose |
|------|---------|
| `vercel.json` | Deployment config, rewrites for SPA |
| `vite.config.ts` | Dev server proxy (localhost only) |
| `.env.local` | Environment variables (gitignored) |

**Environment Variables (Set in Vercel Dashboard):**
```env
VITE_API_BASE_URL=https://astrologerapp-production.up.railway.app/api
VITE_ADMIN_SECRET_KEY=admin123
```

### Backend (Railway)
| File | Purpose |
|------|---------|
| `server.js` | Express server, CORS, static files |
| `routes/admin.js` | All admin API endpoints |

**Environment Variables (Set in Railway Dashboard):**
```env
CORS_ORIGIN=*
ADMIN_SECRET_KEY=admin123
PORT=7566
```

---

## 🚨 Common Issues & Fixes

### Issue 1: CORS Error - "Not allowed by CORS"

**Symptom:** Login fails with CORS error in browser console

**Where to Fix:** `astrologer_app/backend/src/server.js` (lines 47-78)

**Solution:**
```javascript
// CORS configuration in server.js
app.use(cors({
  origin: function(origin, callback) {
    // Allow vercel.app domains
    if (origin.includes('vercel.app')) {
      return callback(null, true);
    }
    // ... other checks
  }
}));
```

**Quick Fix:**
1. Go to Railway Dashboard
2. Add/update: `CORS_ORIGIN = *`
3. Restart backend

---

### Issue 2: Profile Pictures Not Loading

**Symptom:** Images return 404 or CORS blocked

**Root Cause:** Two issues
1. Railway filesystem is ephemeral (uploads deleted on deploy)
2. Static file CORS headers missing

**Where to Fix:** 
- Backend: `astrologer_app/backend/src/server.js` (line 85)
- Frontend: `admin_dashboard/src/utils/helpers.ts` (getImageUrl function)

**Solution:**
```javascript
// Backend: Add CORS headers for uploads
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static('uploads'));
```

**Permanent Fix:**
- Use Cloudinary or AWS S3 for image storage
- Or add Railway Volume: `/app/uploads`

---

### Issue 3: TypeScript Build Errors on Vercel

**Symptom:** Build fails with type errors

**Common Causes:**
1. DashboardStats structure mismatch
2. Nullable fields not handled
3. Unused imports

**Where to Check:**
- `admin_dashboard/src/types/index.ts`
- `admin_dashboard/src/pages/Dashboard.tsx`

**Quick Fix:**
```typescript
// Always handle undefined/null
const data = response.data || null;

// Use optional chaining
stats?.astrologers?.total || 0
```

---

### Issue 4: Environment Variables Not Working

**Symptom:** App can't connect to backend

**Frontend (Vercel):**
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add for ALL environments (Production, Preview, Development)
3. Redeploy after adding

**Backend (Railway):**
1. Go to Railway Dashboard → Service → Variables
2. Add variables
3. Railway auto-restarts

**⚠️ Important:**
- Frontend: Use `VITE_` prefix (e.g., `VITE_API_BASE_URL`)
- Backend: No prefix needed (e.g., `CORS_ORIGIN`)

---

## 🔄 Deployment Flow

### Frontend Changes
```
1. Edit code in admin_dashboard/
2. git add . && git commit -m "message"
3. git push origin main
4. Vercel auto-deploys (1-2 min)
5. Check: https://admin-dashboard-xxx.vercel.app
```

### Backend Changes
```
1. Edit code in astrologer_app/backend/
2. git add . && git commit -m "message"
3. git push origin main
4. Railway auto-deploys (2-3 min)
5. Check: https://astrologerapp-production.up.railway.app/api/health
```

---

## 🔍 Debugging Tools

### Check Backend Health
```bash
curl https://astrologerapp-production.up.railway.app/api/health
```

### Test Admin Login
```bash
curl -X POST https://astrologerapp-production.up.railway.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"adminKey":"admin123"}'
```

### Check CORS
```bash
curl -H "Origin: https://admin-dashboard-xxx.vercel.app" \
  -I https://astrologerapp-production.up.railway.app/api/admin/login
```

### View Railway Logs
1. Railway Dashboard → Service → Deployments
2. Click deployment → View Logs

### View Vercel Logs
1. Vercel Dashboard → Project → Deployments
2. Click deployment → Build Logs / Runtime Logs

---

## 📝 Important URLs

| Resource | URL |
|----------|-----|
| **Frontend (Live)** | https://admin-dashboard-seven-sigma-56.vercel.app |
| **Backend API** | https://astrologerapp-production.up.railway.app/api |
| **Backend Health** | https://astrologerapp-production.up.railway.app/api/health |
| **Vercel Dashboard** | https://vercel.com/dashboard |
| **Railway Dashboard** | https://railway.app/dashboard |
| **GitHub (Frontend)** | https://github.com/jaisonkerala1/admin_dashboard |
| **GitHub (Backend)** | https://github.com/jaisonkerala1/astrologer_app |

---

## 🛠️ Quick Reference

### Adding New Admin Page

1. **Create page:** `admin_dashboard/src/pages/NewPage.tsx`
2. **Add route:** `admin_dashboard/src/App.tsx`
3. **Add to sidebar:** `admin_dashboard/src/components/layout/Sidebar.tsx`
4. **Create API file:** `admin_dashboard/src/api/newpage.ts`
5. **Add backend route:** `astrologer_app/backend/src/routes/admin.js`

### Adding New API Endpoint

1. **Backend:** Add route in `astrologer_app/backend/src/routes/admin.js`
2. **Frontend:** Add function in `admin_dashboard/src/api/[module].ts`
3. **Types:** Update `admin_dashboard/src/types/index.ts`
4. **Use in page:** Import and call from component

---

## 🚀 Performance Tips

1. **Images:** Use Cloudinary/S3 instead of Railway filesystem
2. **API Calls:** Batch requests where possible
3. **Caching:** Consider Redis for frequently accessed data
4. **Database:** Add indexes on frequently queried fields

---

## 🔐 Security Checklist

- [ ] Never commit `.env` or `.env.local`
- [ ] Rotate `ADMIN_SECRET_KEY` regularly
- [ ] Use specific CORS origins in production (not `*`)
- [ ] Enable rate limiting on sensitive endpoints
- [ ] Use HTTPS only (both platforms enforce this)
- [ ] Sanitize user inputs on backend

---

## 📚 Tech Stack Reference

### Frontend
- **Framework:** React 18 + TypeScript
- **Build:** Vite
- **Styling:** Tailwind CSS
- **State:** Zustand + Redux Saga
- **Routing:** React Router v6
- **HTTP:** Axios
- **Charts:** Recharts

### Backend
- **Runtime:** Node.js + Express
- **Database:** MongoDB (in-memory for now)
- **Auth:** Custom admin key
- **CORS:** Express CORS middleware
- **Files:** Express static (ephemeral)

---

## 💡 Tips for Future Development

1. **Before changing backend CORS:**
   - Check `server.js` lines 47-78
   - Test with `curl` before deploying

2. **Before adding API endpoints:**
   - Add to backend `routes/admin.js` first
   - Then create frontend API function
   - Update TypeScript types

3. **When Vercel build fails:**
   - Check TypeScript errors in logs
   - Verify all imports exist
   - Ensure types match API response

4. **When Railway deploys fail:**
   - Check for syntax errors
   - Verify all `require()` paths exist
   - Check Railway logs for details

---

## 📞 Need Help?

1. **Check this file first!** Most issues are covered here
2. **Check Railway/Vercel logs** for error details
3. **Test backend health endpoint** to verify it's running
4. **Clear browser cache** if frontend acting weird
5. **Hard refresh** (Ctrl+F5) after deployments

---

**Last Updated:** December 16, 2025  
**Project Status:** ✅ Production Ready




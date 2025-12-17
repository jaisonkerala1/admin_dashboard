# 🔴 Live Stream Viewer Setup Guide

## Overview
The admin dashboard now includes a **live stream viewer** that allows you to watch and control active streams with admin privileges.

---

## Features

### 🎥 Watch Live Streams
- View live video/audio from astrologers
- Real-time viewer count
- Stream duration tracking
- Like count display

### 🛡️ Admin Controls
- **End Stream**: Terminate any live stream
- **Mute/Unmute**: Control audio playback
- **Real-time Stats**: Monitor engagement metrics
- **Confirmation Dialog**: Prevents accidental stream termination

---

## Setup Instructions

### 1. Get Agora App ID

1. Go to [Agora Console](https://console.agora.io/)
2. Sign up / Log in
3. Create a new project
4. Copy your **App ID**

### 2. Configure Environment Variables

Add to your `.env.local`:

```bash
VITE_AGORA_APP_ID=your_agora_app_id_here
```

### 3. Install Dependencies

Already done! The package is installed:
```bash
npm install agora-rtc-sdk-ng
```

### 4. Backend Configuration (Optional)

For production, you should implement **Agora Token Server** on the backend:

**File**: `astrologer_app/backend/src/routes/admin.js`

```javascript
// Add this endpoint
router.get('/live-streams/:id/token', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const stream = await LiveStream.findById(id);
    
    if (!stream) {
      return res.status(404).json({ success: false, message: 'Stream not found' });
    }

    // Generate Agora token
    const token = generateAgoraToken(stream.agoraChannelName);
    
    res.json({ 
      success: true, 
      data: { 
        token,
        channelName: stream.agoraChannelName 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

---

## How to Use

### From Dashboard:

1. Go to **Dashboard** page
2. Look for **"Currently Live"** section (appears when streams are active)
3. Click **"Watch"** button on any live stream
4. Stream viewer modal opens with:
   - Live video feed
   - Real-time stats (viewers, likes, duration)
   - Admin controls (mute, end stream)

### Admin Controls:

**Mute/Unmute Audio**:
- Click volume icon (bottom right)
- Toggles audio playback

**End Stream**:
- Click "End Stream" button
- Confirm action in dialog
- Stream ends for all viewers

**Close Viewer**:
- Click X icon (top right)
- Returns to dashboard

---

## Architecture

### Frontend (Admin Dashboard)
```
src/
├── components/
│   └── liveStream/
│       └── LiveStreamViewer.tsx    # Main viewer component
└── pages/
    └── Dashboard.tsx               # "Watch" button integration
```

### How It Works:

1. **Join Stream**:
   - Uses Agora Web SDK
   - Joins channel as viewer (read-only)
   - No publishing, only subscribing

2. **Display Video**:
   - Subscribes to remote user's video/audio tracks
   - Plays video in modal container
   - Auto-handles user leave/unpublish events

3. **Admin Actions**:
   - End stream: Calls `/admin/live-streams/:id/end`
   - Leaves Agora channel
   - Updates UI

---

## Testing

### Local Testing:

1. **Set Agora App ID**:
   ```bash
   # .env.local
   VITE_AGORA_APP_ID=your_app_id
   ```

2. **Start an astrologer stream** (from mobile app):
   - Log in as astrologer
   - Start live stream

3. **Watch from admin dashboard**:
   - Dashboard will show "Currently Live"
   - Click "Watch"
   - Video should load within 2-3 seconds

### Production (Vercel):

1. Add environment variable in Vercel:
   - Dashboard → Settings → Environment Variables
   - Add: `VITE_AGORA_APP_ID` = `your_app_id`
   - Redeploy

---

## Troubleshooting

### "Agora App ID not configured"
**Fix**: Add `VITE_AGORA_APP_ID` to `.env.local`

### "Failed to join live stream"
**Possible causes**:
1. Wrong App ID
2. Stream already ended
3. Network issues
4. Agora token expired (if using token authentication)

**Fix**: Check console logs for specific error

### No video showing (black screen)
**Possible causes**:
1. Astrologer hasn't published video yet
2. Network connection issues
3. Browser doesn't have media permissions

**Fix**: 
- Refresh page
- Check browser console
- Verify astrologer's stream is actually live

### Audio not playing
**Possible causes**:
1. Browser autoplay policy
2. Stream is muted
3. No audio track published

**Fix**:
- Click anywhere on page first (browser autoplay requirement)
- Check mute button status
- Verify astrologer has microphone enabled

---

## Security Notes

### Token Authentication (Production)

For production, **DO NOT** set Agora App ID to allow token-less joining:

1. Enable **App Certificate** in Agora Console
2. Implement token generation on backend
3. Update frontend to fetch token before joining:

```typescript
// In LiveStreamViewer.tsx
const response = await apiClient.get(`/admin/live-streams/${stream._id}/token`);
const { token } = response.data.data;

await client.join(APP_ID, stream.agoraChannelName, token, null);
```

---

## Performance Tips

1. **Limit concurrent viewers**: Each admin viewing consumes bandwidth
2. **Use lower resolution**: For monitoring, 720p is sufficient
3. **Close viewer when not watching**: Frees up resources

---

## Future Enhancements

Possible additions:
- [ ] Record stream capability
- [ ] Screenshot/snapshot
- [ ] Chat moderation overlay
- [ ] Multiple stream grid view
- [ ] Viewer list with kick/ban controls
- [ ] Stream quality selector
- [ ] Picture-in-picture mode

---

## Support

For issues:
1. Check browser console for errors
2. Verify Agora App ID is correct
3. Test stream from Agora Console
4. Check `FULL_STACK_WORKFLOW.md` for debugging tips







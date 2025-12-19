# 🧪 Call Disconnect Testing Instructions

## ✅ Changes Deployed

The admin dashboard has been updated and deployed to Vercel. The following fixes are now live:

### What Was Fixed
1. **Admin → Astrologer disconnect** - Admin ending call now properly notifies astrologer
2. **Astrologer → Admin disconnect** - Astrologer ending call now properly clears admin UI
3. **Call duration tracking** - Accurate duration recording for both parties

---

## 📋 Testing Checklist

### Test 1: Admin Ends Call

**Steps:**
1. Open admin dashboard: `https://admin-dashboard-jaison.vercel.app`
2. Navigate to Communication page
3. Select an online astrologer
4. Click "Video Call" or "Voice Call"
5. On astrologer's phone: Accept the call
6. Wait 10-15 seconds (to test duration tracking)
7. **On admin dashboard: Click "End Call" button**

**Expected Results:**
- ✅ Admin's call UI closes immediately
- ✅ Astrologer's call screen closes immediately
- ✅ Backend logs show: `📴 [CALL] Call ended (duration: ~10-15s)`
- ✅ No stuck modals or frozen UI

**Console Logs to Check (Admin Dashboard):**
```
📴 [COMMUNICATION] Ending call <callId> with <astrologerId> (duration: 15s)
📞 [SOCKET] Ending call: <callId> (contactId: <astrologerId>, duration: 15s)
```

---

### Test 2: Astrologer Ends Call

**Steps:**
1. Open admin dashboard: `https://admin-dashboard-jaison.vercel.app`
2. Navigate to Communication page
3. Select an online astrologer
4. Click "Video Call" or "Voice Call"
5. On astrologer's phone: Accept the call
6. Wait 10-15 seconds
7. **On astrologer's phone: Click "End Call" button**

**Expected Results:**
- ✅ Astrologer's call screen closes immediately
- ✅ Admin's call UI closes immediately
- ✅ Backend logs show: `📴 [CALL] Call ended by astrologer`
- ✅ No stuck modals or frozen UI

**Console Logs to Check (Admin Dashboard):**
```
📴 [COMMUNICATION] Call ended remotely: <callId>
📴 [COMMUNICATION] Clearing active call UI
```

---

### Test 3: Call Rejection

**Steps:**
1. Open admin dashboard
2. Navigate to Communication page
3. Select an online astrologer
4. Click "Video Call" or "Voice Call"
5. **On astrologer's phone: Click "Decline" or "Reject"**

**Expected Results:**
- ✅ Admin sees "Call Rejected" message
- ✅ Admin's call UI closes after 2 seconds
- ✅ Astrologer's incoming call screen closes

---

### Test 4: Multiple Calls in Sequence

**Steps:**
1. Complete Test 1 (Admin ends call)
2. Immediately initiate another call to the same astrologer
3. Accept and end from astrologer side
4. Initiate a third call
5. Accept and end from admin side

**Expected Results:**
- ✅ Each call works independently
- ✅ No lingering state from previous calls
- ✅ Call durations reset properly
- ✅ UI is responsive for each new call

---

## 🔍 What to Look For

### ✅ Success Indicators
- Call UI disappears **immediately** (< 1 second) when either party ends
- No "ghost calls" where one side thinks call is still active
- Call duration is accurate (±1 second)
- Can make another call right after ending
- No console errors

### ❌ Failure Indicators
- Call UI stays open after other party ends (> 3 seconds)
- "Connecting..." message persists
- Console shows errors like "Socket not connected"
- Can't make a new call after ending
- Duration shows 0 or incorrect value

---

## 🐛 If Issues Occur

### Issue: Admin ends call but astrologer still sees active call

**Check:**
1. Open browser console (F12) on admin dashboard
2. Look for: `📴 [COMMUNICATION] Ending call ... (contactId: ...)`
3. If `contactId` is missing or `undefined`, there's a bug

**Fix:** Clear browser cache and hard reload (Ctrl+Shift+R)

---

### Issue: Astrologer ends call but admin UI doesn't clear

**Check:**
1. Open browser console (F12) on admin dashboard
2. Look for: `📴 [COMMUNICATION] Call ended remotely: ...`
3. If this log is missing, Socket.IO connection may be broken

**Fix:** 
1. Check Railway backend logs for `[CALL] Call ended` events
2. Verify admin dashboard is connected to Socket.IO (look for `✅ [SOCKET] Connected`)

---

### Issue: Call duration is always 0 or incorrect

**Check:**
1. Look for: `📴 [VIDEO_CALL] Ending call, duration: Xs`
2. Verify `startedAt` timestamp in `activeCall` state

**Fix:** This should be fixed in the latest deployment. If still broken, report it.

---

## 📊 Backend Logs to Monitor

Open Railway logs and filter for:

```
[CALL] Call ended (duration: Xs)
[CALL] Reject notification sent to caller
[FCM] Sent to astrologer
```

**Healthy logs look like:**
```
📴 [CALL] Call 67abc123... ended (duration: 15s)
✅ [CALL] Call 67abc123... ended successfully
✅ [FCM] Sent to astrologer jaison: 1 success, 0 failed
```

---

## 🎯 Testing Priority

1. **HIGH PRIORITY:** Test 1 & 2 (bidirectional disconnect)
2. **MEDIUM PRIORITY:** Test 3 (rejection)
3. **LOW PRIORITY:** Test 4 (multiple calls)

---

## ✅ Sign-Off Checklist

After testing, confirm:

- [ ] Admin can end calls and astrologer disconnects
- [ ] Astrologer can end calls and admin disconnects
- [ ] Call durations are recorded accurately
- [ ] No console errors during calls
- [ ] Backend logs show proper event flow
- [ ] Can make multiple calls without issues

---

## 📞 Ready to Test!

1. **Open admin dashboard** (deployed to Vercel automatically)
2. **Open astrologer app** on your phone
3. **Follow Test 1 and Test 2** above
4. **Report results** 🚀

---

**Deployment Status:** ✅ **LIVE**  
**Last Updated:** December 19, 2025  
**Commit:** `f8ee3b8`


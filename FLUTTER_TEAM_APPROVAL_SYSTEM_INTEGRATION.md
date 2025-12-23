# Approval Requests System - Flutter App Integration Guide

## Overview
We've implemented a complete **Approval Requests System** in the backend that enables:
1. **Verification Badge Requests** - Astrologers can request a blue verified badge (like Facebook/Instagram)
2. **Service Approval Workflow** - Services require admin approval before going live

## Backend APIs Available

### 1. Verification Badge Request APIs

#### Request Verification Badge
```
POST /api/profile/verification/request
Headers: Authorization: Bearer <token>
Body: (empty)
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "astrologerId": "...",
    "requestType": "verification_badge",
    "status": "pending",
    "submittedAt": "2025-01-XX..."
  },
  "message": "Verification request submitted successfully"
}
```

**Response (Requirements Not Met):**
```json
{
  "success": false,
  "message": "Verification requirements not met",
  "requirements": {
    "experience": false,
    "rating": false,
    "consultations": false,
    "profileComplete": false,
    "missing": [
      "At least 6 months on platform",
      "Average rating of 4.5 or higher",
      "At least 50 completed consultations",
      "Complete profile (bio, awards, certificates)"
    ]
  },
  "current": {
    "monthsOnPlatform": 3.2,
    "avgRating": 4.2,
    "consultationsCount": 30,
    "profileComplete": true
  }
}
```

#### Check Verification Status
```
GET /api/profile/verification/status
Headers: Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isVerified": false,
    "verificationStatus": "pending", // 'none', 'pending', 'approved', 'rejected'
    "verificationSubmittedAt": "2025-01-XX...",
    "verificationApprovedAt": null,
    "verificationRejectionReason": null,
    "latestRequest": {
      "status": "pending",
      "submittedAt": "2025-01-XX...",
      "reviewedAt": null,
      "rejectionReason": null,
      "notes": null
    }
  }
}
```

### 2. Service Approval (Automatic)
When astrologers create a new service via `POST /api/services`, the backend now:
- Sets `isActive = false` by default
- Creates an approval request automatically
- Returns message: "Service created successfully and submitted for admin approval"

**No additional Flutter changes needed** - the existing service creation flow will work, but services will be inactive until admin approves.

## What Flutter Team Needs to Implement

### 1. Verification Badge Request UI

#### Location: Profile Settings Screen
Add a new section or button for verification badge request.

#### UI Requirements:
1. **Check Current Status First**
   - Call `GET /api/profile/verification/status` when profile screen loads
   - Display current verification status

2. **Show Verification Badge Status**
   ```dart
   // Status indicators:
   - "none" → Show "Request Verification" button
   - "pending" → Show "Verification Pending" badge with info
   - "approved" → Show blue verified badge (already implemented)
   - "rejected" → Show "Verification Rejected" with reason
   ```

3. **Request Verification Button**
   - Only show if `verificationStatus == 'none'`
   - On tap: Call `POST /api/profile/verification/request`
   - Handle success: Show success message, update status to "pending"
   - Handle requirements not met: Show requirements dialog with missing items

4. **Requirements Dialog (if request fails)**
   - Display which requirements are missing
   - Show current values vs required values
   - Example:
     ```
     ❌ At least 6 months on platform (You have: 3.2 months)
     ❌ Average rating of 4.5 or higher (You have: 4.2)
     ❌ At least 50 completed consultations (You have: 30)
     ✅ Complete profile
     ```

5. **Pending Status Display**
   - Show "Verification Request Pending" message
   - Display submission date
   - Optionally: "Cancel Request" button (if backend supports it)

6. **Rejected Status Display**
   - Show rejection reason from `verificationRejectionReason`
   - Show "Request Again" button (if allowed)

#### Example UI Flow:
```
Profile Settings Screen
├── Verification Section
    ├── [If not verified]
    │   ├── "Request Verification Badge" button
    │   └── Info: "Get verified to build trust with customers"
    │
    ├── [If pending]
    │   ├── "⏳ Verification Pending" badge
    │   └── "Submitted on: Jan 15, 2025"
    │
    ├── [If rejected]
    │   ├── "❌ Verification Rejected" badge
    │   ├── Rejection reason
    │   └── "Request Again" button
    │
    └── [If approved]
        └── Blue verified badge (already implemented)
```

### 2. Update Service Creation Flow

#### Current Behavior:
- Services are created and immediately active

#### New Behavior:
- Services are created but **inactive** until admin approves
- Show appropriate message to astrologer

#### UI Changes Needed:
1. **After Service Creation**
   - Show success message: "Service created! It will be reviewed by admin before going live."
   - Display service status as "Pending Approval" instead of "Active"
   - In service list, show "Pending Approval" badge for inactive services

2. **Service Status Indicators**
   ```dart
   // Service status display:
   - isActive = true → "Active" (green badge)
   - isActive = false → "Pending Approval" (orange badge)
   ```

3. **Service List Screen**
   - Filter by status: "All", "Active", "Pending Approval"
   - Show status badge on each service card

### 3. Update AstrologerModel (Already Done)
The `AstrologerModel` already has these fields:
- `isVerified` (bool)
- `verificationStatus` (String: 'none', 'pending', 'approved', 'rejected')
- `verificationSubmittedAt` (DateTime?)
- `verificationApprovedAt` (DateTime?)
- `verificationRejectionReason` (String?)

**No changes needed** - just use these fields in UI.

### 4. API Integration Code Examples

#### Request Verification Badge
```dart
Future<void> requestVerification() async {
  try {
    final response = await http.post(
      Uri.parse('$baseUrl/api/profile/verification/request'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 201) {
      // Success - show success message
      showSuccessSnackBar('Verification request submitted successfully');
      // Refresh profile to get updated status
      await refreshProfile();
    } else if (response.statusCode == 400) {
      // Requirements not met
      final data = json.decode(response.body);
      showRequirementsDialog(data['requirements'], data['current']);
    } else {
      // Error
      showErrorSnackBar('Failed to submit verification request');
    }
  } catch (e) {
    showErrorSnackBar('Network error: $e');
  }
}
```

#### Check Verification Status
```dart
Future<VerificationStatus> getVerificationStatus() async {
  try {
    final response = await http.get(
      Uri.parse('$baseUrl/api/profile/verification/status'),
      headers: {
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body)['data'];
      return VerificationStatus.fromJson(data);
    }
  } catch (e) {
    print('Error fetching verification status: $e');
  }
  return VerificationStatus.none();
}
```

#### Service Creation (Already Works)
```dart
// Existing service creation code will work
// Just update UI to show "Pending Approval" status
// when service.isActive == false
```

## UI/UX Recommendations

### Verification Badge Request Screen
1. **Requirements Checklist** (before allowing request)
   - Show all requirements with checkmarks
   - Gray out "Request" button if requirements not met
   - Show progress: "3 of 4 requirements met"

2. **Success State**
   - Show confirmation dialog
   - Update profile immediately to show "Pending" status
   - Optionally: Show estimated review time (e.g., "Usually reviewed within 24-48 hours")

3. **Pending State**
   - Show loading indicator or pending badge
   - Display submission date
   - Optionally: Poll status every few minutes or use push notifications

4. **Rejected State**
   - Clearly show rejection reason
   - Provide actionable feedback
   - Allow re-request if eligible

### Service Approval Status
1. **Service Card Badge**
   - Use color coding:
     - Green: Active
     - Orange: Pending Approval
     - Gray: Inactive/Rejected

2. **Service Detail Screen**
   - Show approval status prominently
   - If pending: "This service is awaiting admin approval"
   - If rejected: Show rejection reason (if available)

## Testing Checklist

- [ ] Request verification badge when all requirements met
- [ ] Request verification badge when requirements not met (show dialog)
- [ ] Check verification status after request
- [ ] Display pending status correctly
- [ ] Display approved status with blue badge
- [ ] Display rejected status with reason
- [ ] Create new service and verify it shows "Pending Approval"
- [ ] Service list shows correct status badges
- [ ] Filter services by status (Active/Pending)

## Important Notes

1. **Verification Requirements** (enforced by backend):
   - At least 6 months on platform
   - Average rating >= 4.5
   - At least 50 completed consultations
   - Complete profile (bio, awards, certificates filled)

2. **Service Approval**:
   - All new services are inactive by default
   - Admin must approve before service goes live
   - Astrologer must be approved (`isApproved = true`) to create services

3. **Status Updates**:
   - Verification status updates when admin approves/rejects
   - Service status updates when admin approves
   - Consider polling or push notifications for real-time updates

## Questions?

If you need clarification on:
- API endpoints → Check backend routes
- Data models → Check `AstrologerModel` and backend models
- UI/UX → Follow existing design patterns in the app
- Integration → Use existing API client patterns

## Backend Commit
- Commit: `0a6caff`
- Branch: `main`
- Files: `ApprovalRequest.js`, `adminApprovals.js`, updated `Astrologer.js`, `profile.js`, `services.js`

---

**Ready to integrate!** The backend is deployed and ready. Just implement the Flutter UI and API calls as described above.


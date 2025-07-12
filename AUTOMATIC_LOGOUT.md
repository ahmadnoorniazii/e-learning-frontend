# Automatic Logout on 401 Unauthorized

This document describes the automatic logout functionality implemented to handle token expiration and user deletion scenarios.

## Overview

When any API call receives a 401 Unauthorized response (indicating expired token or deleted user), the system automatically:

1. **Clears authentication data** from localStorage
2. **Triggers a logout event** for React components
3. **Redirects to login page** with appropriate messaging
4. **Updates authentication state** across the application

## Implementation Details

### 1. API Client (`lib/api-client.ts`)

The `ApiClient.makeRequest()` method has been enhanced to detect 401 errors:

```typescript
if (errorData.error.status === 401) {
  console.warn('🚪 API: 401 Unauthorized detected, triggering automatic logout');
  this.handleUnauthorized();
}
```

The `handleUnauthorized()` method:
- Clears `auth-token` and `auth-user` from localStorage
- Dispatches a custom `auth-logout` event
- Redirects to `/auth/login?reason=session-expired` (if not already on auth pages)

### 2. Auth Service (`lib/auth.ts`)

The `AuthService` listens for the `auth-logout` event and updates its internal state:

```typescript
constructor() {
  if (typeof window !== 'undefined') {
    window.addEventListener('auth-logout', this.handleAutoLogout.bind(this) as EventListener);
  }
}

private handleAutoLogout(event: Event): void {
  const customEvent = event as CustomEvent;
  console.log('🚪 AuthService: Auto logout triggered:', customEvent.detail?.reason);
  this.currentUser = null;
}
```

### 3. Auth Hook (`hooks/use-auth.tsx`)

The `AuthProvider` also listens for the `auth-logout` event to update React state:

```typescript
useEffect(() => {
  // ... existing code ...

  // Listen for automatic logout events
  const handleAutoLogout = (event: Event) => {
    const customEvent = event as CustomEvent;
    console.log('🚪 AuthProvider: Auto logout detected:', customEvent.detail?.reason);
    setUser(null);
  };

  window.addEventListener('auth-logout', handleAutoLogout);

  return () => {
    window.removeEventListener('auth-logout', handleAutoLogout);
  };
}, []);
```

### 4. Login Page (`app/auth/login/page.tsx`)

The login page detects session expiration via URL parameters and displays appropriate messages:

```typescript
useEffect(() => {
  const reason = searchParams.get('reason');
  if (reason === 'session-expired') {
    setSessionMessage('Your session has expired. Please log in again.');
  } else if (reason === 'unauthorized') {
    setSessionMessage('Access denied. Please log in to continue.');
  }
}, [searchParams]);
```

## Scenarios Handled

### 1. Token Expiration
- **When**: JWT token expires on the server
- **Response**: `{ "error": { "status": 401, "message": "Invalid credentials" } }`
- **Action**: Automatic logout and redirect to login with "session expired" message

### 2. User Deletion
- **When**: User account is deleted from the database while still logged in
- **Response**: `{ "error": { "status": 401, "message": "Invalid credentials" } }`
- **Action**: Same as token expiration

### 3. Token Corruption
- **When**: Token is corrupted or manipulated
- **Response**: `{ "error": { "status": 401, "message": "Invalid credentials" } }`
- **Action**: Same as token expiration

## Testing

A test function has been added to `/app/test-api/page.tsx`:

- **Button**: "Test 401 Auto-Logout" (red/destructive variant)
- **Action**: Makes API call with invalid token to simulate 401 response
- **Expected**: Demonstrates 401 detection (in real scenarios, would trigger auto-logout)

## Benefits

1. **Enhanced Security**: Prevents users from continuing with invalid sessions
2. **Better UX**: Clear messaging about why logout occurred
3. **Automatic Cleanup**: Ensures no stale authentication data remains
4. **Consistent State**: All components stay synchronized with auth state
5. **Error Prevention**: Prevents cascade of 401 errors throughout the app

## Usage

No manual intervention required - the system automatically handles 401 responses from any API endpoint. Users will be seamlessly redirected to login with appropriate messaging.

## Events

### Custom Event: `auth-logout`

**Dispatched when**: 401 Unauthorized detected  
**Detail object**: `{ reason: 'unauthorized' }`  
**Listeners**: AuthService, AuthProvider (React hook)

This event ensures all parts of the application are notified of the logout and can update their state accordingly.

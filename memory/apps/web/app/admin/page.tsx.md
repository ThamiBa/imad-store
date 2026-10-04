---
name: apps/web/app/admin/page.tsx
description: Fixed admin login page to properly authenticate with backend
metadata:
  type: project
---

The admin login page at /apps/web/app/admin/page.tsx has been completely rewritten to fix multiple issues:

1. Fixed template literal syntax errors (missing backticks in className attributes)
2. Corrected JSX bracket mismatches (unclosed divs and components)
3. Implemented proper conditional rendering (login form when no token, dashboard when token exists)
4. Ensured login form submits credentials to http://localhost:4000/api/auth/login via the adminLogin API function
5. On successful login, stores the returned accessToken in localStorage (as 'adminToken') and refreshToken (as 'adminRefresh')
6. The API service (src/lib/api.ts) automatically attaches the adminToken from localStorage to outgoing requests via an axios interceptor
7. Dashboard remains protected and only renders when a valid token exists in localStorage
8. Added logout functionality that clears both tokens from localStorage
9. Preserved polling mechanism for real-time notifications and orders updates
10. Used specific credentials: admin@imadmode.com / YourStrongPassword123 (as configured in backend/.env)

**Why:** The previous version had multiple syntax errors that prevented the component from compiling, and even when fixed, the authentication flow was not properly implemented (token not stored, API calls not attached with token).

**How to apply:** This fix ensures that when a user visits http://localhost:3000/admin, they see a login form. Submitting with valid credentials redirects to the dashboard after storing the token. The dashboard remains accessible until logout or token expiration.
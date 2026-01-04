# Authentication & Authorization System

## Overview
This application uses a role-based authentication system with JWT tokens. Users register as regular "user" by default, and admins can promote them to owner roles.

## User Roles

### 1. **user** (Default)
- Regular students/customers
- Can view and book listings
- Cannot create listings
- Default role on signup

### 2. **admin**
- Full system access
- Can view all users
- Can change user roles
- Manually set in database (`is_superuser = true`)

### 3. **hostel** (Hostel/PG Owner)
- Can create hostel/PG listings
- Manages own listings
- Views bookings for their listings

### 4. **coaching** (Coaching Center Owner)
- Can create coaching center listings
- Add faculty members
- Manage courses and programs

### 5. **library** (Library Owner)
- Can create library listings
- Manage resources and facilities

### 6. **tiffin** (Tiffin Service Owner)
- Can create tiffin service listings
- Manage meal plans and menus

## Authentication Flow

### Registration
1. User signs up with email, name, and password
2. Account is created with role = "user" by default
3. JWT token is issued immediately (auto-login)
4. User is redirected to `/dashboard/user`

**API Endpoint:** `POST /accounts/register`
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "is_superuser": false
  }
}
```

### Login
1. User logs in with email and password (OAuth2 form format)
2. JWT token is issued
3. User is redirected based on their role:
   - `admin` → `/dashboard/admin`
   - `hostel/coaching/library/tiffin` → `/dashboard/{role}`
   - `user` → `/dashboard/user`

**API Endpoint:** `POST /accounts/login`
```
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=securepassword
```

**Response:** Same format as registration

### Role Management (Admin Only)

#### List All Users
**API Endpoint:** `GET /accounts/admin/users?skip=0&limit=100`

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "is_superuser": false
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 100
}
```

#### Update User Role
**API Endpoint:** `PATCH /accounts/admin/users/{user_id}/role`

**Request Body:**
```json
{
  "role": "hostel"
}
```

**Response:**
```json
{
  "user_id": 1,
  "role": "hostel",
  "message": "User role updated successfully"
}
```

**Allowed Roles:**
- user
- admin
- hostel
- coaching
- library
- tiffin

## Dashboards

### Admin Dashboard (`/dashboard/admin`)
- View all users with their roles
- Stats: Total Users, Admins, Owners, Regular Users
- Change user roles via modal
- Real-time user management

### Owner Dashboards (`/dashboard/{role}`)
For: hostel, coaching, library, tiffin owners
- View personal listings
- Stats: Total Listings, Active Listings, Bookings
- Create new listings
- Edit/delete own listings
- View bookings

### User Dashboard (`/dashboard/user`)
- View available listings
- Make bookings
- View booking history
- Browse all listings

## Protected Routes
All dashboard routes require authentication. The `ProtectedRoute` component checks:
1. User is logged in (has valid JWT token)
2. Token is stored in localStorage
3. User object is available in AuthContext

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    is_superuser BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Setting Up an Admin

Admins cannot be created through the UI. To create an admin:

### Method 1: Direct Database Update
```sql
UPDATE users 
SET role = 'admin', is_superuser = true 
WHERE email = 'admin@example.com';
```

### Method 2: Using Backend Script
```python
from apps.accounts.services.user import UserManager
from db.sessions import get_session

session = next(get_session())
user_manager = UserManager(session)
user = user_manager.get_user_by_email("admin@example.com")
user.role = "admin"
user.is_superuser = True
session.commit()
```

## Frontend Implementation

### AuthContext
Located at `/frontend/src/context/AuthContext.tsx`

Provides:
- `user`: Current user object or null
- `loading`: Boolean indicating auth state loading
- `setAuth(token, user)`: Update auth state immediately
- `signOut()`: Logout and clear auth state

### Role-Based Navigation
```typescript
const dashboardPath = 
  user.role === 'user' ? '/dashboard/user' :
  user.role === 'admin' ? '/dashboard/admin' :
  `/dashboard/${user.role}`;
```

### API Authorization
All API requests include JWT token in Authorization header:
```typescript
headers: {
  'Authorization': `Bearer ${token}`
}
```

## Security Features

1. **JWT Tokens**: 6-hour expiration
2. **Password Hashing**: bcrypt with salt
3. **Role Validation**: Backend validates role changes
4. **Protected Endpoints**: Admin routes check `is_superuser`
5. **Token Storage**: localStorage with XSS protection considerations
6. **CORS**: Configured for frontend domain

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@host/dbname
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=360
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

## Testing the Auth System

### 1. Register a new user
```bash
curl -X POST http://localhost:8000/accounts/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"password123"}'
```

### 2. Login
```bash
curl -X POST http://localhost:8000/accounts/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=password123"
```

### 3. Set user as admin (in database)
```sql
UPDATE users SET role='admin', is_superuser=true WHERE email='test@example.com';
```

### 4. List users (as admin)
```bash
curl http://localhost:8000/accounts/admin/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Update user role (as admin)
```bash
curl -X PATCH http://localhost:8000/accounts/admin/users/2/role \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"hostel"}'
```

## Migration Applied
Database migration `0b51f3443451_update_user_role_column_size.py` expands the role column from VARCHAR(5) to VARCHAR(20) to support longer role names like "coaching" and "library".

Run migration:
```bash
cd backend
alembic upgrade head
```

## Next Steps
1. Add email verification
2. Implement password reset
3. Add 2FA for admin accounts
4. Rate limiting on auth endpoints
5. Refresh token mechanism
6. Session management
7. Audit logs for role changes

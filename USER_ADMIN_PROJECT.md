# User Administration Page Implementation

## Overview
This document outlines the implementation plan for the User Administration page that allows administrators to perform CRUD operations on users.

## Backend Requirements

### Models
1. **User Model** (if not exists)
   - id: string (UUID)
   - email: string
   - firstName: string
   - lastName: string
   - role: Role

### API Endpoints (to be implemented in backend)
1. `GET /api/users` - List all users (admin only)
2. `GET /api/users/{id}` - Get user details
3. `POST /api/users` - Create new user
4. `PUT /api/users/{id}` - Update user
5. `DELETE /api/users/{id}` - Delete user (or deactivate)


## Frontend Implementation

### Directory Structure
```
frontend/src/app/
├── components/
│   └── pages/
│       └── user-admin/
│           ├── user-admin.component.ts
│           ├── user-admin.component.html
│           ├── user-admin.component.scss
│           ├── user-editor/
│           │   ├── user-editor.component.ts
│           │   ├── user-editor.component.html
│           │   └── user-editor.component.scss
│           └── user-list/
│               ├── user-list.component.ts
│               ├── user-list.component.html
│               └── user-list.component.scss
├── models/
│   └── user.model.ts (if not exists, adjust)
└── services/
    └── user.service.ts (you can start over, this is legacy)
```

### Components

1. **UserAdminComponent**
   - Main container component for user administration
   - Handles routing between list and edit views
   - Implements admin guard

2. **UserListComponent**
   - Displays list of users
   - Search and filter functionality
   - Actions: View, Edit, Delete

3. **UserEditorComponent**
   - Form for creating/editing users
   - Input validation
   - Role selection

### Services
1. **UserService**
   - Handles API communication for user operations
   - Methods: getAll(), getById(), create(), update(), delete()

### Guards
1. **AdminGuard**
   - Protects the user admin routes
   - Verifies user has admin role

### Routes
```typescript
{
  path: 'admin/users',
  component: UserAdminComponent,
  canActivate: [AuthGuard, AdminGuard],
  children: [
    { path: '', component: UserListComponent },
    { path: 'new', component: UserEditorComponent },
    { path: ':id', component: UserEditorComponent }
  ]
}
```

## Implementation Steps

### Frontend
1. Adjust User model
2. Create required components and services
3. Implement user list with sorting and filtering
4. Create user editor form with validation
5. Add error handling and loading states
6. Implement role-based UI elements
6. Add unit tests

## Security Considerations
- All user admin endpoints must require admin role
- Input validation on client
- Proper error handling and user feedback

## Dependencies
- Angular Material (for UI components)
- ngx-toastr (for notifications)
- @ngx-translate (if using i18n)
- bootstrap (for responsive design)

## Future Enhancements
2. User activity logs
3. Advanced search and filtering
4. User impersonation
6. Unit-testing and e2e testing

## Extra Notes
- Create smaller components (than the existing ones) for better maintainability
- use existing folder structure methods

# FixMyZone

> Report. Vote. Resolve.- A community-driven platform for reporting and resolving civic issues.

---

## About

FixMyZone is a full-stack web application that empowers citizens to report local infrastructure problems (potholes, broken streetlights, waste management issues, etc.) and enables democratic prioritization through voting. Administrators can track, manage, and resolve issues efficiently.

### Key Features

- Secure Authentication - JWT-based login/signup with role-based access
- Interactive Maps - Geolocation-based issue reporting with Leaflet
- Image Upload - Multi-image support with Cloudinary CDN
- Voting System - Upvote/downvote to prioritize issues
- Comments - Discussion platform for each issue
- Multi-Language - English, Hindi (हिन्दी), Marathi (मराठी)
- Admin Dashboard - Comprehensive issue and user management
- Responsive Design - Works seamlessly on all devices

---

## Tech Stack

Frontend:
- React 18 + Vite
- Tailwind CSS
- Leaflet (Maps)
- i18next (Internationalization)

Backend:
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary (Image Storage)

Deployment:
- Vercel (Frontend)
- Render (Backend)
- MongoDB Atlas (Database)


## Usage

### For Citizens:
1. Sign up as a user
2. Report an issue with location and photos
3. Vote on issues to prioritize
4. Comment and discuss solutions
5. Track issue status until resolution

### For Administrators:
1. Sign up with email containing "admin"
2. View all reported issues
3. Update status (Open → In Progress → Resolved)
4. Manage users and issue priority
5. Analyze statistics and trends


## API Endpoints

### Authentication
```
POST   /api/auth/signup     - Register new user
POST   /api/auth/login      - Login user
GET    /api/auth/verify     - Verify JWT token
```

### Issues
```
GET    /api/issues          - Get all issues (with filters)
GET    /api/issues/:id      - Get single issue
POST   /api/issues          - Create new issue (auth required)
PUT    /api/issues/:id      - Update issue (admin only)
DELETE /api/issues/:id      - Delete issue (admin only)
POST   /api/issues/:id/upvote   - Toggle upvote
POST   /api/issues/:id/downvote - Toggle downvote
POST   /api/issues/:id/comments - Add comment
```

### Users
```
GET    /api/users           - Get all users (admin only)
GET    /api/users/:id       - Get user profile
PUT    /api/users/:id       - Update user
DELETE /api/users/:id       - Delete user (admin only)
```


## Known Issues

- Render free tier may sleep after 15 min (first request slow)
- Map requires internet connection
- Image upload limited to 5MB per file


## Future Enhancements

- Real-time notifications (WebSockets)
- Email notifications
- Mobile apps (React Native)
- AI-powered issue categorization
- Government integration API
- Advanced analytics dashboard
- Social sharing features
- Multi-city support

## Team

- **[Vishwa Koparkar]** - UI-UX / Frontend Development / Maps Management
- **[Vootla Sruja]** - Backend Development / Admin Panel & i18n
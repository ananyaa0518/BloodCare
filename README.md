# BloodCare

## Overview
BloodCare is a project designed to streamline the management of blood donation and transfusion processes. It aims to ensure that blood is available for those in need while facilitating communication between donors, recipients, and healthcare providers.

## Features
- **User Registration:** Allows users to sign up as donors or recipients.
- **Donation Management:** Manages the scheduling and tracking of blood donations.
- **Transfusion Requests:** Facilitates requests for blood transfusions and manages their status.
- **Alerts and Notifications:** Sends notifications to donors about upcoming donation dates.
- **Statistics Dashboard:** Provides insights into donation trends and needs.

## Tech Stack
- Frontend: React, Vite, React Router
- Backend: Node.js, Express, Socket.io
- Database: PostgreSQL
- Authentication: JWT, bcrypt

## Setup
1. Install dependencies:

```bash
cd backend && npm install
cd ../frontend && npm install
```

2. Create `backend/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/bloodbank
JWT_SECRET=your_jwt_secret
```

3. Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

4. Run backend:

```bash
cd backend
npm start
```

5. Run frontend:

```bash
cd frontend
npm run dev
```

## Contributing
Contributions are welcome. To contribute:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes and test locally.
4. Commit with a clear message.
5. Open a pull request.

## Future Enhancements
- **Live Map Integration:** Implementing Map APIs to show live locations of hospitals and blood banks for donors.
- **Geofencing:** Sending push notifications to donors only when they are within a specific radius of a requesting hospital.
- **Automated Matching:** AI-driven matching based on donor eligibility windows and geographical proximity.
- **Mobile Application:** Developing a dedicated mobile app for faster alerts and GPS tracking.

## License
ISC

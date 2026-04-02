# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

## Features

*   **User Registration & Authentication**: Secure registration and login for different roles (Admin, Blood Bank Staff, Hospital Staff, Donor) using JWT.
*   **Donor Management**: Register as a donor, view donor directory, and standard CRUD operations.
*   **Inventory Dashboard**: Real-time tracking of blood units, categorized by blood type, with automated status highlighting (e.g., expiry dates).
*   **Emergency Blood Requests**: Hospital Staff can raise critical requests. Requests are displayed on a public board based on urgency.
*   **Real-time Notifications (Socket.io)**: Donors receive instant live alerts via a notification bell when a hospital requests their blood type.
*   **Admin Dashboard**: Comprehensive breakdown of statistics (total donors, active requests, total inventory) mapped with user management capabilities.
*   **Modern UI**: Built with React and styled with Tailwind CSS, providing a mobile-responsive and polished design, including loading spinners and toast notifications. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

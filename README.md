# MERN Chat App — Frontend

A modern, responsive real-time chat application frontend built with **React, Vite, Tailwind CSS, Zustand, Axios, and Socket.io**.

The application provides secure authentication, real-time messaging, connection-based privacy, online presence, typing indicators, message status tracking, image sharing, and a responsive chat experience across desktop and mobile devices.

## ✨ Features

### 🔐 Authentication & Privacy

- 🔐 JWT-based authentication
- 🔄 Persistent authentication session
- 🔒 Protected application routes
- 🤝 Connection request system
- 👥 Contact management
- 🚫 Block/unblock users
- 🔐 Connection-based chat access

### 💬 Real-Time Messaging

- 💬 Real-time one-to-one messaging with Socket.io
- 🟢 Online/offline user presence
- ⌨️ Typing indicators
- ✓ Sent, delivered, and read message status
- ✏️ Edit messages
- 🗑️ Delete messages
- 📜 Message pagination
- 🔄 Load older messages
- 🔔 Unread message indicators

### 🖼️ Media

- 🖼️ Image sharing
- 👁️ Image preview/lightbox
- 📦 Client-side image validation

### 🎨 User Experience

- 📱 Responsive desktop and mobile UI
- ⚡ Loading states
- 🔔 Error states
- 📭 Empty states
- 📱 Mobile-friendly chat layout
- 🎯 Clean component-based architecture

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend UI |
| Vite | Development and build tooling |
| Tailwind CSS | Styling |
| Zustand | State management |
| Axios | API communication |
| Socket.io Client | Real-time communication |
| React Router | Client-side routing |
| Lucide React | UI icons |

## 📁 Project Structure

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── lib/
│   ├── pages/
│   ├── store/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .env
├── .env.example
├── .gitignore
├── package.json
└── vite.config.js
```

## ⚙️ Environment Variables

Create a `.env` file in the frontend root:

```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

For production, these values should point to the deployed backend.

> Never commit `.env` files containing private configuration. Production environment variables should be configured through the deployment platform.

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-frontend-repository-url>
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file and add:

```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

### 4. Start the development server

```bash
npm run dev
```

The application will run on:

```text
http://localhost:5173
```

## 🏗️ Production Build

Create an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## 🧪 Code Quality

Run ESLint:

```bash
npm run lint
```

The project is maintained with ESLint to identify common JavaScript and React issues during development.

## 🔗 Backend

The frontend communicates with the Node.js/Express backend through REST APIs and Socket.io.

The backend is responsible for:

- Authentication
- User management
- Connection management
- Message APIs
- MongoDB data management
- JWT authorization
- Real-time Socket.io communication
- Image upload handling
- Chat authorization

## 🔄 Application Flow

```text
React Frontend
      │
      ├── Axios ────────► Express REST API
      │                         │
      │                         ▼
      │                    MongoDB
      │
      └── Socket.io ────► Real-Time Server
                                │
                                ▼
                           Other Users
```

## 🔐 Security

The frontend uses:

- HTTP-only authentication cookies
- Credentialed Axios requests
- Protected API communication
- Authenticated Socket.io connections
- Environment-based API configuration
- Backend-enforced connection authorization

Sensitive environment files are excluded from Git using `.gitignore`.

> Authentication and authorization are enforced by the backend. Frontend restrictions are used primarily to provide the correct user experience.

## 📱 Responsive Design

The interface is designed to work across:

- Desktop
- Laptop
- Tablet
- Mobile devices

The chat layout adapts to smaller screens to provide a usable mobile chat experience.

## 🧪 Testing

The application has been manually tested for:

### Authentication

- Registration
- Login
- Logout
- Session persistence
- Protected routes

### Messaging

- Sending messages
- Receiving messages
- Online/offline presence
- Typing indicators
- Delivered status
- Read status
- Message editing
- Message deletion
- Image sharing
- Message pagination

### Connections & Privacy

- User discovery
- Sending connection requests
- Accepting requests
- Rejecting requests
- Contact management
- Removing contacts
- Blocking users
- Unblocking users
- Unauthorized chat prevention

### Production

- Production API communication
- Production authentication
- Socket.io connection
- CORS configuration
- Production build
- Responsive layout

## 🌐 Deployment

The frontend is deployed using **Vercel**.

The backend is deployed separately using **Render**.

Production API and Socket.io URLs are configured through Vite environment variables.

## 📌 Project Status

The application is feature-complete for the current portfolio scope and includes:

- Secure authentication
- Real-time messaging
- Connection-based privacy
- Message status tracking
- Image sharing
- Pagination
- Responsive UI
- Production deployment
- Security-focused backend integration

## 👨‍💻 Author

**Sharan Poojari**

Full-Stack / MERN Developer

---

Built as a full-stack portfolio project to demonstrate practical React development, REST API integration, authentication, real-time communication, state management, responsive UI development, and production deployment.

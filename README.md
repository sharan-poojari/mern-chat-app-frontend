# MERN Chat App — Frontend

A modern real-time chat application frontend built with **React, Vite, Tailwind CSS, Zustand, Axios, and Socket.io**.

The application provides secure authentication, real-time messaging, online presence, typing indicators, message status tracking, image sharing, and a responsive chat experience across desktop and mobile devices.

## ✨ Features

- 🔐 JWT-based authentication
- 💬 Real-time messaging with Socket.io
- 🟢 Online/offline user presence
- ⌨️ Typing indicators
- ✓ Delivered and read message status
- ✏️ Edit messages
- 🗑️ Delete messages
- 🖼️ Image sharing with image preview/lightbox
- 📜 Message pagination and load older messages
- 🔔 Unread message indicators
- 🔄 Session persistence
- 📱 Responsive mobile and desktop UI
- ⚡ Loading, empty, and error states
- 🔒 Protected API communication
- 🌐 Environment-based API and Socket.io configuration

## 🛠️ Tech Stack

- **React**
- **Vite**
- **Tailwind CSS**
- **Zustand** — state management
- **Axios** — API requests
- **Socket.io Client** — real-time communication
- **React Router** — client-side routing
- **Lucide React** — icons

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

> Never commit `.env` files containing private configuration. Use environment variables provided by your deployment platform for production.

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

Create the `.env` file and add the required variables.

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

## 🔗 Backend

This frontend communicates with the Node.js/Express backend through REST APIs and Socket.io.

Backend responsibilities include:

- Authentication
- User management
- Message APIs
- MongoDB data management
- JWT authorization
- Real-time Socket.io communication
- Image upload handling

## 🔐 Security

The frontend uses:

- HTTP-only authentication cookies
- Protected API requests
- Environment-based API configuration
- Credentialed Axios requests
- Authenticated Socket.io connections

Sensitive environment files are excluded from Git using `.gitignore`.

## 📱 Responsive Design

The interface is designed to work across:

- Desktop
- Laptop
- Tablet
- Mobile devices

The chat layout automatically adapts to smaller screen sizes for a better mobile experience.

## 📌 Project Status

The application is feature-complete for the current development scope and has been tested for:

- Authentication
- Protected routes
- Real-time messaging
- Socket authentication
- Typing indicators
- Online presence
- Message status
- Message editing/deletion
- Image sharing
- Responsive layout
- Production build
- Environment configuration

## 👨‍💻 Author

**Sharan Poojari**

Full-Stack / MERN Developer

---

> Built as a full-stack portfolio project to demonstrate modern React development, REST APIs, authentication, real-time communication, state management, and responsive UI development.

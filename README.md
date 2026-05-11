# PulseBoard — Live Polls for Feedback

PulseBoard is a full‑stack application that allows you to create polls, share them via a public link, collect responses (anonymous or authenticated), and view real‑time analytics. Once a poll expires, the creator can publish the final results so anyone visiting the link can see the outcome.

Built with React, Express, MongoDB, Redis and Socket.io, it provides a complete feedback loop — from creating questions to understanding your audience through live dashboards.

---

## 🚀 Features

- **🔐 Authentication & Access Control**  
  Register, login, email verification, JWT access/refresh tokens, logout with token blacklisting, and protected routes.

- **📋 Poll Creation & Question Management**  
  Create polls with up to 5 questions. Each question can have 2 to 4 options, and you can mark questions as required or optional. Set an expiry duration (5, 10, or 15 minutes).

- **🕶️ Anonymous & Authenticated Response Modes**  
  Choose whether respondents need to be logged in or can vote anonymously (using browser fingerprinting to prevent duplicates).

- **⏳ Automatic Expiry**  
  Polls become inactive after the configured duration. No further responses are accepted.

- **📊 Real‑time Analytics Dashboard**  
  As a poll creator, open the analytics page to see total responses, question‑wise vote counts, and percentages — all updating live via WebSockets.

- **📤 Publish Final Results**  
  After a poll expires, you can publish the results. The same public link then displays the final outcome to anyone.

- **🧩 Clean, Responsive UI**  
  Custom CSS design, form validation with react‑hook‑form, and intuitive navigation.

---

## 🛠️ Tech Stack

### Frontend

- React 19 (with React Router v7)
- Vite for development & building
- Axios for HTTP requests
- Socket.io‑client for real‑time updates
- react‑hook‑form for form state & validation
- FingerprintJS for anonymous user identification

### Backend

- Express 5 REST API
- MongoDB with Mongoose for data storage
- Redis (Valkey) for caching, pub/sub, rate limiting, and session management
- Socket.io for real‑time communication
- JWT for authentication
- Zod for input validation
- Nodemailer + Mailtrap for email verification (development)

### Infrastructure

- Docker for running Redis locally
- Environment variables for configuration

---

## 📁 Project Structure

```
pulseboard/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/        # Login, Signup, VerifyEmail
│   │   │   ├── Dashboard/
│   │   │   ├── layout/      # Sidebar
│   │   │   └── poll/        # CreatePoll, MyPolls, PollAnalytics, PollVote
│   │   ├── App.jsx          # Router setup
│   │   └── main.jsx         # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── server/                  # Express backend
    ├── src/
    │   ├── common/          # Config, middleware, utilities, DTOs
    │   ├── modules/
    │   │   ├── auth/        # User model, routes, service, controller
    │   │   ├── poll/        # Poll logic, analytics aggregation
    │   │   └── response/    # Vote submission & duplicate prevention
    │   └── sockets/         # Socket.io server & auth middleware
    ├── app.js               # Express app setup
    ├── index.js             # Server entry point (DB, Redis, Socket.io)
    ├── docker-compose.yml   # Redis/Valkey container
    ├── package.json
    └── .env.example
```

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js (v18+)
- MongoDB instance (local or Atlas)
- Redis/Valkey (you can use the provided Docker Compose file)
- Mailtrap account (for email verification in development – you can use another SMTP service)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/pulseboard.git
cd pulseboard
```

### 2. Configure Environment Variables

Inside the server folder, copy the example file and fill in the values:

```bash
cd server
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000                       # Backend port
MONGODB_URI=your_mongodb_uri    # e.g., mongodb://localhost:27017/pulseboard

JWT_ACCESS_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_secret_key2
JWT_ACCESS_EXPIRES_IN=15m       # Example: 15 minutes
JWT_REFRESH_EXPIRES_IN=7d

SMTP_PASS=your_mailtrap_password
SMTP_USER=your_mailtrap_user
SMTP_FROM_EMAIL=noreply@pulseboard.com  # or any configured address

FRONTEND_URL=http://localhost:5173     # For CORS (default Vite port)
```

### 3. Start Redis

Using Docker (inside the server folder):

```bash
docker-compose up -d
```

This will start a Redis (Valkey) instance on port 6379.

### 4. Install Dependencies & Start Backend

```bash
cd server
npm install
node index.js
```

The server will start on `http://localhost:3000`.

### 5. Install Dependencies & Start Frontend

In a new terminal:

```bash
cd client
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` (Vite default).

---

## 🧑‍💻 How to Use PulseBoard

### 1️⃣ Register & Login

- Go to `http://localhost:5173/register`
- Fill in a lowercase username (3‑12 chars), email, and a strong password.
- After registration, you will be redirected to the Verify Email page.
- Check your Mailtrap inbox, copy the verification token, and enter it on the verify page.
- Once verified, login at `/login`.

### 2️⃣ Create a Poll

- After logging in, you'll see the Dashboard with your polls (empty at first).
- Click **+ Create Poll** or use the sidebar link.
- Add up to 5 questions. For each question:
  - Enter the question text.
  - Add 2 to 4 options (you can dynamically add/remove them).
  - Toggle whether the question is required.
- Choose a response mode:
  - **Anonymous** – anyone can vote (fingerprint used to prevent duplicates).
  - **Authenticated** – only logged‑in users can vote.
- Select an expiry duration (5, 10, or 15 minutes).
- Click **Create Poll**.

### 3️⃣ Share the Poll

- After creation, your poll appears in **My Polls**.
- Click on the poll card to open its Analytics page.
- Copy the **Share link** (e.g., `http://localhost:5173/poll/<pollId>`).
- Send this link to anyone you want to collect feedback from.

### 4️⃣ Respondents Vote

- When a respondent opens the link, they see the poll form.
- They select one option per question and click **Submit Response**.
- If the poll is Authenticated, they must log in first.
- If they try to vote again, they'll get an error ("You already voted").
- After expiry, the poll closes and no new responses are accepted.

### 5️⃣ Watch Live Analytics (Creator Only)

- As the creator, stay on the Analytics page of your poll.
- You'll see a **Live** badge and a real‑time count of total responses.
- Question‑by‑question breakdowns with option votes and percentages update instantly as respondents vote.

### 6️⃣ Publish Results

- Once the poll expires, the creator can click **Publish Results**.
- Now anyone opening the same shared link will see the final outcome with all votes and percentages, instead of the voting form.

---

## 📡 API Endpoints (Key Routes)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/verify-email` | Verify email with token |
| POST | `/auth/login` | Login and get tokens |
| POST | `/auth/logout` | Logout (blacklist tokens) |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/poll/myPolls` | Get polls created by logged‑in user |
| POST | `/poll/create` | Create a new poll |
| GET | `/poll/:pollId` | Get poll details (public/private) |
| PATCH | `/poll/:pollId/publish` | Publish poll results |
| DELETE | `/poll/:pollId` | Delete a poll (creator only) |
| POST | `/response/:pollId/submit` | Submit a vote |

**Note:** All protected routes require `Authorization: Bearer <accessToken>` header.

---

## 🔒 Security & Validation

- All inputs are validated both on the client (react‑hook‑form) and server (Zod schemas).
- JWT tokens are stored in localStorage for simplicity (in production, consider HttpOnly cookies).
- Access tokens are blacklisted on logout using Redis.
- Refresh tokens are single‑use and rotated on refresh.
- Rate limiting is applied to auth endpoints (5 attempts per 15 minutes).
- Socket.io connections are authenticated using JWT.
- Poll owners can only view live analytics for their own polls.
- Duplicate voting is prevented with atomic Redis locks and MongoDB unique indexes.

---

## 🌐 Real‑Time Architecture

- Socket.io server runs alongside the Express app.
- On a new vote, the backend publishes an event to a Redis pub/sub channel.
- The Socket.io server subscribes to this channel and emits the update only to the creator's dashboard room.
- The frontend receives the `poll-updated` event and refreshes the analytics in place.
- An initial analytics snapshot is sent when the creator joins the dashboard.

---

## 📦 Dependencies

### Server

- express
- mongoose
- ioredis
- socket.io
- jsonwebtoken
- bcryptjs
- zod
- nodemailer
- express-rate-limit
- dotenv
- cors
- crypto

### Client

- react
- react-dom
- react‑router‑dom
- react‑hook‑form
- axios
- socket.io‑client
- @fingerprintjs/fingerprintjs
- vite

---

## 💡 Future Improvements

- Add OAuth (Google) frontend integration.
- Use HttpOnly cookies for token storage.
- Email verification link redirection to frontend.
- Poll result export (CSV/PDF).
- Dark mode support.
- More question types (multiple choice, text).

---

## 📝 License

This project is open‑source. Feel free to use and modify it for your own learning or hackathon projects.

---

**Built with ❤️ by the PulseBoard team**

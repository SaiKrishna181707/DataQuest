# DataQuest

DataQuest is a platform where researchers and organisations publish **data-collection
quests**, and contributors join the quests that match their interests. A quest describes
what data is needed, where to collect it, and why it matters.

The application is a two-part web app:

- `client/` - React single page application (deployed to Vercel)
- `server/` - Express + Mongoose REST API (deployed to Render)

Persistent data lives in **MongoDB Atlas**. Authentication uses **JWT** stored in an
**httpOnly cookie**.

---

## Problem it solves

Field research rarely has enough hands. At the same time, plenty of people would happily
help collect observations if the task were clear, discoverable and easy to join. DataQuest
closes that gap: researchers publish exactly what they need, contributors browse and join,
and every contribution is tracked against the quest it belongs to.

---

## Features

- **Account signup** with username, email, password and password confirmation
- **Login / logout** with JWT authentication and a persistent cookie session
- **Protected routes** - the SPA verifies the session before rendering any app page, so a
  page refresh keeps you signed in and signed-out visitors are redirected to `/login`
- **Browse quests** with search and category filters
- **Create quests** (title, description, category, location, status)
- **Join / leave quests** and see who else has joined
- **My quests** split into current and past quests
- **Profile** showing your details and the quests you belong to
- **Dashboard** with live quest statistics for the signed-in user
- Session-aware error handling: clear messages for wrong credentials, duplicate accounts,
  validation failures and an unreachable API

---

## Tech stack

| Layer     | Technology                                             |
| --------- | ------------------------------------------------------ |
| Frontend  | React 18, React Router 6, Axios, react-toastify        |
| Backend   | Node.js, Express 4, Mongoose, bcryptjs, jsonwebtoken   |
| Database  | MongoDB Atlas                                          |
| Auth      | JWT in an httpOnly cookie (SameSite aware)             |
| Hosting   | Vercel (frontend), Render (backend)                    |

---

## Project structure

```
DataQuest/
├── client/                      React frontend
│   ├── public/                  static assets (index.html, logo.svg, manifest.json)
│   └── src/
│       ├── api.js               shared axios instance (baseURL + credentials)
│       ├── App.js               routes + authenticated Layout / session guard
│       ├── components/          Navbar, Sidebar
│       └── pages/               Main, Login, Signup, Home, MyQuests,
│                                BrowseQuests, QuestDetails, Profile, ...
├── server/                      Express API
│   ├── index.js                 app setup, CORS, MongoDB connection, error handling
│   ├── Controllers/             AuthController, QuestController
│   ├── Middlewares/             AuthMiddleware (verifyToken, verifySession)
│   ├── Models/                  UserModel, QuestModel
│   ├── Routes/                  AuthRoute, QuestRoute
│   └── util/                    SecretToken, cookieOptions, publicUser
├── render.yaml                  Render blueprint for the API
├── vercel.json                  Vercel build config for the frontend
└── package.json                 convenience scripts for both halves
```

---

## Local setup

Requirements: Node.js 18+ and a MongoDB Atlas cluster (or a local MongoDB).

```bash
# 1. install dependencies
npm run install-all          # or: npm run install-server && npm run install-client

# 2. create the environment files
#    server/.env  (copy from server/.env.example)
#    client/.env  (copy from client/.env.example)
```

### server/.env

```dotenv
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/...
MONGODB_DB=dataquest
JWT_SECRET=<long random string>
CORS_ORIGIN=http://localhost:3000
PORT=5000
```

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### client/.env

```dotenv
REACT_APP_SERVER_URL=http://localhost:5000
```

> `server/.env` and `client/.env` are git-ignored. Only the `.env.example` files are
> committed. Never commit real credentials.

### Run the app

```bash
npm run start-server     # http://localhost:5000  (or: cd server && npm run dev)
npm run start-client     # http://localhost:3000
```

The API exposes `GET /health` for a quick connectivity check.

---

## API

All responses use the shape `{ success: boolean, message?: string, data?: ... }`.

| Method | Endpoint                | Auth | Description                                  |
| ------ | ----------------------- | ---- | -------------------------------------------- |
| GET    | `/health`               | no   | Service check                                |
| POST   | `/signup`               | no   | Create an account and set the auth cookie    |
| POST   | `/login`                | no   | Authenticate and set the auth cookie         |
| POST   | `/logout`               | no   | Clear the auth cookie                        |
| POST   | `/verify`               | no   | Returns `{ status, userinfo }` for the SPA   |
| GET    | `/quests`               | yes  | List all quests                              |
| GET    | `/quests/mine`          | yes  | Quests you created or joined                 |
| POST   | `/quests`               | yes  | Create a quest                               |
| GET    | `/quests/:id`           | yes  | Single quest with creator and participants   |
| POST   | `/quests/:id/join`      | yes  | Join a quest                                 |
| POST   | `/quests/:id/leave`     | yes  | Leave a quest                                |

`/verify` always answers `200` with `{ status: false }` when there is no valid session, so
the SPA can check auth state without treating it as an error. Protected `/quests/*` routes
return `401` when the cookie is missing or invalid.

---

## Authentication architecture

1. `POST /signup` or `POST /login` creates a JWT (`{ id }`, 3 day expiry) signed with
   `JWT_SECRET` and sets it as an **httpOnly** cookie.
2. The browser stores the cookie. Axios is configured with `withCredentials: true`, so the
   cookie is sent on every API request.
3. On any protected page, the SPA calls `POST /verify`. The API reads the cookie, verifies
   the JWT and returns the current user, which is what keeps you signed in after a refresh.
4. `POST /logout` clears the cookie server-side, then the SPA returns to `/login`.

Cookie and CORS settings are environment aware (`server/util/cookieOptions.js`):

| Setting   | Local development        | Production                        |
| --------- | ------------------------ | --------------------------------- |
| `secure`  | `false` (plain HTTP)     | `true`                            |
| `sameSite`| `lax` (localhost)        | `none` (Vercel -> Render)         |
| CORS      | `http://localhost:3000`  | your Vercel URL                   |

`CORS_ORIGIN` accepts a comma-separated whitelist if you need more than one origin.
Wildcard CORS is never used, because credentials are enabled.

---

## MongoDB Atlas setup

1. Create a cluster (the free tier is enough) and a database user with read/write access.
2. Add your IP address to the cluster's network access list. For Render, allow access from
   Render (e.g. `0.0.0.0/0`) if you cannot use static outbound IPs.
3. Copy the connection string and use it as `MONGODB_URI`.
4. The API writes to the database named by `MONGODB_DB` (default `dataquest`).

Collections created: `users` and `quests`.

---

## Deploy the backend to Render

1. Push this repository to GitHub.
2. In Render: **New +** -> **Web Service**, connect the repository.
3. Settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
4. Environment variables:

   | Key           | Value                                         |
   | ------------- | --------------------------------------------- |
   | `MONGODB_URI` | your Atlas connection string                  |
   | `MONGODB_DB`  | `dataquest`                                   |
   | `JWT_SECRET`  | a long random secret                          |
   | `CORS_ORIGIN` | your Vercel URL, e.g. `https://app.vercel.app`|
   | `NODE_ENV`    | `production`                                  |

   `PORT` is provided by Render automatically - do not set it.

`render.yaml` contains the same configuration as a blueprint (`sync: false` values must be
filled in from the Render dashboard).

---

## Deploy the frontend to Vercel

1. In Vercel: **Add New** -> **Project**, import this repository.
2. Framework preset: **Create React App** (or "Other"; `vercel.json` already sets the build
   command and output directory).
3. Environment variable:

   | Key                   | Value                                     |
   | --------------------- | ----------------------------------------- |
   | `REACT_APP_SERVER_URL`| your Render API URL (no trailing slash)   |

4. Deploy, then copy the Vercel URL into the backend's `CORS_ORIGIN` and redeploy the API.

`vercel.json` builds `client/` and rewrites all routes to `index.html` so React Router deep
links work.

---

## Security notes

- Passwords are hashed with bcrypt (12 rounds) and the hash is never returned by the API
  (`password` uses `select: false` and every response goes through `toPublicUser`).
- Login errors do not reveal whether the email or the password was wrong.
- The JWT secret is read from `JWT_SECRET`; the server refuses to start without it.
- MongoDB connection strings and secrets are redacted from server logs.
- Unknown errors return a generic `500` without stack traces.
- CORS is a strict whitelist and never `*` while credentials are enabled.

---

## License

ISC.
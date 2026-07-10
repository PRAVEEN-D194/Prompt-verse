# AI Smart Tourism Management System

A production-ready full-stack skeleton application configured for the AI Smart Tourism Management System.

## Technology Stack

- **Frontend**: React.js (Vite configuration) + React Router v6 + Axios configuration.
- **Backend**: Node.js + Express.js + MySQL connection pooling (`mysql2/promise`).
- **Database**: MySQL.

---

## Directory & Folder Structure

The project is split into two cleanly separated folders: `backend` and `frontend`.

```text
ai-smart-tourism-management-system/
├── backend/                        # Node.js + Express.js (MVC)
│   ├── config/                     # Database and environmental configurations
│   │   └── db.js                   # MySQL connection pool setup
│   ├── controllers/                # Request/response logic handlers
│   ├── routes/                     # API route declarations
│   ├── models/                     # Database schema / query logic
│   ├── middleware/                 # Request filtration, authentication, and validation
│   ├── services/                   # External services integrations (e.g. AI engine, email)
│   ├── utils/                      # Helper methods, formatters, and constants
│   ├── uploads/                    # Local storage folder for multi-media files
│   ├── .env.example                # Template for server configuration settings
│   ├── .env                        # Local active configuration settings (git-ignored)
│   ├── package.json                # Dependencies: express, mysql2, cors, dotenv
│   └── server.js                   # Main application server file
│
├── frontend/                       # Vite + React.js SPA
│   ├── src/
│   │   ├── assets/                 # Global styling media, SVGs, and images
│   │   ├── components/             # Reusable UI widgets and atomic components
│   │   ├── layouts/                # Wrapper structures (Tourist view, Owner view, Admin view)
│   │   ├── pages/                  # Portal landing views and specific role dashboards
│   │   ├── hooks/                  # Custom React hooks (state/event listeners)
│   │   ├── services/
│   │   │   └── api.js              # Pre-configured Axios instance with base routers & interceptors
│   │   ├── App.jsx                 # Entrypoint routing orchestrator (React Router DOM)
│   │   ├── index.css               # Global CSS stylesheet (Premium dark-theme variable systems)
│   │   └── main.jsx                # React DOM mount node
│   ├── index.html                  # Standard HTML mount template
│   ├── vite.config.js              # Vite packaging config with local CORS API proxy
│   └── package.json                # Dependencies: react, react-dom, react-router-dom, axios
│
└── README.md                       # Setup and running instructions (this file)
```

---

## Folder Explanations

### Backend MVC

1. **`backend/config/db.js`**: Connects to the database and exports an active `mysql2/promise` connection pool. Handles startup connection checking.
2. **`backend/controllers/`**: House the control code handling client HTTP request parameter processing and returning responses.
3. **`backend/routes/`**: Map URL request lines to their corresponding controller functions.
4. **`backend/models/`**: House the MySQL queries, transactions, and structure maps representing system data models.
5. **`backend/middleware/`**: Check request integrity, validate inputs, verify user permissions (Tourist, Hotel Owner, or Admin), and parse headers.
6. **`backend/services/`**: Abstracts heavy utilities like external API integrations or background processing.
7. **`backend/utils/`**: Shared helper libraries, error structures, logging configurations, and helpers.
8. **`backend/uploads/`**: Serves as the localized repository for uploaded files.

### Frontend App Structure

1. **`frontend/src/assets/`**: Standard storage for global visual assets like background patterns, logos, and illustration images.
2. **`frontend/src/components/`**: Reusable generic React subcomponents (e.g., loading indicators, navigation banners, buttons).
3. **`frontend/src/layouts/`**: Wrappers that structure the layout differently depending on user privileges (e.g., sidebars for admins vs bottom-navs for tourists).
4. **`frontend/src/pages/`**: The concrete screen elements rendered by matching router routes.
5. **`frontend/src/hooks/`**: Custom hooks encapsulating repeatable behaviors (e.g., `useAuth`, `useDevice`).
6. **`frontend/src/services/api.js`**: Built-in HTTP client configuration. Handles proxy endpoints, server response codes (401, 403, 500), and injects JWT authorization.

---

## Local Development Setup

Follow these steps to run the application components in your local development environment.

### Prerequisites
- [Node.js](https://nodejs.org/) installed (v18+ recommended).
- [MySQL Server](https://www.mysql.com/) running locally or remotely.

### 1. Database Setup
1. Create a MySQL database named `ai_smart_tourism_db`:
   ```sql
   CREATE DATABASE ai_smart_tourism_db;
   ```

### 2. Backend Installation & Execution
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Update the `.env` file with your MySQL credentials:
   ```env
   DB_USER=your_username
   DB_PASSWORD=your_password
   ```
4. Start the server in hot-reload development mode:
   ```bash
   npm run dev
   ```
   *The backend starts on port `5000` (e.g. `http://localhost:5000`). It automatically checks database connection health at launch.*

### 3. Frontend Installation & Execution
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
   *Vite starts on `http://localhost:5173`. API request paths prefixed with `/api` are proxy-forwarded to `http://localhost:5000` automatically.*

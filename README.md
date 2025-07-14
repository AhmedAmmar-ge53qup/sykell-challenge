# Web Crawler & Analyzer (Sykell Hiring Challenge)

This is a full-stack web application built for the hiring process at **Sykell**. It allows users to analyze websites by crawling URLs, extracting metadata and link data, and displaying it in a user-friendly dashboard.

---

## 🚀 Features

- Submit URLs for crawling and metadata extraction
- Breakdown of:
  - HTML version
  - Page title
  - Internal & external link counts
  - Broken links with status
  - Presence of login forms
- SQLite-backed persistent storage
- Reanalyze and delete URLs
- Live crawl status indicators
- Responsive frontend with search, filtering, and charts

---

## 🧱 Tech Stack

| Layer     | Technology                  |
|-----------|-----------------------------|
| Frontend  | React, TypeScript, Tailwind |
| Backend   | Go (Gin framework)          |
| Database  | SQLite                      |
| Charts    | Recharts                    |
| Misc      | CORS, Fetch API, Vite       |

---

## 🛠️ Setup Instructions

### ✅ Prerequisites

- Go ≥ 1.18
- Node.js ≥ 18
- Yarn or npm

---

### ⚙️ Backend Setup (Go + Gin + SQLite)

1. **Clone the repo and enter the directory**:

   ```bash
   git clone https://github.com/AhmedAmmar-ge53qup/sykell-challenge.git
   cd sykell-challenge
   cd backend
   ```

2. **Run the backend server**:

   ```bash
   go mod tidy
   go run main.go
   ```

3. **API base URL:** `http://localhost:8080`

#### 📡 API Endpoints

| Method | Endpoint              | Description                     |
|--------|-----------------------|---------------------------------|
| GET    | `/urls`               | List all crawled URLs           |
| GET    | `/urls/:id`           | Get details for a specific URL  |
| POST   | `/urls`               | Submit a URL for crawling       |
| DELETE | `/urls/:id`           | Delete a crawled URL            |
| POST   | `/urls/:id/reanalyze` | Re-crawl a given URL            |
| POST   | `/urls/:id/stop`      | Stop an ongoing crawl           |

---

### 💻 Frontend Setup (React + Vite + Tailwind)

1. **Navigate to the frontend directory**:

   ```bash
   cd frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   # or
   yarn
   ```

3. **Start the development server**:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Frontend URL:** `http://localhost:5173` (or whatever Vite reports)

---

## 📦 Build

To build the frontend for production:

```bash
npm run build
# or
yarn build
```

---

## 🧪 Notes

- The application is designed with simplicity and clarity in mind, tailored to demonstrate real-world skills for the Sykell hiring process.
- Error handling, loading states, and visual clarity were all considered to create a user-friendly experience.
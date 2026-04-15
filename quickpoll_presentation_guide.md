# 🎓 QuickPoll: Professor Presentation & Defense Guide

This guide is designed to help you confidently explain your QuickPoll project to your professor. It breaks down the tools, how they connect, how to sequence your demo, and prepares you for every question your professor might throw at you.

---

## 1. Step-by-Step: How to Explain Your Project

When presenting to a professor, **start high-level, then go into the technical weeds.** 

### Step 1: The "Elevator Pitch" (The Problem & Solution)
*   **What you say:** "Professor, QuickPoll is a real-time classroom polling system. I built this because traditional classrooms often lack instant, engaging feedback mechanisms. My platform allows instructors to launch live polls and students to answer them instantly via WebSockets, all without refreshing their browsers."

### Step 2: The Core Architecture (The Tech Stack)
*   **What you say:** "The system is divided into a robust backend and a modern frontend."
    *   **Frontend:** "I used **Next.js** and **React** for a dynamic, component-based user interface. I also integrated Tailwind CSS for the styling."
    *   **Backend:** "The core is powered by **Node.js** and **Express**. I'm using **Prisma** as my Object-Relational Mapper (ORM) to securely talk to my **SQLite** database. For user authorization, I implemented **JWT (JSON Web Tokens)**."

### Step 3: The Star of the Show: The Tool Integrations
*   **What you say:** "To elevate this from a basic school project to an enterprise-grade application, I integrated a complete DevOps and Testing pipeline."
    *   *(Proceed to explain the tools using the breakdown below in Section 2)*

### Step 4: The Live Demo
1.  **Show the Backend/Frontend startup:** Point out the terminal logs to show the servers spinning up.
2.  **Show the Instructor View:** Log in as an admin/teacher.
3.  **Show the Student View:** Open an incognito window or use a mobile device to join a room code.
4.  **Demonstrate Real-Time:** Launch a poll, vote as a student, and show how the instructor dashboard updates *instantly* (mention Socket.io here).
5.  **Show the Monitoring:** Click the "Monitor System" button and briefly show the Grafana dashboard tracking the live traffic you just generated.
6.  **Show the Tests/Pipeline:** Optionally, run `npm test` in the terminal to show the Selenium automation, or show your Jenkins dashboard.

---

## 2. The Integrated Tools (What they are & How they work)

Your professor specifically asked about the tools. Here is how you explain each one clearly:

### ⚡ 1. Real-Time Communication: Socket.io
*   **What it is:** A library that enables true two-way, real-time communication between a web client and a server.
*   **How it's integrated:** In the backend `src/socket.js`, the server listens for events. When a student votes, the app emits a `vote:cast` message to the server via WebSockets. The server processes this and immediately broadcasts a `results:live` update back to the instructor's dashboard. No HTTP polling or page reloading is required.

### 🛡️ 2. Code Quality Checkers: Git, Husky, and Lint-Staged
*   **What they are:** Tools that enforce coding standards before code is even allowed to exist in the repository.
*   **How they are integrated:** I configured Git hooks using **Husky**. When a developer types `git commit`, Husky intercepts that command. It looks at `.husky/pre-commit` and runs **ESLint** (a linter) and **Prettier** (a formatter) only on the changed files via **lint-staged**. If there are errors (e.g., a missing semicolon or a bad variable), the commit *fails* until it is fixed.

### 📊 3. System Monitoring: Prometheus & Grafana
*   **What they are:** An enterprise observability stack. Prometheus collects data, and Grafana draws the charts.
*   **How they are integrated:** 
    *   **Prometheus:** I installed `prom-client` in the Node.js backend. I wrote custom middleware that measures HTTP request times and queries Prisma for active polls. Prometheus runs in the background and hits `http://localhost:4000/api/metrics` every 5 seconds to scrape this data into its time-series database.
    *   **Grafana:** Grafana runs on port 3000. I connected it to Prometheus as a "Data Source." I then configured a JSON dashboard (`monitoring/dashboard.json`) that queries Prometheus (e.g., querying `quickpoll_active_polls_total`) to render live graphs.

### 🤖 4. Continuous Integration (CI): Jenkins
*   **What it is:** An automation server that ensures code is healthy.
*   **How it's integrated:** I wrote a Declarative Pipeline in a file named `Jenkinsfile`. When a build runs, Jenkins acts like an automated robot developer: it downloads the code, runs `npm install` for both frontend and backend, runs code linting, and compiles the Next.js production bundle. If any of these steps fail, Jenkins flags the build as failed, acting as a safety net.

### 🧪 5. End-to-End (E2E) Testing: Selenium WebDriver + Mocha
*   **What it is:** A framework for automating browser actions to simulate real user behavior.
*   **How it's integrated:** Inside the `tests/` folder, I created automation scripts (like `login.test.js`) using the `selenium-webdriver` and `mocha` testing framework. When I run `npm test`, Selenium launches a headless (invisible) Chrome browser, navigates to the app, finds HTML elements (like the email input or submit button), types in credentials, and uses `assert` statements to verify that the app successfully logged in and redirected to the dashboard.

---

## 3. Basic Commands Cheat Sheet

If the professor says, "Show me how you start the app" or "Run your tests," use these:

| Goal | Command / Action | What it actually does |
| :--- | :--- | :--- |
| **Start Backend** | `cd backend` then `npm run dev` | Starts Node.js with Nodemon on port 4000. Nodemon restarts the server if you save a file. |
| **Start Frontend** | `cd frontend` then `npm run dev` | Starts the Next.js development server. (Uses port 3005 and webpack due to Windows policies). |
| **Run E2E Tests** | `npm test` (in root folder) | Tells Mocha to find all `.js` files in the `tests/` folder and run the Selenium browser scripts. |
| **Lint the Code** | `npm run lint` | Triggers ESLint to scan the code for syntax or style violations. |
| **Database Studio** | `npx prisma studio` (in backend) | Opens a local web UI to view and edit your SQLite database raw data directly. |

---

## 4. Potential Professor Questions & Answers

### 🟢 Easy Level

**Q1: Why did you choose SQLite instead of MongoDB or PostgreSQL?**
> **A:** For a classroom setting and a prototype, SQLite is incredibly fast, zero-configuration, and stores the entire database in a single local file (`dev.db`). This makes development, setup, and teardown much easier, while still giving us the strict schema benefits of a relational SQL database via Prisma.

**Q2: What is the difference between your Frontend and Backend?**
> **A:** The Frontend (Next.js/React) is what the user sees in their browser—the buttons, colors, and layouts. The Backend (Node/Express) is the hidden engine on the server. The front end asks the back end for data (like "is this password correct?"), and the back end securely checks the database and responds.

### 🟡 Medium Level

**Q3: How does your authentication system actually work? Are passwords safe?**
> **A:** When a user registers, I don't save their raw password. I use `bcryptjs` to "hash" the password with salt, so even if the database is compromised, the text is unreadable. When they log in, I compare the hashes. If successful, the server creates a **JWT (JSON Web Token)** that I sign with a secret key. This token is sent to the client, and the client sends it back in the HTTP Authorization Header for any protected routes.

**Q4: Can you explain how Prometheus gets data from your application?**
> **A:** Prometheus uses a "pull" model. I exposed an endpoint in my backend at `/api/metrics`. The `prom-client` library takes system stats (like Memory usage and custom gauges I made, like total active polls) and formats them into plain text that Prometheus understands. Prometheus wakes up every 5 seconds, "scrapes" (downloads) that plain text, and stores it.

### 🔴 Hard Level

**Q5: What happens if two students try to vote on the same question at the exact same millisecond?**
> **A:** Because Node.js is single-threaded and uses an event loop, the requests are processed sequentially. However, to prevent a single user voting twice across parallel requests, I enforce a uniqueness check in my API route (`rooms.js`). Before creating a vote, I run `prisma.response.findFirst` to see if a record already exists for that `userId` and `questionId`. If it does, the API rejects the second request with a 409 Conflict status.

**Q6: Why use Husky and pre-commit hooks? Doesn't Jenkins do the CI checks anyway?**
> **A:** Jenkins *does* check the code as a central source of truth. But Husky enforces a "Shift-Left" philosophy. It's much cheaper and faster to catch a linting error locally *before* the developer commits than to commit, push, wait 3 minutes for Jenkins to run, and fail the centralized build. Husky is my first line of defense; Jenkins is the final gatekeeper.

### 🧠 Tricky / Thinker Questions

**Q7: Your test suite uses Selenium. Why not mock the backend instead of spinning up the whole system?**
> **A:** End-to-End (E2E) testing with Selenium serves a different purpose than unit testing with mocks. By spinning up the real frontend, connecting to the real backend, and writing to a real database, I am proving that the integration between all layers works exactly as a human user would experience it. Mocking is great for speed, but E2E gives me high confidence that the core user flows (like Login and Polling) are unbroken.

**Q8: If I wanted to scale this to 10,000 students across multiple universities, what would break first in your architecture, and how would you fix it?**
> **A:** Three things would break:
> 1.  **SQLite:** It locks the whole database on writes. I would migrate to **PostgreSQL**. (Prisma makes this very easy by just changing the provider).
> 2.  **WebSockets (Socket.io):** A single Node server can only hold a few thousand active WebSocket connections. I would need to deploy multiple backend servers and use a **Redis Adapter** so they can share Socket.io messages across the server cluster.
> 3.  **State Management:** Currently, `roomStudents` is kept in server memory (`Map()`). If a server restarts, the data dies. I would move active room tracking out of memory and into a fast caching layer like Redis.

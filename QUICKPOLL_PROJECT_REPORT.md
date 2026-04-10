# 📊 QuickPoll: Comprehensive Project Report

## 1. Project Overview
**QuickPoll** is a modern, real-time classroom polling system and event RSVP platform. It empowers instructors to gather instant feedback during lectures or events while providing students with a seamless, interactive way to participate. 

Built with scalability and real-time communication in mind, it utilizes **Next.js** for a dynamic, responsive UI, **Node.js/Express** for robust API handling, **Prisma** for database management, and **Socket.io** to enable instant live polling results without requiring page refreshes.

---

## 2. Platform Functionalities

### Core Features
*   **Real-Time Polling Engine**: Instructors can launch polls that instantly appear on connected student devices via WebSockets.
*   **Dynamic Results Dashboard**: As students vote, the results are aggregated and displayed to the instructor as live, updating charts.
*   **QR Code Check-in**: Seamless connection to specific "rooms" or polls using generated QR codes.
*   **Theme Customization**: Full support for system-wide Light and Dark mode user interfaces.
*   **Secure Authentication**: Role-based access control with hashed passwords and secure authentication workflows (including secure "Forgot Password" functionality).

### User Types & Permissions

#### 👨‍🎓 Student
*   **Permissions**: Read and Write (Responses only).
*   **Capabilities**: 
    *   Join an active room via code or QR scan.
    *   View currently active polls broadcasted by the instructor.
    *   Submit answers (Single Choice, Multiple Choice, or Text, depending on configuration).
    *   View their own historical responses.

#### 👨‍🏫 Instructor / Teacher
*   **Permissions**: Read, Write, Update.
*   **Capabilities**:
    *   Dashboard access to create, edit, and launch new polls.
    *   Generate Room Codes / QR codes for students.
    *   Manually Start and Close polls to control the voting window.
    *   Monitor live incoming results via interactive charts.

#### 🛡️ System Administrator
*   **Permissions**: Full System Access.
*   **Capabilities**:
    *   System Administration Dashboard access.
    *   User Management: View all users, promote Students to Teachers, or revoke access.
    *   Audit Logging: Track sensitive actions across the platform.
    *   Data Export: Export all platform polling data to CSV files.
    *   Direct access to **System Monitoring (Grafana)** to check server health.

---

## 3. DevOps & Monitoring Integrations (Theory & Setup)

To make QuickPoll an enterprise-grade application, we integrated a full suite of DevOps tools. 

### 🐙 Git (Version Control & Pre-commit Quality)
*   **What it is**: A distributed version control system to track source code history.
*   **How it is integrated**: We initialized a Git repository and integrated **Husky** and **lint-staged**. 
*   **How it works**: Before any code is allowed to be committed (`git commit`), Husky intercepts the action and runs code linters (`npm run lint`). This ensures no "messy" or broken code ever makes it into the repository. 

### 🔍 Prometheus (Time-Series Metrics Scraping)
*   **What it is**: An open-source systems monitoring and alerting toolkit. It works by "pulling" (scraping) metrics from configured endpoints at regular intervals.
*   **How it is integrated**: We installed `prom-client` in the Node.js backend. We created a custom middleware that tracks how long HTTP requests take, and a custom `Gauge` that safely queries the database for the number of "Active Polls". 
*   **How it works**: Prometheus runs as a background service. Every 15 seconds, it hits `http://localhost:4000/api/metrics` on the backend, grabs the latest data (CPU usage, Memory, Active Polls), and stores it in its time-series database.

### 📈 Grafana (Data Visualization)
*   **What it is**: An open-source observability platform that plugs into databases (like Prometheus) and turns raw numbers into beautiful, actionable charts.
*   **How it is integrated**: We added Prometheus as a "Data Source" in Grafana. We then built a custom dashboard (`monitoring/dashboard.json`) and linked it directly to the QuickPoll Admin UI via the "Monitor System" button.
*   **How it works**: When an Admin opens Grafana, it runs queries (like `quickpoll_active_polls_total`) against Prometheus and draws graphs showing system health, usage spikes, and live traffic.

### 🏗️ Jenkins (Continuous Integration - CI)
*   **What it is**: An automation server used to build, test, and deploy software reliably.
*   **How it is integrated**: We installed the Jenkins Windows LTS and configured a **Declarative Pipeline** via a `Jenkinsfile` stored in the root directory. To bypass aggressive Windows security policies on local checkouts, we utilized robust `robocopy` commands to migrate the code securely into the Jenkins workspace.
*   **How it works**: When a build is triggered, Jenkins acts like a robot developer:
    1. It wipes the old workspace clean.
    2. It copies the latest source code.
    3. It installs Backend and Frontend dependencies (`npm install`).
    4. It proves the code compiles by executing the Next.js production build (`npm run build`).

---

## 4. Master Startup Sequence & Commands

Because of Windows Application Control policies and port allocations, the system must be started in this specific order using the exact commands provided.

### Phase 1: Infrastructure (Data & Visuals)
These services must be running in the background to capture metrics.
1.  **Prometheus**: 
    *   Open `CMD`, navigate to your Prometheus installation folder.
    *   Command: `prometheus.exe --config.file=prometheus.yml`
    *   URL: http://localhost:9090
2.  **Grafana**: 
    *   Runs automatically as a Windows Service. 
    *   *(If stopped: Press Win Key -> type "Services" -> Start "Grafana")*
    *   URL: http://localhost:3000

### Phase 2: The Core Application
1.  **Backend (API + WebSockets)**:
    *   Open a VS Code Terminal in the project root.
    *   Command: `cd backend && npm run dev`
    *   Result: Must state *Server running on port 4000*.
2.  **Frontend (UI)**:
    *   Open a *second* VS Code Terminal in the project root.
    *   *Note: Port 3000 is used by Grafana, and SWC compiler is blocked by Windows. We must use Webpack on Port 3005.*
    *   Command: `cd frontend && npx next dev --port 3005 --webpack`
    *   URL: http://localhost:3005

### Phase 3: CI/CD Automation
1.  **Jenkins**:
    *   Runs automatically as a Windows Service.
    *   *(If stopped: Press Win Key -> type "Services" -> Start "Jenkins")*
    *   URL: http://localhost:8080
    *   Action: Navigate to the `QuickPoll-CI` job and click **Build Now** to verify the pipeline.

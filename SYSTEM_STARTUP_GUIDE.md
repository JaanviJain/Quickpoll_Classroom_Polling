# 🚀 QuickPoll Master Startup Guide

Follow this exact sequence to ensure all systems (Monitoring, Backend, Frontend, and Jenkins) connect perfectly.

---

## 🏗️ Step 1: Infrastructure (Metrics)
Start these first so they are ready to receive data from your app.

### A. Start Prometheus
1.  Open a **Command Prompt** (CMD).
2.  Navigate to your Prometheus folder.
3.  Run: `prometheus.exe --config.file=prometheus.yml`
4.  **Verify**: Open [http://localhost:9090](http://localhost:9090) in your browser.

### B. Start Grafana
1.  Jenkins and Grafana are usually installed as Windows services.
2.  **Verify**: Open [http://localhost:3000](http://localhost:3000) (or whichever port you chose) in your browser.
3.  *Note: If Grafana is not running, go to "Services" in Windows and Start the "Grafana" service.*

---

## ⚙️ Step 2: The Backend (API & Database)
1.  Open a **new terminal** in VS Code.
2.  Navigate to the `backend` folder: `cd backend`
3.  Run: 
    ```bash
    npm run dev
    ```
4.  **Verify**: Look for `Server running on port 4000`.

---

## 🎨 Step 3: The Frontend (Website)
Because of your Windows security policies and the port 3000 conflict, you **must** use this exact command:

1.  Open a **new terminal** in VS Code.
2.  Navigate to the `frontend` folder: `cd frontend`
3.  Run:
    ```bash
    npx next dev --port 3005 --webpack
    ```
4.  **Verify**: Open [http://localhost:3005](http://localhost:3005).

---

## 🤖 Step 4: The Automation (Jenkins)
1.  **Verify**: Open [http://localhost:8080](http://localhost:8080).
2.  If it doesn't open, start the "Jenkins" service in Windows Services.
3.  In Jenkins, click "Build Now" on your **QuickPoll-CI** job to ensure the latest changes (like the Forgot Password page) pass all checks.

---

## 📊 Step 5: Final Check
1.  **Login**: Go to [http://localhost:3005/login](http://localhost:3005/login).
2.  **Admin Check**: Log in as `admin@quickpoll.com` / `AdminPassword123!`.
3.  **Live Metrics**: Click the "Monitor System" button in the Admin Dashboard.
4.  **Grafana Verification**: Ensure "Active Polls" shows `1` (if you have an active poll).

---

## 🧹 Maintenance (If storage is low)
If your laptop runs out of space again, right-click and **"Run as Administrator"** your cleanup tool:
[clean_storage.bat](file:///c:/dev/projects/quick_poll/clean_storage.bat)

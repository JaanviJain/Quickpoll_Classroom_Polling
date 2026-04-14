# 📊 QuickPoll Monitoring Setup Guide (Windows)

This guide will help you install and configure **Prometheus** and **Grafana** to monitor your QuickPoll application live.

---

## 🏗️ Step 1: Install Prometheus (Data Collection)

Prometheus is the "brain" that collects data from your backend every few seconds.

1.  **Download**: [Click here for Prometheus Downloads](https://prometheus.io/download/).
    *   Look for the file ending in `-windows-amd64.zip`.
2.  **Extract**: Extract the ZIP folder somewhere convenient (e.g., `C:\monitoring\prometheus`).
3.  **Configure**: Open the `prometheus.yml` file in that folder and replace its contents with this:

```yaml
global:
  scrape_interval: 5s # Check for data every 5 seconds

scrape_configs:
  - job_name: 'quickpoll-backend'
    static_configs:
      - targets: ['localhost:4000'] # Points to your backend API
    metrics_path: '/api/metrics'
```

4.  **Run**: Double-click `prometheus.exe`. Keep this window open!
    *   *Verification*: Go to `http://localhost:9090` in your browser. Click **Status -> Targets**. You should see `quickpoll-backend` as **UP**.

---

## 🎨 Step 2: Install Grafana (Visualization)

Grafana is the "beautiful face" that turns the data into charts.

1.  **Download**: [Click here for Grafana OSS Download](https://grafana.com/grafana/download?platform=windows).
2.  **Install**: Run the installer and follow the prompts.
3.  **Start Service**: 
    - Search for "Services" in Windows Start menu.
    - Find "Grafana" and ensure it is **Started**.
4.  **Access**: Go to `http://localhost:3000` in your browser.
    *   **Login**: `admin` / `admin`.
5.  **Access Settings**: 
    - Your QuickPoll frontend runs on port **3005** by default.
    - Grafana runs perfectly fine on its default port **3000**.
    - No port changes are required!

---

## 🔗 Step 3: Connect Grafana to Prometheus

1.  In Grafana (`localhost:3000`), go to **Connections -> Data Sources**.
2.  Click **Add data source** and select **Prometheus**.
3.  Set the URL to: `http://localhost:9090`.
4.  Click **Save & Test**.

---

## 📈 Step 4: Import the QuickPoll Dashboard

Instead of creating charts manually, I have built a professional dashboard for you.

1.  In Grafana, click the **Dashboards** icon (four squares) in the left sidebar.
2.  Click **New -> Import**.
3.  Click the **Upload JSON file** button.
4.  Navigate to your project folder and select: `c:\dev\projects\quick_poll\monitoring\dashboard.json`.
5.  In the "Import" screen:
    - Change the **Name** to `QuickPoll Dashboard` (if not already set).
    - Under **Data Source**, select the **Prometheus** data source you created in Step 3.
6.  Click **Import**.

**🎉 You now have live charts for Traffic, Memory, CPU, and Active Polls!**

---

## 🚀 Step 5: Advanced (Optional)

1.  **Monitor System Button**: You can now go to your QuickPoll Admin Dashboard and click the **"Monitor System"** button. It will automatically open your Grafana dashboard!
2.  **Dark Mode**: Grafana is dark by default, which perfectly matches the professional look of QuickPoll.

---

> [!TIP]
> **Dashboard Not Showing Data?**
> - Make sure your backend is running (`npm run dev`).
> - Make sure Prometheus is running (`prometheus.exe`).
> - Check that you can open `http://localhost:4000/api/metrics` in your browser.

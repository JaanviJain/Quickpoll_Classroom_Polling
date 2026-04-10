const prom = require("prom-client");

const { prisma } = require("../db");

// Initialize standard Node.js metrics (CPU, Memory, etc.)
const register = new prom.Registry();
prom.collectDefaultMetrics({ register });

// Custom Histogram to track request duration
const httpRequestDurationMicroseconds = new prom.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "code"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10], // duration buckets in seconds
});

register.registerMetric(httpRequestDurationMicroseconds);

// Custom Gauge for active voting sessions - Synced with DB
const activePollsCounter = new prom.Gauge({
  name: "quickpoll_active_polls_total",
  help: "Total number of active polls currently running",
  async collect() {
    try {
      const count = await prisma.poll.count({ where: { isActive: true } });
      this.set(count);
    } catch (err) {
      console.error("Error collecting active poll metrics:", err);
    }
  },
});
register.registerMetric(activePollsCounter);

const totalUsersGauge = new prom.Gauge({
  name: "quickpoll_total_users",
  help: "Total number of registered users",
  async collect() {
    try {
      const count = await prisma.user.count();
      this.set(count);
    } catch (err) {
      console.error("Error collecting user metrics:", err);
    }
  },
});
register.registerMetric(totalUsersGauge);

const totalPollsGauge = new prom.Gauge({
  name: "quickpoll_total_polls",
  help: "Total number of polls created",
  async collect() {
    try {
      const count = await prisma.poll.count();
      this.set(count);
    } catch (err) {
      console.error("Error collecting total poll metrics:", err);
    }
  },
});
register.registerMetric(totalPollsGauge);

const totalResponsesGauge = new prom.Gauge({
  name: "quickpoll_total_responses",
  help: "Total number of poll responses submitted",
  async collect() {
    try {
      const count = await prisma.response.count();
      this.set(count);
    } catch (err) {
      console.error("Error collecting response metrics:", err);
    }
  },
});
register.registerMetric(totalResponsesGauge);

const metricsMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.baseUrl + (req.route ? req.route.path : req.path);

    // Only track if route is not /metrics itself
    if (route !== "/api/metrics") {
      httpRequestDurationMicroseconds
        .labels(req.method, route, res.statusCode)
        .observe(duration);
    }
  });

  next();
};

module.exports = {
  register,
  metricsMiddleware,
  activePollsCounter,
  totalUsersGauge,
  totalPollsGauge,
  totalResponsesGauge,
};

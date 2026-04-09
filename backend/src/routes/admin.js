const express = require("express");
const bcrypt = require("bcryptjs");
const { prisma } = require("../db");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// Apply admin protection to all routes in this file
router.use(authenticate, authorize("admin"));

// Helper: Log Admin Action
async function logAction(adminId, action, targetType, targetId) {
  try {
    await prisma.auditLog.create({
      data: { adminId, action, targetType, targetId },
    });
  } catch (err) {
    console.error("Audit log error:", err);
  }
}

// GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// POST /api/admin/users (Alternative entry for register)
router.post("/users", async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role },
    });
    await logAction(req.user.id, "CREATE_USER", "User", user.id);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: "Failed to create user. Email may exist." });
  }
});

// PUT /api/admin/users/:id/role (Promote Student -> Teacher)
router.put("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
    });
    await logAction(req.user.id, `UPDATE_ROLE_${role.toUpperCase()}`, "User", user.id);
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: "Failed to update role" });
  }
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "Cannot delete yourself" });
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    await logAction(req.user.id, "DELETE_USER", "User", req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// GET /api/admin/audit-logs
router.get("/audit-logs", async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { admin: { select: { name: true, email: true } } },
      orderBy: { timestamp: "desc" },
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
});

// GET /api/admin/metrics
router.get("/metrics", async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const activePollsCount = await prisma.poll.count({ where: { isActive: true } });
    const totalResponses = await prisma.response.count();
    
    // Response rate over time (last 7 days - simple count)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentResponses = await prisma.response.count({
      where: { submittedAt: { gte: sevenDaysAgo } },
    });

    res.json({
      totalUsers: userCount,
      activePolls: activePollsCount,
      totalResponses: totalResponses,
      recentResponses: recentResponses,
      systemStatus: "Healthy",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch metrics" });
  }
});

// GET /api/admin/export-all (CSV)
router.get("/export-all", async (req, res) => {
  try {
    const polls = await prisma.poll.findMany({
      include: {
        createdBy: { select: { name: true } },
        responses: { select: { answerText: true, selectedOption: true, submittedAt: true, user: { select: { name: true } } } },
      },
    });

    let csv = "Poll Title,Question,Teacher,Student Name,Answer,Timestamp\n";
    polls.forEach((poll) => {
      poll.responses.forEach((resp) => {
        const studentName = resp.user ? resp.user.name : "Anonymous";
        const answer = resp.answerText || (poll.options ? JSON.parse(poll.options)[resp.selectedOption] : "N/A");
        csv += `"${poll.title}","${poll.questionText}","${poll.createdBy.name}","${studentName}","${answer}","${resp.submittedAt.toISOString()}"\n`;
      });
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=all_polls_export.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: "Export failed" });
  }
});

module.exports = router;

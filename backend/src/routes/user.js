const express = require("express");
const { prisma } = require("../db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// GET /api/user/history
// For students to view their own response history (if named mode was enabled)
router.get("/history", authenticate, async (req, res) => {
  try {
    const history = await prisma.response.findMany({
      where: { userId: req.user.id },
      include: {
        poll: {
          select: {
            title: true,
            createdAt: true,
          },
        },
        question: {
          select: {
            text: true,
            type: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

module.exports = router;

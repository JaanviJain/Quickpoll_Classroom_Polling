"use strict";

const express = require("express");
const { prisma } = require("../db");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// Apply teacher protection to all routes in this file
router.use(authenticate, authorize("teacher", "admin"));

// Helper: Generate 6-digit unique room code
async function generateUniqueRoomCode() {
  let code;
  let exists = true;
  while (exists) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    const poll = await prisma.poll.findUnique({ where: { roomCode: code } });
    if (!poll) exists = false;
  }
  return code;
}

// POST /api/polls (Create)
router.post("/", async (req, res) => {
  try {
    const { title, isAnonymous, questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "At least one question is required" });
    }

    const poll = await prisma.poll.create({
      data: {
        title,
        isAnonymous: !!isAnonymous,
        isActive: false,
        createdById: req.user.id,
        questions: {
          create: questions.map((q, idx) => ({
            text: q.text,
            type: q.type,
            options: JSON.stringify(q.options || []),
            order: idx
          }))
        }
      },
      include: {
        questions: true
      }
    });

    res.status(201).json(poll);
  } catch (error) {
    console.error("Poll creation error:", error);
    res.status(400).json({ message: "Failed to create poll" });
  }
});

// GET /api/polls/my-polls
router.get("/my-polls", async (req, res) => {
  try {
    const polls = await prisma.poll.findMany({
      where: { createdById: req.user.id },
      include: {
        _count: {
          select: { questions: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch polls" });
  }
});

// POST /api/polls/:id/start
router.post("/:id/start", async (req, res) => {
  try {
    const pollId = req.params.id;
    const roomCode = await generateUniqueRoomCode();

    const poll = await prisma.poll.update({
      where: { id: pollId, createdById: req.user.id },
      data: {
        isActive: true,
        roomCode,
        startedAt: new Date(),
        endedAt: null,
      },
      include: {
        questions: true
      }
    });
    res.json(poll);
  } catch (error) {
    res.status(400).json({ message: "Failed to start poll" });
  }
});

// POST /api/polls/:id/stop
router.post("/:id/stop", async (req, res) => {
  try {
    const poll = await prisma.poll.update({
      where: { id: req.params.id, createdById: req.user.id },
      data: {
        isActive: false,
        endedAt: new Date(),
      },
    });
    res.json(poll);
  } catch (error) {
    res.status(400).json({ message: "Failed to stop poll" });
  }
});

// PUT /api/polls/:id/room-code (Regenerate)
router.put("/:id/room-code", async (req, res) => {
  try {
    const roomCode = await generateUniqueRoomCode();
    const poll = await prisma.poll.update({
      where: { id: req.params.id, createdById: req.user.id, isActive: true },
      data: { roomCode },
    });
    res.json(poll);
  } catch (error) {
    res.status(400).json({ message: "Failed to regenerate code. Poll must be active." });
  }
});

// GET /api/polls/:id/results
router.get("/:id/results", async (req, res) => {
  try {
    const poll = await prisma.poll.findUnique({
      where: { id: req.params.id },
      include: {
        questions: {
          include: {
            responses: {
              include: { user: { select: { name: true, email: true } } }
            }
          }
        }
      },
    });
    
    if (!poll || (poll.createdById !== req.user.id && req.user.role !== "admin")) {
      return res.status(403).json({ message: "Access denied" });
    }

    const results = poll.questions.map(q => {
      const options = JSON.parse(q.options);
      const summary = options.map((opt, idx) => ({
        option: opt,
        count: q.responses.filter(r => r.selectedOption === idx).length
      }));

      return {
        questionId: q.id,
        text: q.text,
        type: q.type,
        options,
        summary,
        responses: q.responses
      };
    });

    res.json({ poll, results });
  } catch (error) {
    console.error("Fetch results error:", error);
    res.status(500).json({ message: "Failed to fetch results" });
  }
});

// GET /api/polls/:id/attendance
router.get("/:id/attendance", async (req, res) => {
  try {
    const pollId = req.params.id;
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        questions: {
          include: {
            responses: {
              include: { user: { select: { name: true, email: true } } }
            }
          }
        }
      }
    });

    if (poll.isAnonymous) {
      return res.status(400).json({ message: "Attendance not available for anonymous polls" });
    }

    // Flatten all unique users who responded to any question
    const voterMap = new Map();
    poll.questions.forEach(q => {
      q.responses.forEach(r => {
        if (r.userId && !voterMap.has(r.userId)) {
          voterMap.set(r.userId, {
            name: r.user?.name || "Unknown",
            email: r.user?.email || "N/A",
            time: r.submittedAt
          });
        }
      });
    });

    res.json(Array.from(voterMap.values()));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
});

// DELETE /api/polls/:id
router.delete("/:id", async (req, res) => {
  try {
    await prisma.poll.delete({
      where: { id: req.params.id, createdById: req.user.id }
    });
    res.json({ message: "Poll deleted" });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete poll" });
  }
});

// GET /api/polls/:id/export (CSV)
router.get("/:id/export", async (req, res) => {
  try {
    const poll = await prisma.poll.findUnique({
      where: { id: req.params.id, createdById: req.user.id },
      include: {
        questions: {
          include: {
            responses: {
              include: { user: { select: { name: true } } }
            }
          }
        }
      }
    });

    if (!poll) return res.status(404).json({ message: "Poll not found" });

    let csv = "Question,Student Name,Answer,Timestamp\n";
    poll.questions.forEach(q => {
      const options = JSON.parse(q.options);
      q.responses.forEach((resp) => {
        const studentName = resp.user ? resp.user.name : "Anonymous";
        const answer = resp.answerText || options[resp.selectedOption] || "N/A";
        csv += `"${q.text}","${studentName}","${answer}","${resp.submittedAt.toISOString()}"\n`;
      });
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=poll_${poll.id}_export.csv`);
    res.send(csv);
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ message: "Export failed" });
  }
});

module.exports = router;

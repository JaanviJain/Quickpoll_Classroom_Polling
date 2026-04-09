"use strict";

const express = require("express");
const { prisma } = require("../db");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// POST /api/rooms/join
router.post("/join", authenticate, async (req, res) => {
  try {
    const { roomCode } = req.body;
    const poll = await prisma.poll.findUnique({
      where: { roomCode, isActive: true },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!poll) {
      return res.status(404).json({ message: "Active room not found" });
    }

    // Check which questions the student has already answered
    const responses = await prisma.response.findMany({
      where: {
        pollId: poll.id,
        userId: req.user.id,
      },
      select: { questionId: true },
    });

    if (poll.questions.length === 0) {
      return res
        .status(422)
        .json({
          message:
            "This quiz session has no questions. Please contact your instructor.",
        });
    }

    const answeredQuestionIds = responses.map((r) => r.questionId);

    // Progress is the next unanswered question
    const nextQuestion = poll.questions.find(
      (q) => !answeredQuestionIds.includes(q.id),
    );
    // If questions exist, hasVoted is only true if there is NO next question
    const hasVotedAll = poll.questions.length > 0 && !nextQuestion;

    res.json({
      poll,
      hasVoted: hasVotedAll,
      answeredCount: answeredQuestionIds.length,
      totalQuestions: poll.questions.length,
      nextQuestionId: nextQuestion?.id || null,
    });
  } catch (error) {
    console.error("Join room error:", error);
    res.status(500).json({ message: "Join room failed" });
  }
});

// POST /api/rooms/:roomCode/vote
router.post("/:roomCode/vote", authenticate, async (req, res) => {
  try {
    const { roomCode } = req.params;
    const { questionId, answerText, selectedOption } = req.body;

    const poll = await prisma.poll.findUnique({
      where: { roomCode, isActive: true },
      include: { questions: true },
    });

    if (!poll) {
      return res.status(404).json({ message: "Poll no longer active" });
    }

    const question = poll.questions.find((q) => q.id === questionId);
    if (!question) {
      return res
        .status(404)
        .json({ message: "Question not found in this poll" });
    }

    // 1. Check if already answered this specific question
    const existingResponse = await prisma.response.findFirst({
      where: { questionId, userId: req.user.id },
    });

    if (existingResponse) {
      return res
        .status(409)
        .json({ message: "You have already answered this question" });
    }

    // 2. Validate input based on question type
    if (question.type === "multiple_choice" || question.type === "true_false") {
      if (typeof selectedOption === "undefined" || selectedOption === null) {
        return res.status(422).json({ message: "Option selection required" });
      }
    } else if (question.type === "open_ended") {
      if (!answerText || !answerText.trim()) {
        return res.status(422).json({ message: "Answer text required" });
      }
    }

    // 3. Create response
    const response = await prisma.response.create({
      data: {
        pollId: poll.id,
        questionId: question.id,
        userId: poll.isAnonymous ? null : req.user.id,
        answerText: answerText ? answerText.trim() : null,
        selectedOption:
          typeof selectedOption !== "undefined" ? selectedOption : null,
      },
    });

    res.status(201).json({
      message: "Score recorded",
      responseId: response.id,
    });
  } catch (error) {
    console.error("Voting error:", error);
    res.status(500).json({ message: "Failed to cast vote" });
  }
});

// GET /api/rooms/:roomCode/results
router.get("/:roomCode/results", authenticate, async (req, res) => {
  try {
    const { roomCode } = req.params;
    const poll = await prisma.poll.findUnique({
      where: { roomCode },
      include: {
        questions: {
          include: {
            responses: true,
          },
        },
      },
    });

    if (!poll) return res.status(404).json({ message: "Room not found" });

    // For students, check if they finished the poll OR if it's inactive
    if (req.user.role === "student" && poll.isActive) {
      const responsesCount = await prisma.response.count({
        where: { pollId: poll.id, userId: req.user.id },
      });
      if (responsesCount < poll.questions.length) {
        return res
          .status(403)
          .json({
            message: "Results visible only after completing all questions",
          });
      }
    }

    const results = poll.questions.map((q) => {
      const options = JSON.parse(q.options);
      const summary = options.map((opt, idx) => ({
        option: opt,
        count: q.responses.filter((r) => r.selectedOption === idx).length,
      }));

      return {
        questionId: q.id,
        text: q.text,
        type: q.type,
        options,
        summary,
        totalResponses: q.responses.length,
      };
    });

    res.json({
      title: poll.title,
      results,
      totalParticipants: new Set(
        poll.questions.flatMap((q) => q.responses.map((r) => r.userId)),
      ).size,
    });
  } catch (error) {
    console.error("Fetch room results error:", error);
    res.status(500).json({ message: "Failed to fetch results" });
  }
});

module.exports = router;

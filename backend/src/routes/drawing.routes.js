const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
  createDrawing,
  getAllDrawings,
  getDrawingById,
  updateDrawing,
  deleteDrawing,
  shareDrawing,
  leaveDrawing,
} = require("../controllers/drawing.controller");

router.post("/", authMiddleware, createDrawing);

router.get("/", authMiddleware, getAllDrawings);

router.get("/:id", authMiddleware, getDrawingById);

router.put("/:id", authMiddleware, updateDrawing);

router.delete("/:id", authMiddleware, deleteDrawing);

router.post("/:id/share", authMiddleware, shareDrawing);

router.post("/:id/leave", authMiddleware, leaveDrawing);

module.exports = router;
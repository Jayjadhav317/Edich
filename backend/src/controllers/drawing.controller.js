const Drawing = require("../models/drawing.model");
const User = require("../models/user.model");

const createDrawing = async (req, res) => {
  try {
    const { title } = req.body;

    const drawing = new Drawing({
      title: title || "Untitled",
      owner: req.user.id,
      elements: [],
      collaborators: [],
    });

    await drawing.save();

    res.status(201).json({
      message: "Drawing created successfully",
      drawing,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


const getAllDrawings = async (req, res) => {
  try {
    const drawings = await Drawing.find({
      $or: [
        { owner: req.user.id },
        { collaborators: req.user.id }
      ]
    }).populate("owner", "name email");

    res.status(200).json(drawings);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

const getDrawingById = async (req, res) => {
  try {
    const drawing = await Drawing.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user.id },
        { collaborators: req.user.id }
      ]
    }).populate("owner", "name email").populate("collaborators", "name email");

    if (!drawing) {
      return res.status(404).json({
        message: "Drawing not found or Access Denied",
      });
    }

    res.status(200).json(drawing);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


const updateDrawing = async (req, res) => {
  console.log("===== UPDATE DRAWING API HIT =====");
  console.log("Params:", req.params);
  console.log("Body:", req.body);

  try {
    const { title, elements } = req.body;

    const drawing = await Drawing.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { owner: req.user.id },
          { collaborators: req.user.id }
        ]
      },
      {
        title,
        elements,
      },
      {
        returnDocument: "after",
      }
    );

    if (!drawing) {
      return res.status(404).json({
        message: "Drawing not found or Access Denied",
      });
    }

    res.status(200).json({
      message: "Drawing updated successfully",
      drawing,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Delete Drawing
const deleteDrawing = async (req, res) => {
  try {
    const drawing = await Drawing.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!drawing) {
      return res.status(404).json({
        message: "Drawing not found or you are not the owner",
      });
    }

    res.status(200).json({
      message: "Drawing deleted successfully",
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Share Drawing with Collaborator by Email
const shareDrawing = async (req, res) => {
  try {
    const { email } = req.body;
    const drawingId = req.params.id;

    const drawing = await Drawing.findOne({
      _id: drawingId,
      owner: req.user.id,
    });

    if (!drawing) {
      return res.status(404).json({
        message: "Drawing not found or you are not the owner",
      });
    }

    const collaborator = await User.findOne({ email });
    if (!collaborator) {
      return res.status(404).json({
        message: "User with this email not found",
      });
    }

    if (collaborator._id.toString() === req.user.id) {
      return res.status(400).json({
        message: "You cannot add yourself as a collaborator",
      });
    }

    if (drawing.collaborators.includes(collaborator._id)) {
      return res.status(400).json({
        message: "User is already a collaborator",
      });
    }

    drawing.collaborators.push(collaborator._id);
    await drawing.save();

    res.status(200).json({
      message: "Drawing shared successfully",
      drawing,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = {
  createDrawing,
  getAllDrawings,
  getDrawingById,
  updateDrawing,
  deleteDrawing,
  shareDrawing,
};
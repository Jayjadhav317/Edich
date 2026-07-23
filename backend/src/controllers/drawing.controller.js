const Drawing = require("../models/drawing.model");
const User = require("../models/user.model");
const nodemailer = require("nodemailer");
const sendEmail = require("../utils/sendEmail");

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

    // Fetch the sender user profile to get their name
    const sender = await User.findById(req.user.id);
    const senderName = sender ? sender.name : "A user";

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    setTimeout(async () => {
      try {
        const isTest = !(process.env.SMTP_USER && (process.env.SMTP_PASSWORD || process.env.SMTP_PASS));

        const mailData = {
          to: email,
          subject: `Invitation to collaborate on: ${drawing.title}`,
          text: `Hello,\n\nYou have been invited by ${senderName} to collaborate on their whiteboard drawing: "${drawing.title}".\n\nClick the link below to open the drawing:\n${frontendUrl}/canvas/${drawing._id}?invited=true\n\nHappy drawing!`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 500px; border: 1px solid #eee; border-radius: 12px; margin: 0 auto;">
              <h2 style="color: #6965db; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">Excalidraw Collaboration Invite</h2>
              <p>Hello,</p>
              <p><strong>${senderName}</strong> has invited you to collaborate on their whiteboard drawing: <strong>"${drawing.title}"</strong>.</p>
              <p style="margin: 25px 0; text-align: center;">
                <a href="${frontendUrl}/canvas/${drawing._id}?invited=true" style="background-color: #6965db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Open Workspace</a>
              </p>
              <p style="font-size: 11px; color: #888; border-top: 1px solid #f3f4f6; padding-top: 12px; margin-top: 20px;">
                If the button above does not work, copy and paste this link in your browser: <br/> 
                <a href="${frontendUrl}/canvas/${drawing._id}?invited=true" style="color: #6965db;">${frontendUrl}/canvas/${drawing._id}?invited=true</a>
              </p>
            </div>
          `,
        };

        if (isTest) {
          const testAccount = await nodemailer.createTestAccount();
          const testTransporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
              user: testAccount.user,
              pass: testAccount.pass,
            },
          });
          const info = await testTransporter.sendMail({
            from: '"Excalidraw Clone" <no-reply@excalidrawclone.com>',
            ...mailData
          });
          console.log("Ethereal test email preview URL: %s", nodemailer.getTestMessageUrl(info));
        } else {
          await sendEmail("brevo", mailData);
          console.log("Email sent successfully via Brevo SMTP");
        }
      } catch (err) {
        console.error("SMTP Mail Send Error (Background):", err);
      }
    }, 100);

    res.status(200).json({
      message: "Drawing shared successfully and invitation email is sending in the background",
      drawing,
      emailSent: true
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Leave a collaborative drawing
const leaveDrawing = async (req, res) => {
  try {
    const drawingId = req.params.id;
    const drawing = await Drawing.findById(drawingId);

    if (!drawing) {
      return res.status(404).json({
        message: "Drawing not found",
      });
    }

    // Filter current user out of collaborators array
    drawing.collaborators = drawing.collaborators.filter(
      (id) => id.toString() !== req.user.id
    );
    await drawing.save();

    res.status(200).json({
      message: "Successfully left the collaboration space",
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
  leaveDrawing,
};
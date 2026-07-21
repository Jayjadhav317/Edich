const User = require("../models/user.model");

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = new User({
      name,
      email,
      password,

    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = signup;
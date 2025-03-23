import express from "express";
import User from "../../models/User.js";
import generateToken from "../../utils/auth/generateToken.js";
import isEmailValid from "../../utils/validators/emailValidator.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password should be at least 6 characters long." });
    }

    if (username.length < 3) {
      return res
        .status(400)
        .json({ message: "Username should be at least 3 characters long." });
    }

    const existingUsername = await User.findOne({
      username,
    });

    if (existingUsername) {
      return res
        .status(400)
        .json({ message: "This username is already in use." });
    }

    const existingEmail = await User.findOne({
      email,
    });

    if (existingEmail) {
      return res.status(400).json({ message: "This email is already in use." });
    }

    if (!isEmailValid(email)) {
      return res
        .status(400)
        .json({ message: "Please enter email in a valid format." });
    }

    const profileImage = `https://api.dicebear.com/9.x/bottts/svg?seed=${username}`;

    const user = new User({
      username,
      email,
      password,
      profileImage,
    });

    if (!user) {
      console.log("Error in register route, when trying to create a user");
      return res.status(500).json({
        message: "Internal server error.",
      });
    }

    await user.save();

    const token = generateToken(user._id);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.log("Error in register route.", error);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!isEmailValid(email)) {
      return res
        .status(400)
        .json({ message: "Please enter email in a valid format." });
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const passwordMatches = await user.comparePassword(password);

    if (!passwordMatches) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.log("Error in login route.", error);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
});

export default router;

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();
//register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email exists" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const adminExists = await User.exists({ role: "admin"})

    const role = adminExists ? "user" : "admin"

    const user = new User({ name, email, password: hashed, role });
    await user.save();

    res.json({
      msg: `User registered successfully${role === "admin" ? " as Admin" : ""}`,
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error });
  }
});

router.get("/", async (req, res) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});


export default router;
import express from "express";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req;
  res.send("Register route");
});

router.post("/login", async (req, res) => {
  const { email, password } = req;
  res.send("Login route");
});

export default router;

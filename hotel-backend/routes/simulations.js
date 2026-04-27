const router = require("express").Router();
const auth = require("../middleware/auth");
const db = require("../db");

router.post("/save", auth, async (req, res) => {
  // Bypass DB completely
  res.json({ message: "Saved locally (db disabled)" });
});

router.get("/", auth, async (req, res) => {
  // Bypass DB completely
  res.json([]);
});

module.exports = router;

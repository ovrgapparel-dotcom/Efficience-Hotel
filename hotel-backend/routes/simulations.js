const router = require("express").Router();
const auth = require("../middleware/auth");
const db = require("../db");

router.post("/save", auth, async (req, res) => {
  const { type, data } = req.body;

  try {
    await db.query(
      "INSERT INTO simulations(user_id, type, data) VALUES($1,$2,$3)",
      [req.user.id, type, data]
    );

    res.json({ message: "Saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM simulations WHERE user_id=$1 ORDER BY created_at DESC",
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;

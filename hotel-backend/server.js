require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const simulationRoutes = require("./routes/simulations");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/simulations", simulationRoutes);

// Hotel simulation calculation route
app.post("/hotel/simulate", (req, res) => {
  const { chambres, taux, prix } = req.body;
  const CA = chambres * taux * prix * 30; // Estimated monthly Revenue
  const RevPAR = taux * prix;
  res.json({ CA, RevPAR, chambres, taux, prix });
});

// Restaurant simulation calculation route
app.post("/restaurant/simulate", (req, res) => {
  const { couverts, ticket, foodCost } = req.body;
  const CA = couverts * ticket * 30; // Estimated monthly Revenue
  const coutMatiere = CA * foodCost;
  const marge = CA - coutMatiere;
  res.json({ CA, marge, couverts, ticket, foodCost, coutMatiere });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

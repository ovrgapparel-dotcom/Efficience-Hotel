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

// Advanced Hotel P&L route
app.post("/hotel/simulate-advanced", (req, res) => {
  const {
    rooms, occupancy, adr,
    fbCovers, fbCheck, fbCostPerc,
    spaRevenue, eventsRevenue,
    payrollPerc, maintenance, utilities,
    rent, marketing, insurance
  } = req.body;

  // Revenue Math (Monthly approx)
  const roomRev = rooms * occupancy * adr * 30;
  const fbRev = (fbCovers * fbCheck) * 30;
  const totalRev = roomRev + fbRev + spaRevenue + eventsRevenue;

  // Variable Cost Math
  const payroll = totalRev * (payrollPerc / 100);
  const fbCogs = fbRev * (fbCostPerc / 100);
  const totalVarCosts = payroll + fbCogs + maintenance + utilities;

  // Gross Operating Profit
  const gop = totalRev - totalVarCosts;

  // Fixed Cost Math
  const totalFixedCosts = rent + marketing + insurance;

  // Net Operating Income
  const noi = gop - totalFixedCosts;

  res.json({
    revenues: { roomRev, fbRev, spaRevenue, eventsRevenue, totalRev },
    variableCosts: { payroll, fbCogs, maintenance, utilities, totalVarCosts },
    fixedCosts: { rent, marketing, insurance, totalFixedCosts },
    summary: { gop, noi }
  });
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

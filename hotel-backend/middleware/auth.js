const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET_KEY || "SECRET_KEY";

module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.status(403).send("No token");

  try {
    // Remove "Bearer " if present, though our frontend just sends the token
    const actualToken = token.startsWith("Bearer ") ? token.slice(7) : token;
    const decoded = jwt.verify(actualToken, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).send("Invalid token");
  }
};

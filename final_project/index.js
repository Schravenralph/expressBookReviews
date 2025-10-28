const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Session belongs here (once, app-wide)
app.use(session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

// Protect all /customer/auth/* routes using session-based JWT
app.use("/customer/auth/*", function auth(req, res, next) {
  try {
    const authData = req.session && req.session.authorization;
    if (!authData || !authData.accessToken) {
      return res.status(401).json({ message: "Login required" });
    }

    jwt.verify(authData.accessToken, "access", (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid or expired token" });
      req.user = { username: decoded.username };
      next();
    });
  } catch {
    return res.status(500).json({ message: "Auth check failed" });
  }
});

app.use("/customer", customer_routes);
app.use("/", genl_routes);

const PORT = 5000;
app.listen(PORT, () => console.log("Server is running on port", PORT));

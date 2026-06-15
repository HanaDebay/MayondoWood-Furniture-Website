// Backend API server for Mayondo Wood & Furniture
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const passport = require("passport");
const expressSession = require("express-session");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const cors = require("cors");

require("dotenv").config();

const User = require("./models/userModel");
const authRoutes = require("./routes/authRoutes");
const furnitureStockRoutes = require("./routes/FurnitureStockRoutes");
const woodStockRoutes = require("./routes/woodStockRoutes");
const userRoutes = require("./routes/userRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const salesRoutes = require("./routes/salesRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const countRoutes = require("./routes/aggregation/count");
const purchaseCostRoutes = require("./routes/aggregation/purchaseCosts");
const managerDashboardChartRoutes = require("./routes/aggregation/managerDashboardCharts");
const profitRoutes = require("./routes/aggregation/profit");

const app = express();

mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

app.set("trust proxy", 1);

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", authRoutes);
app.use("/api", furnitureStockRoutes);
app.use("/api", woodStockRoutes);
app.use("/api", userRoutes);
app.use("/api", supplierRoutes);
app.use("/api", salesRoutes);
app.use("/api", purchaseRoutes);
app.use("/api", countRoutes);
app.use("/api", purchaseCostRoutes);
app.use("/api", managerDashboardChartRoutes);
app.use("/api", profitRoutes);

app.get("/api/me", (req, res) => {
  if (req.session?.user) {
    return res.json({ user: req.session.user }); // Return the full user object
  }
  res.status(401).json({ error: "Not authenticated" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});

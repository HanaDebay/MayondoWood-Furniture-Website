// Dependencies
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Purchase = require("../models/purchaseModel");
const Sale = require("../models/salesModel");
const User = require("../models/userModel");
const Supplier = require("../models/supplierModel");
const WoodStock = require("../models/woodStockModel");
const FurnitureStock = require("../models/furnitureStockModel");
const {
  ensureAuthenticated,
  ensureManager,
  ensureSalesAgent,
} = require("../middleware/auth");

// Keep this for any existing legacy dashboard components if needed
// Manager Dashboard (Legacy - ensure it returns JSON if still used)
router.get("/manager-dashboard", ensureAuthenticated, ensureManager, async (req, res) => {
  try {
    
    // Total Sales
    const totalSales = await Sale.aggregate([
      { $group: { _id: null, total: { $sum: "$totalCost" } } }
    ]);
    const sales = totalSales[0]?.total || 0;

     // Total Sales (sum of totalCost in Sale collection)
    const totalSalesResult = await Sale.aggregate([
      { $group: { _id: null, totalSales: { $sum: "$totalCost" } } }
    ]);
    const totalSalesProfit = Number(totalSalesResult[0]?.totalSales || 0);

    // Total Purchases (sum of totalPurchaseCost in Purchase collection)
    const totalPurchaseResult = await Purchase.aggregate([
      { $group: { _id: null, totalPurchase: { $sum: "$totalPurchaseCost" } } }
    ]);
    const totalPurchase = Number(totalPurchaseResult[0]?.totalPurchase || 0);

    // Calculate Gross Profit
    const grossProfit = totalSalesProfit - totalPurchase;

    res.json({
      manager: req.session.user,
      revenue: sales - totalPurchase, 
      sales, 
      purchase: totalPurchase,
      totalSalesProfit,
      totalPurchase,
      grossProfit
    });

  } catch (error) {
    console.error("Aggregation Error:", error.message);
    res.status(500).json({ error: "Unable to load Manager Dashboard" });
    res.status(500).json({ error: "Unable to load Manager Dashboard (Legacy)" });
  }
});

router.get("/sales-agent-dashboard", ensureAuthenticated, ensureSalesAgent, async (req, res) => {
    try {
      const agentId = req.session.user?._id;
      if (!agentId) return res.status(401).json({ error: "Unauthorized" });

      // First and last day of this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setMilliseconds(-1);

      const salesThisMonth = await Sale.find({
        salesAgent: req.session.user._id,
        dateOfSale: { $gte: startOfMonth, $lte: endOfMonth },
      });
      // Total sales this month
      const monthlySalesAgg = await Sale.aggregate([
        {
          $match: {
            salesAgent: new mongoose.Types.ObjectId(agentId),
            dateOfSale: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalCost" },
            count: { $sum: 1 },
          },
        },
      ]);

      const totalThisMonth = monthlySalesAgg[0]?.total || 0;
      const totalTransactions = monthlySalesAgg[0]?.count || 0;

      const monthlySalesByDay = {};
      salesThisMonth.forEach((sale) => {
        const day = sale.dateOfSale.getDate();
        if (!monthlySalesByDay[day]) monthlySalesByDay[day] = 0;
        monthlySalesByDay[day] += sale.totalCost;
      });

      // Recent transactions (last 5)
      const recentTransactions = await Sale.find({ salesAgent: agentId })
        .sort({ dateOfSale: -1 })
        .limit(5);

      res.json({
        agent: req.session.user,
        totalThisMonth,
        totalTransactions,
        monthlySalesByDay,
        recentTransactions,
      });
    } catch (err) {
      console.error("Dashboard Error:", err);
      res.status(500).json({ error: "Server Error" });
    }
  }
);

router.get("/view-user", async (req, res) => {
  try {
    let users = await User.find().lean();
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    console.error("Error fetching users:", error); // Return JSON error
    res.status(500).json({ error: "Server Error" });
  }
});

router.get("/edit-user/:id", async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" }); // Return JSON error
    res.json({ user });
  } catch (error) {
    console.error("Error loading user for edit:", error);
    console.error("Error loading user for edit:", error); // Return JSON error
    res.status(500).json({ error: "Server Error" });
  }
});

router.post("/edit-user/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ error: "User not found" }); // Return JSON error
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || "Update failed" });
  }
});

router.delete("/delete-user/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" }); // Return JSON success
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting user" });
  }
});

router.get("/view-stock", ensureAuthenticated, ensureSalesAgent, async (req, res) => {
  try {
    // Use .lean() to get plain JS objects which are easier to manipulate
    const woodStocks = await WoodStock.find().lean();
    const furnitureStocks = await FurnitureStock.find().lean();

    // Combine stocks and add a 'category' field for clarity in the detailed table
    const stocks = [
      ...woodStocks.map(item => ({ ...item, category: 'Wood Stock', updatedAt: item.updatedAt || item.dateReceived || item.date })),
      ...furnitureStocks.map(item => ({ ...item, category: 'Furniture', updatedAt: item.updatedAt || item.dateReceived || item.date }))
    ];

    res.json({ stocks });
  } catch (err) {
    console.error("Error loading stocks:", err.message);
    res.status(500).json({ error: "Server error while fetching detailed stock list" });
  }
});



module.exports = router;

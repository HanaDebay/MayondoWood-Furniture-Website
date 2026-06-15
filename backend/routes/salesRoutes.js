const express = require("express");
const PDFDocument = require("pdfkit");
const router = express.Router();
const { ensureAuthenticated, ensureSalesAgent, ensureManager } = require("../middleware/auth")
const Sale = require("../models/salesModel");
const User = require("../models/userModel");
const WoodStock = require("../models/woodStockModel");
const FurnitureStock = require("../models/furnitureStockModel");



// Record Sale Form (Sales Agent only)
router.get("/record-sale", ensureAuthenticated, ensureSalesAgent, async (req, res) => {
  try {
    const woodStocks = await WoodStock.find().lean();
    const furnitureStocks = await FurnitureStock.find().lean();

    res.json({ agent: req.session.user, woodStocks, furnitureStocks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error loading sales form data" });
  }
});

// Save Sale Record (Sales Agent only)
router.post("/record-sale", ensureAuthenticated, ensureSalesAgent, async (req, res) => {
  try {
    const { productId, productType, quantity, paymentMethod, customerName, transportation, dateOfSale } = req.body;

    let stock;
    if (productType === "WoodStock") {
      stock = await WoodStock.findById(productId);
    } else if (productType === "FurnitureStock") {
      stock = await FurnitureStock.findById(productId);
    }

    if (!stock) return res.status(404).json({ error: "Stock not found" });

    if (quantity > stock.quantity) {
      return res.status(400).json({ error: "Quantity exceeds available stock!" });
    }

    let totalCost = stock.sellingPrice * quantity;
    if (transportation === "company") {
      totalCost += totalCost * 0.05;
    }

    // Calculate cost of this sale
    const costPrice = stock.costPrice * quantity;

    const newSale = new Sale({
      productId,
      productName: stock.productName,
      productType,
      quantity,
      sellingPrice: stock.sellingPrice,
      totalCost,
      costPrice,
      paymentMethod,
      customerName,
      transportation,
      salesAgent: req.session.user._id,
      dateOfSale: dateOfSale ? new Date(dateOfSale) : new Date(),
    });

    await newSale.save();
    stock.quantity -= quantity;
    await stock.save();

    res.status(201).json({ message: "Sale recorded successfully", sale: newSale });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error saving sales record" });
  }
});

// My Sales (Agent can only see their sales)
router.get("/my-sales", ensureAuthenticated, ensureSalesAgent, async (req, res) => {
  try {
    const sales = await Sale.find({ salesAgent: req.session.user._id }).lean(); // Use .lean() for performance
    res.json({ sales });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error loading your sales" });
  }
});

// All Sales (Manager only) - Returns JSON
router.get("/all-sales", ensureAuthenticated, ensureManager, async (req, res) => {
  try {
    const sales = await Sale.find({ salesAgent: { $ne: null } })
      .populate("salesAgent", "username fullName")
      .populate("productId").lean(); // Use .lean() for performance
    res.json({ sales });
  } catch (err) {
    console.error("Error fetching all sales:", err);
    res.status(500).json({ error: "Error loading all sales" });
  }
});

router.get("/edit-sale/:id", ensureManager, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate("salesAgent", "fullName");
    if (!sale) return res.status(404).json({ error: "Sale not found" }); // Return JSON error
    res.json({ sale });
  } catch (err) {
    console.error("Error loading sale for edit:", err);
    res.status(500).json({ error: "Error loading sale" });
  }
});

router.post("/edit-sale/:id", ensureManager, async (req, res) => {
  try {
    const { quantity, sellingPrice, customerName, paymentMethod, transportation } = req.body;

    let sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ error: "Sale not found" });

    // Get the product to calculate cost price
    let stock;
    if (sale.productType === "WoodStock") {
      stock = await WoodStock.findById(sale.productId);
    } else if (sale.productType === "FurnitureStock") {
      stock = await FurnitureStock.findById(sale.productId);
    }

    if (!stock) return res.status(404).json({ error: "Product not found" });

    sale.quantity = quantity;
    sale.sellingPrice = sellingPrice;
    sale.totalCost = quantity * sellingPrice;
    sale.costPrice = stock.costPrice * quantity;
    sale.customerName = customerName;
    sale.paymentMethod = paymentMethod;
    sale.transportation = transportation;

    await sale.save();
    res.json({ message: "Sale updated successfully", sale });
  } catch (err) {
    console.error("Error updating sale:", err);
    res.status(500).json({ error: "Error updating sale" });
  }
});

router.delete("/delete-sale/:id", ensureAuthenticated, ensureManager, async (req, res) => {
  try {
    await Sale.findByIdAndDelete(req.params.id);
    res.json({ message: "Sale deleted successfully" }); // Return JSON success
  } catch (err) {
    console.error("Error deleting sale:", err);
    res.status(500).json({ error: "Error deleting sale" });
  }
});

router.get("/get-receipt/:id", async (req, res) => {
  try {
    const sale = await Sale.findOne({_id: req.params.id})
      .populate("salesAgent", "username fullName")
      .populate("productId").lean(); // Use .lean() for performance
    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }
    res.json({ receipt: sale });
  } catch (err) {
    console.error("Error fetching sale:", err);
    res.status(500).json({ error: "Unable to find a sale" });
  }
});

router.get("/total-sales", ensureAuthenticated, ensureManager, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Sum totalCost for all sales within the current month
    const result = await Sale.aggregate([
      {
        $match: {
          dateOfSale: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          totalSalesThisMonth: { $sum: "$totalCost" },
        },
      },
    ]);

    const totalSalesThisMonth = result[0]?.totalSalesThisMonth || 0;
    res.json({ totalSalesThisMonth });

  } catch (err) {
    console.error("Error calculating total sales:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router
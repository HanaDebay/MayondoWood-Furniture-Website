const express = require("express");
const router = express.Router();
const WoodStockModel = require("../models/woodStockModel");

router.get("/registerWood", (req, res) => {
  res.json({ message: "Send POST to /api/registerWood to add wood stock." });
});

router.post("/registerWood", async (req, res) => {
  try {
    const woodStock = new WoodStockModel(req.body);
    await woodStock.save();
    res.status(201).json({ message: "Wood stock added successfully", woodStock });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to save wood stock" });
  }
});

router.post("/wood-stock", async (req, res) => {
  try {
    const woodStock = new WoodStockModel(req.body);
    await woodStock.save();
    res.status(201).json({ message: "Wood stock added successfully", woodStock });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || "Unable to save wood stock" });
  }
});

router.get("/view-wood-stock", async (req, res) => {
  try {
    const wood = await WoodStockModel.find();
    res.json({ wood });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

router.get("/wood-stock", async (req, res) => {
  try {
    const woodStocks = await WoodStockModel.find();
    res.json({ woodStocks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

router.get("/editWood/:id", async (req, res) => {
  try {
    const item = await WoodStockModel.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Wood stock item not found" });
    }
    res.json({ item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

router.post("/updateWood/:id", async (req, res) => {
  try {
    const item = await WoodStockModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ message: "Wood stock updated successfully", item });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Item not found" });
  }
});

router.put("/wood-stock/:id", async (req, res) => {
  try {
    const item = await WoodStockModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ message: "Wood stock updated successfully", item });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || "Unable to update wood stock" });
  }
});

router.delete("/deleteWood/:id", async (req, res) => {
  try {
    await WoodStockModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting item" });
  }
});

router.delete("/wood-stock/:id", async (req, res) => {
  try {
    await WoodStockModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting item" });
  }
});

module.exports = router;

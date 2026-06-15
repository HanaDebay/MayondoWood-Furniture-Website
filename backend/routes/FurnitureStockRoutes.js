const express = require("express");
const router = express.Router();
const FurnitureStockModel = require("../models/furnitureStockModel");

router.get("/registerFurniture", (req, res) => {
  res.json({ message: "Send POST to /api/registerFurniture to add furniture stock." });
});

router.post("/registerFurniture", async (req, res) => {
  try {
    const furnitureStock = new FurnitureStockModel(req.body);
    await furnitureStock.save();
    res.status(201).json({ message: "Furniture added successfully", furnitureStock });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to save furniture stock" });
  }
});

router.post("/furniture-stock", async (req, res) => {
  try {
    const furnitureStock = new FurnitureStockModel(req.body);
    await furnitureStock.save();
    res.status(201).json({ message: "Furniture added successfully", furnitureStock });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || "Unable to save furniture stock" });
  }
});

router.get("/view-furniure-stock", async (req, res) => {
  try {
    const furniture = await FurnitureStockModel.find();
    res.json({ furniture });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

router.get("/furniture-stock", async (req, res) => {
  try {
    const furnitureStocks = await FurnitureStockModel.find();
    res.json({ furnitureStocks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

router.get("/editFurniture/:id", async (req, res) => {
  try {
    const item = await FurnitureStockModel.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Furniture item not found" });
    }
    res.json({ item });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

router.post("/updateFurniture/:id", async (req, res) => {
  try {
    const item = await FurnitureStockModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ message: "Furniture updated successfully", item });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Item not found" });
  }
});

router.put("/furniture-stock/:id", async (req, res) => {
  try {
    const item = await FurnitureStockModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json({ message: "Furniture updated successfully", item });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || "Unable to update furniture stock" });
  }
});

router.delete("/deleteFurniture/:id", async (req, res) => {
  try {
    await FurnitureStockModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting item" });
  }
});

router.delete("/furniture-stock/:id", async (req, res) => {
  try {
    await FurnitureStockModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting item" });
  }
});

module.exports = router;

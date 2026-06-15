const express = require("express");
const router = express.Router();
const Supplier = require("../models/supplierModel");

router.post("/suppliers", async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json({ message: "Supplier registered successfully", supplier });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to register supplier" });
  }
});

router.get("/suppliers", async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json({ suppliers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

router.get("/suppliers/:id", async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    res.json({ supplier });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

router.put("/suppliers/:id", async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    res.json({ message: "Supplier updated successfully", supplier });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Update failed" });
  }
});

router.delete("/suppliers/:id", async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;

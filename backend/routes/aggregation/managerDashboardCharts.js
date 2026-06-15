const express = require("express");
const router = express.Router();
const Sale = require("../../models/salesModel");
const FurnitureStock = require("../../models/furnitureStockModel");
const WoodStock = require("../../models/woodStockModel");
const Supplier = require("../../models/supplierModel");
const User = require("../../models/userModel");
const { ensureAuthenticated, ensureManager } = require("../../middleware/auth");

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

async function getSalesAndCogs(startDate, endDate) {
  const result = await Sale.aggregate([
    { $match: { dateOfSale: { $gte: startDate, $lt: endDate } } },
    {
      $lookup: {
        from: "woodstocks",
        localField: "productId",
        foreignField: "_id",
        as: "woodProduct",
      },
    },
    {
      $lookup: {
        from: "furniturestocks",
        localField: "productId",
        foreignField: "_id",
        as: "furnitureProduct",
      },
    },
    {
      $project: {
        quantity: 1,
        totalCost: 1,
        costPrice: 1,
        productCost: {
          $cond: [
            { $eq: ["$productType", "WoodStock"] },
            { $arrayElemAt: ["$woodProduct.costPrice", 0] },
            { $arrayElemAt: ["$furnitureProduct.costPrice", 0] },
          ],
        },
      },
    },
    {
      $project: {
        totalCost: 1,
        cogs: {
          $cond: [
            { $gt: ["$costPrice", 0] },
            "$costPrice",
            { $multiply: ["$quantity", { $ifNull: ["$productCost", 0] }] },
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$totalCost" },
        totalCogs: { $sum: "$cogs" },
      },
    },
  ]);

  return result[0] || { totalSales: 0, totalCogs: 0 };
}

async function getDashboardOverview() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  
  // Previous month for comparison
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // This week (last 7 days)
  const startOfThisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalPurchaseWood,
    totalPurchaseFurniture,
    monthlySales,
    lastMonthSales,
    totalSales,
    salesVolume,
    stockUnits,
    suppliersCount,
    usersCount,
    salesPerAgent,
    weeklyAgents,
    monthlySalesData,
    categoryBreakdown,
    topCustomers,
    activityLog,
    currentInventoryValue,
  ] = await Promise.all([
    WoodStock.aggregate([{ $group: { _id: null, total: { $sum: { $multiply: ["$costPrice", "$quantity"] } } } }]),
    FurnitureStock.aggregate([{ $group: { _id: null, total: { $sum: { $multiply: ["$costPrice", "$quantity"] } } } }]),
    getSalesAndCogs(startOfMonth, endOfMonth),
    getSalesAndCogs(startOfLastMonth, endOfLastMonth),
    Sale.aggregate([{ $group: { _id: null, total: { $sum: "$totalCost" } } }]),
    Sale.aggregate([{ $group: { _id: null, transactions: { $sum: 1 }, unitsSold: { $sum: "$quantity" } } }]),
    Promise.all([
      WoodStock.aggregate([{ $group: { _id: null, units: { $sum: "$quantity" } } }]),
      FurnitureStock.aggregate([{ $group: { _id: null, units: { $sum: "$quantity" } } }]),
    ]),
    Supplier.countDocuments(),
    User.countDocuments(),
    Sale.aggregate([
      { $lookup: { from: "users", localField: "salesAgent", foreignField: "_id", as: "agentInfo" } },
      { $unwind: { path: "$agentInfo", preserveNullAndEmptyArrays: true } },
      { $group: { _id: { $ifNull: ["$agentInfo.fullName", "Unassigned"] }, totalSales: { $sum: "$totalCost" }, count: { $sum: 1 } } },
      { $sort: { totalSales: -1 } },
      { $limit: 5 },
    ]),
    // THIS WEEK: All agents with sales
    Sale.aggregate([
      { $match: { dateOfSale: { $gte: startOfThisWeek, $lt: now } } },
      {
        $lookup: {
          from: "woodstocks",
          localField: "productId",
          foreignField: "_id",
          as: "woodProduct",
        },
      },
      {
        $lookup: {
          from: "furniturestocks",
          localField: "productId",
          foreignField: "_id",
          as: "furnitureProduct",
        },
      },
      { $lookup: { from: "users", localField: "salesAgent", foreignField: "_id", as: "agentInfo" } },
      { $unwind: { path: "$agentInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          totalCost: 1,
          quantity: 1,
          costPrice: 1,
          agentName: { $ifNull: ["$agentInfo.fullName", "Unassigned"] },
          productCost: {
            $cond: [
              { $eq: ["$productType", "WoodStock"] },
              { $arrayElemAt: ["$woodProduct.costPrice", 0] },
              { $arrayElemAt: ["$furnitureProduct.costPrice", 0] },
            ],
          },
        },
      },
      {
        $project: {
          agentName: 1,
          totalCost: 1,
          profit: {
            $subtract: [
              "$totalCost",
              {
                $cond: [
                  { $gt: ["$costPrice", 0] },
                  "$costPrice",
                  { $multiply: ["$quantity", { $ifNull: ["$productCost", 0] }] },
                ],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$agentName",
          totalSales: { $sum: "$totalCost" },
          count: { $sum: 1 },
          totalProfit: { $sum: "$profit" },
        },
      },
      { $sort: { totalSales: -1 } },
      // NO LIMIT - show all agents this week
    ]),
    Sale.aggregate([
      {
        $lookup: {
          from: "woodstocks",
          localField: "productId",
          foreignField: "_id",
          as: "woodProduct",
        },
      },
      {
        $lookup: {
          from: "furniturestocks",
          localField: "productId",
          foreignField: "_id",
          as: "furnitureProduct",
        },
      },
      {
        $project: {
          totalCost: 1,
          quantity: 1,
          costPrice: 1,
          year: { $year: "$dateOfSale" },
          month: { $month: "$dateOfSale" },
          productCost: {
            $cond: [
              { $eq: ["$productType", "WoodStock"] },
              { $arrayElemAt: ["$woodProduct.costPrice", 0] },
              { $arrayElemAt: ["$furnitureProduct.costPrice", 0] },
            ],
          },
        },
      },
      {
        $project: {
          year: 1,
          month: 1,
          totalCost: 1,
          cogs: {
            $cond: [
              { $gt: ["$costPrice", 0] },
              "$costPrice",
              { $multiply: ["$quantity", { $ifNull: ["$productCost", 0] }] },
            ],
          },
        },
      },
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          totalSales: { $sum: "$totalCost" },
          totalCogs: { $sum: "$cogs" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]),
    Sale.aggregate([
      { $group: { _id: "$productType", totalSales: { $sum: "$totalCost" }, count: { $sum: 1 } } },
      { $sort: { totalSales: -1 } },
    ]),
    Sale.aggregate([
      { $group: { _id: "$customerName", totalSpent: { $sum: "$totalCost" }, purchaseCount: { $sum: 1 } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
    ]),
    Sale.find({})
      .sort({ dateOfSale: -1 })
      .limit(5)
      .populate("salesAgent", "fullName")
      .select("salesAgent dateOfSale productName quantity totalCost costPrice"),
    // Get current inventory value
    Promise.all([
      WoodStock.aggregate([{ $group: { _id: null, value: { $sum: { $multiply: ["$costPrice", "$quantity"] } } } }]),
      FurnitureStock.aggregate([{ $group: { _id: null, value: { $sum: { $multiply: ["$costPrice", "$quantity"] } } } }]),
    ]),
  ]);

  const totalPurchase = (totalPurchaseWood[0]?.total || 0) + (totalPurchaseFurniture[0]?.total || 0);
  const totalSalesAllTime = totalSales[0]?.total || 0;
  const thisMonthSales = monthlySales.totalSales || 0;
  const lastMonthSalesAmount = lastMonthSales.totalSales || 0;
  
  // Calculate COGS (Cost of Goods Sold)
  const thisMonthCogs = monthlySales.totalCogs || 0;
  const lastMonthCogs = lastMonthSales.totalCogs || 0;
  
  // Gross Profit = Sales - COGS (for the period)
  const thisMonthRevenue = thisMonthSales - thisMonthCogs;
  const lastMonthRevenue = lastMonthSalesAmount - lastMonthCogs;
  
  // Month-over-month growth
  const salesGrowth = lastMonthSalesAmount > 0 ? ((thisMonthSales - lastMonthSalesAmount) / lastMonthSalesAmount) * 100 : 0;
  const revenueGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
  
  const totalStockUnits = (stockUnits[0][0]?.units || 0) + (stockUnits[1][0]?.units || 0);
  
  // Real inventory value = cost to replace current stock
  const inventoryValue = (currentInventoryValue[0][0]?.value || 0) + (currentInventoryValue[1][0]?.value || 0);

  return {
    stats: {
      totalPurchase,
      totalSalesThisMonth: thisMonthSales,
      totalSalesAllTime,
      grossProfitThisMonth: thisMonthRevenue,
      revenueThisMonth: thisMonthRevenue,  // Alias for backwards compatibility
      grossProfitMarginThisMonth: thisMonthSales > 0 ? (thisMonthRevenue / thisMonthSales) * 100 : 0,
      grossProfitMarginAllTime: totalSalesAllTime > 0 ? ((totalSalesAllTime - totalPurchase) / totalSalesAllTime) * 100 : 0,
      revenueAllTime: totalSalesAllTime - totalPurchase,
      totalTransactions: salesVolume[0]?.transactions || 0,
      totalUnitsSold: salesVolume[0]?.unitsSold || 0,
      totalStock: totalStockUnits,
      inventoryValue,  // Real inventory value
      suppliersCount,
      usersCount,
      costOfGoodsSold: thisMonthCogs,
      // Growth metrics
      salesGrowthPercent: salesGrowth,
      revenueGrowthPercent: revenueGrowth,
      lastMonthSales: lastMonthSalesAmount,
      lastMonthRevenue: lastMonthRevenue,
    },
    charts: {
      salesPerAgent: salesPerAgent.map((item) => ({
        label: item._id,
        value: item.totalSales,
        transactions: item.count,
      })),
      weeklyAgents: weeklyAgents.map((item) => ({
        label: item._id,
        value: item.totalSales,
        transactions: item.count,
        profit: item.totalProfit,
      })),
      monthlySales: monthlySalesData.map((item) => ({
        label: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        sales: item.totalSales,
        cogs: item.totalCogs,
        profit: item.totalSales - item.totalCogs,
      })),
      categoryBreakdown: categoryBreakdown.map((item) => ({
        label: item._id === "WoodStock" ? "Wood" : "Furniture",
        value: item.totalSales,
        count: item.count,
      })),
    },
    topCustomers: topCustomers.map((item) => ({
      name: item._id || "Unknown",
      total: item.totalSpent,
      purchases: item.purchaseCount,
    })),
    activityLogs: activityLog.map((sale) => ({
      id: sale._id,
      agent: sale.salesAgent?.fullName || "Unassigned",
      activity: `Sold ${sale.quantity} x ${sale.productName}`,
      amount: sale.totalCost,
      profit: sale.totalCost - (sale.costPrice || 0),
      date: sale.dateOfSale,
    })),
  };
}

router.get("/dashboard-overview", ensureAuthenticated, ensureManager, async (req, res) => {
  try {
    res.json(await getDashboardOverview());
  } catch (err) {
    console.error("Error fetching dashboard overview:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Manager Dashboard Charts Route
router.get("/manager-dashboard-chart",ensureAuthenticated,ensureManager,async (req, res) => {
    try {
      // Monthly sales data (group by month & year)
      const monthlySalesData = await Sale.aggregate([
        {
          $group: {
            _id: {
              month: { $month: "$dateOfSale" },
              year: { $year: "$dateOfSale" },
            },
            totalSales: { $sum: "$totalCost" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      // Sales per agent
      const salesPerAgent = await Sale.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "salesAgent",
            foreignField: "_id",
            as: "agentInfo",
          },
        },
        { $unwind: "$agentInfo" },
        {
          $group: {
            _id: "$agentInfo.fullName",
            totalSales: { $sum: "$totalCost" },
          },
        },
        { $sort: { totalSales: -1 } },
      ]);

      // Category breakdown
      const categoryBreakdown = await Sale.aggregate([
        {
          $group: {
            _id: "$productType",
            totalSales: { $sum: "$totalCost" },
          },
        },
      ]);

      // Top customers
      const topCustomers = await Sale.aggregate([
        {
          $group: {
            _id: "$customerName",
            totalSpent: { $sum: "$totalCost" },
          },
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 5 },
      ]);

      // Attendant activity log
      const activityLog = await Sale.find({})
        .sort({ dateOfSale: -1 })
        .limit(5)
        .populate("salesAgent", "fullName")
        .select("salesAgent dateOfSale productName quantity");
      res.json({
        monthlySalesData,
        salesPerAgent,
        categoryBreakdown,
        topCustomers,
        activityLog,
      });
    } catch (err) {
      console.error("Error fetching dashboard chart data:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;

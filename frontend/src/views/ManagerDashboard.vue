<template>
  <div class="p-4 bg-light min-vh-100">
    <div class="d-flex justify-content-between align-items-center mb-4 gap-3 flex-wrap">
      <div>
        <h2 class="mb-0">Manager Dashboard</h2>
        <p class="text-muted mb-0">Business Performance Overview</p>
      </div>
      <h5 v-if="authStore.user" class="mb-0">Welcome back, {{ authStore.user.fullName }}</h5>
    </div>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <!-- Primary KPIs -->
    <div class="row g-3 mb-4">
      <div class="col-12 col-md-6 col-lg-3">
        <div class="card kpi-card kpi-primary p-3 bg-white border-0 shadow-sm d-flex flex-column justify-content-between">
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <p class="text-muted mb-1 small">Sales This Month</p>
              <h4 class="mb-1">{{ formatCurrency(stats.totalSalesThisMonth) }}</h4>
              <div class="trend" :class="stats.salesGrowthPercent >= 0 ? 'trend-up' : 'trend-down'">
                <svg viewBox="0 0 24 24" :class="stats.salesGrowthPercent >= 0 ? 'up' : 'down'">
                  <path d="M12 5v14M5 12l7-7 7 7"/>
                </svg>
                <span>{{ Math.abs(stats.salesGrowthPercent).toFixed(1) }}% vs last month</span>
              </div>
            </div>
            <span class="kpi-icon tone-blue">
              <svg viewBox="0 0 24 24">
                <path d="M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-8"/>
              </svg>
            </span>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-6 col-lg-3">
        <div class="card kpi-card kpi-primary p-3 bg-white border-0 shadow-sm d-flex flex-column justify-content-between">
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <p class="text-muted mb-1 small">Gross Profit This Month</p>
              <small class="text-muted d-block" style="font-size: 0.7rem;">Sales - COGS</small>
              <h4 class="mb-1">{{ formatCurrency(stats.grossProfitThisMonth) }}</h4>
              <div class="trend" :class="stats.revenueGrowthPercent >= 0 ? 'trend-up' : 'trend-down'">
                <svg viewBox="0 0 24 24" :class="stats.revenueGrowthPercent >= 0 ? 'up' : 'down'">
                  <path d="M12 5v14M5 12l7-7 7 7"/>
                </svg>
                <span>{{ Math.abs(stats.revenueGrowthPercent).toFixed(1) }}% vs last month</span>
              </div>
            </div>
            <span class="kpi-icon tone-gold">
              <svg viewBox="0 0 24 24">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </span>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-6 col-lg-3">
        <div class="card kpi-card p-3 bg-white border-0 shadow-sm d-flex flex-column justify-content-between">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <p class="text-muted mb-1 small">Transactions</p>
              <h4 class="mb-0">{{ formatNumber(stats.totalTransactions) }}</h4>
            </div>
            <span class="kpi-icon tone-green">
              <svg viewBox="0 0 24 24">
                <path d="M7 3h10v18H7zM9 7h6M9 11h6M9 15h3"/>
              </svg>
            </span>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-6 col-lg-3">
        <div class="card kpi-card p-3 bg-white border-0 shadow-sm d-flex flex-column justify-content-between">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <p class="text-muted mb-1 small">Units Sold</p>
              <h4 class="mb-0">{{ formatNumber(stats.totalUnitsSold) }}</h4>
            </div>
            <span class="kpi-icon tone-purple">
              <svg viewBox="0 0 24 24">
                <path d="M21 16V8l-9-5-9 5v8l9 5 9-5ZM3 8l9 5 9-5M12 13v8"/>
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Secondary Metrics -->
    <div class="row g-3 mb-4">
      <div class="col-12 col-md-6 col-lg-3">
        <div class="card p-3 bg-white border-0 shadow-sm">
          <p class="text-muted mb-1 small">All-Time Revenue</p>
          <h5 class="mb-2">{{ formatCurrency(stats.totalSalesAllTime) }}</h5>
          <p class="text-muted small mb-0">Total sales since launch</p>
        </div>
      </div>
      <div class="col-12 col-md-6 col-lg-3">
        <div class="card p-3 bg-white border-0 shadow-sm">
          <p class="text-muted mb-1 small">Current Inventory Value</p>
          <h5 class="mb-2">{{ formatCurrency(stats.inventoryValue) }}</h5>
          <p class="text-muted small mb-0">Cost to replace {{ formatNumber(stats.totalStock) }} units</p>
        </div>
      </div>
      <div class="col-12 col-md-6 col-lg-3">
        <div class="card p-3 bg-white border-0 shadow-sm">
          <p class="text-muted mb-1 small">COGS This Month</p>
          <h5 class="mb-2">{{ formatCurrency(stats.costOfGoodsSold) }}</h5>
          <p class="text-muted small mb-0">Cost of items sold</p>
        </div>
      </div>
      <div class="col-12 col-md-6 col-lg-3">
        <div class="card p-3 bg-white border-0 shadow-sm">
          <p class="text-muted mb-1 small">Gross Profit Margin</p>
          <h5 class="mb-2">{{ formatPercent(stats.grossProfitMarginThisMonth) }}</h5>
          <p class="text-muted small mb-0">Margin on this month’s sales</p>
        </div>
      </div>
    </div>

    <div class="row g-4 mb-5">
      <div class="col-12 col-lg-6">
        <div class="card p-3">
          <h5 class="card-title">Sales per Agent This Week</h5>
          <canvas ref="barChartCanvas"></canvas>
        </div>
      </div>

      <div class="col-12 col-lg-6">
        <div class="card p-3">
          <h5 class="card-title">Profit Trend</h5>
          <canvas ref="lineChartCanvas"></canvas>
        </div>
      </div>
    </div>

    <div class="row g-4 mb-5">
      <div class="col-12">
        <div class="card p-3 chart-card">
          <h5 class="card-title">Sales by Category</h5>
          <div class="chart-wrapper">
            <canvas ref="pieChartCanvas"></canvas>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-12 col-lg-5">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">Top 5 Customers</h5>
            <ul class="list-group list-group-flush">
              <li v-for="(customer, idx) in topCustomers.slice(0, 4)" :key="idx" class="list-group-item d-flex justify-content-between px-0">
                <div>
                  <span>{{ customer.name }}</span>
                  <small class="d-block text-muted">{{ customer.purchases }} purchase{{ customer.purchases !== 1 ? 's' : '' }}</small>
                </div>
                <strong>{{ formatCurrency(customer.total) }}</strong>
              </li>
              <li v-if="!loading && topCustomers.length === 0" class="list-group-item px-0">No sales data available</li>
              <li v-if="loading" class="list-group-item px-0">Loading...</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-7">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">Recent Activity (Last 5 Sales)</h5>
            <div class="table-responsive">
              <table class="table table-striped mb-0">
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Product Sold</th>
                    <th>Profit</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(log, idx) in activityLogs.slice(0, 5)" :key="idx">
                    <td>{{ log.agent }}</td>
                    <td><small>{{ log.activity }}</small></td>
                    <td>
                      <span class="badge" :class="log.profit > 0 ? 'bg-success' : 'bg-warning'">
                        {{ formatCurrency(log.profit) }}
                      </span>
                    </td>
                    <td>{{ formatDate(log.date) }}</td>
                  </tr>
                  <tr v-if="!loading && activityLogs.length === 0">
                    <td colspan="4" class="text-center">No recent activity</td>
                  </tr>
                  <tr v-if="loading">
                    <td colspan="4" class="text-center">Loading...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'
import Chart from 'chart.js/auto'

const authStore = useAuthStore()
const loading = ref(true)
const error = ref('')
const stats = ref({
  totalSalesThisMonth: 0,
  totalSalesAllTime: 0,
  grossProfitThisMonth: 0,
  revenueThisMonth: 0,
  grossProfitMarginThisMonth: 0,
  revenueAllTime: 0,
  totalTransactions: 0,
  totalUnitsSold: 0,
  totalStock: 0,
  inventoryValue: 0,
  suppliersCount: 0,
  usersCount: 0,
  costOfGoodsSold: 0,
  salesGrowthPercent: 0,
  revenueGrowthPercent: 0,
  lastMonthSales: 0,
  lastMonthRevenue: 0,
})
const chartData = ref({
  salesPerAgent: [],
  weeklyAgents: [],
  monthlySales: [],
  categoryBreakdown: []
})
const topCustomers = ref([])
const activityLogs = ref([])

const barChartCanvas = ref(null)
const lineChartCanvas = ref(null)
const pieChartCanvas = ref(null)
const chartInstances = []
let refreshInterval = null

const healthScore = computed(() => {
  const score = Math.min(100, (stats.value.usersCount + stats.value.suppliersCount) * 10)
  return score
})

const suppliersLabel = computed(() => `${stats.value.suppliersCount} suppliers`)
const usersLabel = computed(() => `${stats.value.usersCount} staff`)

onMounted(() => {
  fetchDashboardData()
  // Auto-refresh dashboard data every 30 seconds
  refreshInterval = setInterval(() => {
    fetchDashboardData()
  }, 30000)
})

onUnmounted(() => {
  destroyCharts()
  // Clear the refresh interval
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})

const fetchDashboardData = async () => {
  loading.value = true
  error.value = ''
  try {
    const { data } = await axios.get('/api/dashboard-overview')
    // Debug: log API response to help track missing fields
    // eslint-disable-next-line no-console
    console.log('dashboard-overview response:', data)

    // Backwards-compatible mappings: some responses may not include
    // `revenueThisMonth` or `costOfGoodsSold` keys. Create fallbacks.
    const incomingStats = data.stats || {}
    const mappedStats = {
      ...incomingStats,
      // Gross profit expected as `grossProfitThisMonth`.
      grossProfitThisMonth: incomingStats.grossProfitThisMonth ?? incomingStats.revenueThisMonth ?? (
        (incomingStats.totalSalesThisMonth || 0) - (incomingStats.costOfGoodsSold ?? incomingStats.totalCogs ?? 0)
      ),
      revenueThisMonth: incomingStats.revenueThisMonth ?? incomingStats.grossProfitThisMonth ?? (incomingStats.totalSalesThisMonth || 0),
      grossProfitMarginThisMonth: incomingStats.grossProfitMarginThisMonth ?? (
        (incomingStats.totalSalesThisMonth > 0 && incomingStats.costOfGoodsSold != null)
          ? (((incomingStats.totalSalesThisMonth || 0) - (incomingStats.costOfGoodsSold || 0)) / (incomingStats.totalSalesThisMonth || 1)) * 100
          : 0
      ),
      costOfGoodsSold: incomingStats.costOfGoodsSold ?? incomingStats.totalCogs ?? 0,
    }

    stats.value = { ...stats.value, ...mappedStats }
    chartData.value = { ...chartData.value, ...(data.charts || {}) }
    topCustomers.value = data.topCustomers || []
    activityLogs.value = data.activityLogs || []
    renderCharts()
  } catch (e) {
    error.value = e.response?.data?.error || 'Unable to load dashboard data'
  } finally {
    loading.value = false
  }
}

const renderCharts = () => {
  destroyCharts()

  chartInstances.push(new Chart(barChartCanvas.value, {
    type: 'bar',
    data: {
      labels: chartData.value.weeklyAgents.map((item) => item.label),
      datasets: [{
        label: 'Sales UGX',
        data: chartData.value.weeklyAgents.map((item) => item.value),
        backgroundColor: '#4a90a4'
      }]
    },
    options: chartOptions()
  }))

  chartInstances.push(new Chart(lineChartCanvas.value, {
    type: 'line',
    data: {
      labels: chartData.value.monthlySales.map((item) => item.label),
      datasets: [{
        label: 'Profit UGX',
        data: chartData.value.monthlySales.map((item) => item.profit),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.12)',
        fill: true,
        tension: 0.3
      }]
    },
    options: chartOptions()
  }))

  chartInstances.push(new Chart(pieChartCanvas.value, {
    type: 'doughnut',
    data: {
      labels: chartData.value.categoryBreakdown.map((item) => item.label),
      datasets: [{
        data: chartData.value.categoryBreakdown.map((item) => item.value),
        backgroundColor: ['#4a90a4', '#73d47b']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  }))
}

const chartOptions = () => ({
  responsive: true,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => Number(value).toLocaleString()
      }
    }
  }
})

const destroyCharts = () => {
  while (chartInstances.length) {
    chartInstances.pop().destroy()
  }
}

const formatCurrency = (value) => `${Number(value || 0).toLocaleString()} UGX`
const formatNumber = (value) => Number(value || 0).toLocaleString()
const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`
const formatDate = (date) => date ? new Date(date).toLocaleDateString() : ''
</script>

<style scoped>
.kpi-card {
  min-height: 130px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

/* Ensure KPI cards are visually equal height and content aligns */
.kpi-card {
  min-height: 150px;
  display: flex;
  flex-direction: column;
}
.kpi-card .trend {
  margin-top: auto;
}

/* Chart card constraints */
.chart-card .chart-wrapper {
  max-height: 360px;
  overflow: hidden;
}
.chart-card canvas {
  max-height: 340px !important;
  width: 100% !important;
}

.kpi-primary {
  border-left: 4px solid #2563eb;
}

.kpi-icon {
  display: inline-flex;
  width: 50px;
  height: 50px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  flex-shrink: 0;
}

.kpi-icon svg {
  width: 28px;
  height: 28px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.tone-blue { color: #2563eb; background: #dbeafe; }
.tone-green { color: #16a34a; background: #dcfce7; }
.tone-gold { color: #b7791f; background: #fef3c7; }
.tone-purple { color: #7c3aed; background: #ede9fe; }
.tone-pink { color: #db2777; background: #fce7f3; }

.trend {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.trend svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
}

.trend-up { color: #16a34a; }
.trend-down { color: #dc2626; }

.trend svg.down path {
  transform: scaleY(-1);
}

.card {
  border: none;
  transition: all 0.3s;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}

.card-title {
  font-weight: 600;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #f0f2f5;
  padding-bottom: 1rem;
}

.badge {
  padding: 0.4rem 0.8rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.table {
  margin-bottom: 0;
  font-size: 0.9rem;
}

.table thead {
  border-top: 1px solid #f0f2f5;
}

.table tbody tr {
  border-color: #f0f2f5;
  transition: background-color 0.15s;
}

.table tbody tr:hover {
  background-color: #fafbfc;
}

.fw-500 {
  font-weight: 500;
}

.list-group-item {
  border-color: #f0f2f5;
  padding: 0.75rem 0;
}

.table-light {
  background-color: #f8f9fa;
}


.card {
  border: none;
  transition: all 0.3s;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}

.card-title {
  font-weight: 600;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #f0f2f5;
  padding-bottom: 1rem;
}

.badge {
  padding: 0.4rem 0.8rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.list-group-item {
  border-color: #f0f2f5;
  padding: 0.75rem 0;
}

.table tbody tr {
  border-color: #f0f2f5;
}

.table tbody tr:hover {
  background-color: #fafbfc;
}
</style>

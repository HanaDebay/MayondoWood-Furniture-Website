<template>
  <div class="main-content p-4 bg-light min-vh-100">
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
      <div>
        <h2 class="mb-0">Sales Agent Dashboard</h2>
        <p class="text-muted mb-0">Your sales activity and available stock</p>
      </div>
      <h5 v-if="authStore.user" class="mb-0">Welcome, {{ authStore.user.fullName }}</h5>
    </div>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>

    <!-- KPI Statistics Section -->
    <div class="row g-4 mb-5">
      <div v-for="card in kpiCards" :key="card.label" class="col-12 col-sm-6 col-xl-3">
        <div class="card kpi-card h-100 p-3 border-0 shadow-sm">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <p class="text-muted small text-uppercase fw-bold mb-1">{{ card.label }}</p>
              <h4 class="mb-0 fw-bold">{{ card.value }}</h4>
            </div>
            <div :class="['kpi-icon', card.tone]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; height: 24px;">
                <path :d="icons[card.iconKey]" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <h5 class="mb-4 fw-bold">Quick Actions</h5>
    <div class="row g-4 mb-5">
      <div class="col-12 col-md-4">
        <router-link to="/sales/record-sale" class="text-decoration-none">
          <div class="card p-4 text-center action-card bg-primary text-white border-0 shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-3 mx-auto" style="width: 48px; height: 48px;">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <h4 class="mb-0">Record Sale</h4>
          </div>
        </router-link>
      </div>
      <div class="col-12 col-md-4">
        <router-link to="/sales/view-stock" class="text-decoration-none">
          <div class="card p-4 text-center action-card bg-info text-white border-0 shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-3 mx-auto" style="width: 48px; height: 48px;">
              <path d="M21 16V8l-9-5-9 5v8l9 5 9-5ZM3 8l9 5 9-5M12 13v8" />
            </svg>
            <h4 class="mb-0">Check Stock</h4>
          </div>
        </router-link>
      </div>
      <div class="col-12 col-md-4">
        <router-link to="/sales/my-sales" class="text-decoration-none">
          <div class="card p-4 text-center action-card bg-success text-white border-0 shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-3 mx-auto" style="width: 48px; height: 48px;">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 class="mb-0">Sales History</h4>
          </div>
        </router-link>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <h5 class="card-title">Recent Transactions</h5>
        <div class="table-responsive">
          <table class="table table-striped mb-0">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sale in recentTransactions" :key="sale._id">
                <td>{{ sale.productName }}</td>
                <td>{{ sale.quantity }}</td>
                <td>{{ formatCurrency(sale.totalCost) }}</td>
                <td>{{ formatDate(sale.dateOfSale) }}</td>
              </tr>
              <tr v-if="!loading && recentTransactions.length === 0">
                <td colspan="4" class="text-center">No recent transactions</td>
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
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const authStore = useAuthStore()
const loading = ref(true)
const error = ref('')
const monthlySales = ref(0)
const totalTransactions = ref(0)
const woodAvailable = ref(0)
const furnitureAvailable = ref(0)
const recentTransactions = ref([])

const icons = {
  sales: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6',
  receipt: 'M7 3h10v18H7zM9 7h6M9 11h6M9 15h3',
  wood: 'M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z',
  furniture: 'M4 12V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v4M4 12h16v7H4zM7 19v2M17 19v2'
}

// Computed property to handle KPI card data and color matching
const kpiCards = computed(() => [
  { label: 'Sales (Month)', value: formatCurrency(monthlySales.value), iconKey: 'sales', tone: 'tone-blue' },
  { label: 'Transactions', value: totalTransactions.value.toString(), iconKey: 'receipt', tone: 'tone-green' },
  { label: 'Wood Units', value: `${woodAvailable.value.toLocaleString()}`, iconKey: 'wood', tone: 'tone-cyan' },
  { label: 'Furniture Units', value: `${furnitureAvailable.value.toLocaleString()}`, iconKey: 'furniture', tone: 'tone-cyan' }
])

onMounted(async () => {
  await loadDashboard()
})

const loadDashboard = async () => {
  loading.value = true
  error.value = ''
  try {
    const [dashboard, stock] = await Promise.all([
      axios.get('/api/sales-agent-dashboard'),
      axios.get('/api/record-sale')
    ])

    monthlySales.value = dashboard.data.totalThisMonth || 0
    totalTransactions.value = dashboard.data.totalTransactions || 0
    recentTransactions.value = dashboard.data.recentTransactions || []
    woodAvailable.value = sumQuantity(stock.data.woodStocks)
    furnitureAvailable.value = sumQuantity(stock.data.furnitureStocks)
  } catch (e) {
    error.value = e.response?.data?.error || 'Unable to load sales dashboard'
  } finally {
    loading.value = false
  }
}

const sumQuantity = (items = []) => items.reduce((total, item) => total + Number(item.quantity || 0), 0)
const formatCurrency = (value) => `${Number(value || 0).toLocaleString()} UGX`
const formatDate = (value) => value ? new Date(value).toLocaleDateString() : ''
</script>

<style scoped>
.kpi-card, .action-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.kpi-card:hover, .action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08) !important;
}

.kpi-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1.25rem;
}

/* Tone colors matching Quick Action Buttons */
.tone-blue { background-color: #e7f0ff; color: #0d6efd; }  /* Matches Primary */
.tone-cyan { background-color: #e0f7fa; color: #0dcaf0; }  /* Matches Info */
.tone-green { background-color: #e8f5e9; color: #198754; } /* Matches Success */

.main-content {
  background-color: #f0f2f5;
}
.card-title {
  font-weight: 700;
}
</style>

<template>
  <div class="main-content p-4 bg-light min-vh-100">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-0">📦 Available Stock</h2>
        <p class="text-muted mb-0">Detailed list of all furniture and wood stock</p>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger shadow-sm">{{ error }}</div>

    <div class="card shadow-sm border-0 mb-4">
      <div class="card-body p-4">
        <div class="input-group mb-4">
          <span class="input-group-text bg-white border-end-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;" class="text-muted">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
          </span>
          <input 
            v-model="searchQuery" 
            type="text" 
            class="form-control border-start-0 ps-0 shadow-none" 
            placeholder="Search by name, type, supplier, or quality..."
          >
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th width="50">#</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Type/Quality</th>
                <th>Quantity</th>
                <th>Unit Price (UGX)</th>
                <th>Supplier</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(stock, index) in filteredStocks" :key="stock._id">
                <td>{{ index + 1 }}</td>
                <td class="fw-bold">{{ stock.productName }}</td>
                <td>
                  <span class="badge rounded-pill px-3" :class="stock.category === 'Furniture' ? 'bg-info-subtle text-info border border-info-subtle' : 'bg-secondary-subtle text-secondary border border-secondary-subtle'">
                    {{ stock.category }}
                  </span>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <span class="fw-medium">{{ stock.productType || 'N/A' }}</span>
                    <small class="text-muted" v-if="stock.quality">Quality: {{ stock.quality }}</small>
                  </div>
                </td>
                <td>
                  <span :class="['fw-bold', stock.quantity < 10 ? 'text-danger' : 'text-dark']">
                    {{ stock.quantity?.toLocaleString() }}
                    <small class="text-muted ms-1">Units</small>
                  </span>
                </td>
                <td>{{ formatCurrency(stock.sellingPrice) }}</td>
                <td>{{ stock.supplierName || 'N/A' }}</td>
                <td>
                  <div class="text-muted small">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;" class="me-1">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {{ formatDate(stock.dateReceived || stock.updatedAt) }}
                  </div>
                </td>
              </tr>
              <tr v-if="!loading && filteredStocks.length === 0">
                <td colspan="8" class="text-center py-5 text-muted">
                  <i class="fa-solid fa-box-open fa-2xl mb-3 d-block"></i>
                  No matching stock items found.
                </td>
              </tr>
              <tr v-if="loading">
                <td colspan="8" class="text-center py-5">
                  <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                  <span class="text-muted">Loading stock data...</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const stocks = ref([])
const loading = ref(true)
const error = ref('')
const searchQuery = ref('')

const fetchStocks = async () => {
  loading.value = true
  error.value = ''
  try {
    const { data } = await axios.get('/api/view-stock')
    stocks.value = data.stocks || []
  } catch (err) {
    console.error('Error fetching stocks:', err)
    error.value = err.response?.data?.error || `Error ${err.response?.status || 'Unknown'}: Unable to connect to the stock service.`
  } finally {
    loading.value = false
  }
}

const filteredStocks = computed(() => {
  if (!searchQuery.value) return stocks.value
  
  const query = searchQuery.value.toLowerCase()
  return stocks.value.filter(item => {
    return (
      (item.productName && item.productName.toLowerCase().includes(query)) ||
      (item.productType && item.productType.toLowerCase().includes(query)) ||
      (item.supplierName && item.supplierName.toLowerCase().includes(query)) ||
      (item.quality && item.quality.toLowerCase().includes(query))
    )
  })
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-UG', {
    style: 'decimal'
  }).format(value || 0)
}

const formatDate = (value) => {
  if (!value) return 'N/A'
  return new Date(value).toISOString().substring(0, 10)
}

onMounted(() => {
  fetchStocks()
})
</script>

<style scoped>
.main-content {
  background-color: #f8f9fa;
}
.table thead th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  padding: 1rem;
}
.table tbody td {
  padding: 1rem;
}
.badge {
  font-weight: 500;
}
.input-group-text {
  padding-left: 1.25rem;
}
</style>

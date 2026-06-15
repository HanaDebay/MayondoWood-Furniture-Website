<template>
  <div class="container-fluid p-4">
    <h2 class="mb-4">My Sales</h2>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Date</th>
          <th>Product</th>
          <th>Customer</th>
          <th>Quantity</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="sale in sales" :key="sale._id">
          <td>{{ formatDate(sale.dateOfSale) }}</td>
          <td>{{ sale.productName }}</td>
          <td>{{ sale.customerName }}</td>
          <td>{{ sale.quantity }}</td>
          <td>{{ formatCurrency(sale.totalCost) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const sales = ref([])
const error = ref('')

const loadSales = async () => {
  try {
    const { data } = await axios.get('/api/my-sales')
    sales.value = data.sales || data
  } catch (e) {
    error.value = 'Failed to load sales'
  }
}

const formatCurrency = (value) => `${Number(value || 0).toLocaleString()} UGX`

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

onMounted(() => {
  loadSales()
})
</script>
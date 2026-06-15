<template>
  <div class="p-4 bg-light min-vh-100">
    <div class="container py-5">
      <div class="col-lg-10">
        <div class="card shadow-lg rounded-4">
          <div class="card-header bg-success text-white text-center py-3 rounded-top-4">
            <h3 class="mb-0">Record Sale</h3>
          </div>
          <div class="card-body p-4">
            <div v-if="message" :class="`alert alert-${messageType}`">{{ message }}</div>

            <div v-if="showModal" class="modal fade show d-block" tabindex="-1" role="dialog" style="background: rgba(0,0,0,0.4);">
              <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content shadow-lg">
                  <div :class="['modal-header', modalType === 'success' ? 'bg-success' : 'bg-danger', 'text-white']">
                    <h5 class="modal-title">{{ modalTitle }}</h5>
                    <button type="button" class="btn-close btn-close-white" @click="closeModal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    <p class="mb-0">{{ modalMessage }}</p>
                  </div>
                  <div class="modal-footer">
                    <button type="button" :class="['btn', modalType === 'success' ? 'btn-success' : 'btn-danger']" @click="closeModal">Close</button>
                  </div>
                </div>
              </div>
            </div>

            <form @submit.prevent="handleSubmit" novalidate>
              <div class="row">
                <!-- Sales Agent Info -->
                <div class="col-md-6 mb-3">
                  <label class="form-label">Sales Agent</label>
                  <input class="form-control" type="text" :value="authStore.user?.fullName" readonly>
                </div>

                <!-- Product Type -->
                <div class="col-md-6 mb-3">
                  <label class="form-label">Product Type</label>
                  <select class="form-select" v-model="form.productType" @change="() => { handleTypeChange(); touchField('productType'); }">
                    <option value="" disabled>Select product type</option>
                    <option value="WoodStock">Wood</option>
                    <option value="FurnitureStock">Furniture</option>
                  </select>
                  <div v-if="formErrors.productType" class="form-text text-danger">{{ formErrors.productType }}</div>
                </div>

                <!-- Product Selection -->
                <div class="col-md-6 mb-3">
                  <label class="form-label">Product</label>
                  <select class="form-select" v-model="form.productId" @change="() => { updateUnitPrice(); touchField('productId'); }" :disabled="!form.productType">
                    <option value="" disabled>Select product</option>
                    <option v-for="p in filteredProducts" :key="p._id" :value="p._id" :disabled="p.quantity <= 0">
                      {{ p.productName }} - {{ p.quantity }} available
                    </option>
                  </select>
                  <div v-if="formErrors.productId" class="form-text text-danger">{{ formErrors.productId }}</div>
                </div>

                <!-- Unit Price -->
                <div class="col-md-6 mb-3">
                  <label class="form-label">Unit Price (UGX)</label>
                  <input class="form-control" type="number" v-model="form.unitPrice" readonly>
                </div>

                <!-- Quantity -->
                <div class="col-md-6 mb-3">
                  <label class="form-label">Quantity</label>
                  <input
                    class="form-control"
                    type="number"
                    v-model.number="form.quantity"
                    min="1"
                    :max="selectedProduct?.quantity || 9999"
                    title="Quantity must not exceed available stock"
                    @input="() => { calculateTotal(); validateField('quantity'); touchField('quantity'); }"
                    @blur="touchField('quantity')"
                  >
                  <div v-if="formErrors.quantity" class="form-text text-danger">{{ formErrors.quantity }}</div>
                </div>

                <!-- Customer Name -->
                <div class="col-md-6 mb-3">
                  <label class="form-label">Customer Name</label>
                  <input
                    class="form-control"
                    type="text"
                    v-model="form.customerName"
                    placeholder="Enter customer name"
                    @input="() => { validateField('customerName'); touchField('customerName'); }"
                    @blur="touchField('customerName')"
                  >
                  <div v-if="formErrors.customerName" class="form-text text-danger">{{ formErrors.customerName }}</div>
                </div>

                <!-- Payment Method -->
                <div class="col-md-6 mb-3">
                  <label class="form-label">Payment Method</label>
                  <select class="form-select" v-model="form.paymentMethod" @change="touchField('paymentMethod'); validateField('paymentMethod')">
                    <option value="" disabled>Select payment method</option>
                    <option value="cash">Cash</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="mobile">Mobile Money</option>
                  </select>
                  <div v-if="formErrors.paymentMethod" class="form-text text-danger">{{ formErrors.paymentMethod }}</div>
                </div>

                <!-- Sale Date -->
                <div class="col-md-6 mb-3">
                  <label class="form-label">Date of Sale</label>
                  <input class="form-control" type="date" v-model="form.dateOfSale" @change="() => { validateField('dateOfSale'); touchField('dateOfSale'); }" />
                  <div v-if="formErrors.dateOfSale" class="form-text text-danger">{{ formErrors.dateOfSale }}</div>
                </div>
              </div>

              <div class="form-check mb-4">
                <input id="transport" class="form-check-input" type="checkbox" v-model="form.transportation" @change="calculateTotal">
                <label class="form-check-label" for="transport">Transportation from company (+5% cost)</label>
              </div>

              <div class="mb-4 text-end">
                <h4 class="text-success">Total Cost: {{ form.totalCost.toLocaleString() }} UGX</h4>
              </div>

              <div class="d-flex justify-content-between">
                <button class="btn btn-success px-5" type="submit" :disabled="loading">Record Sale</button>
                <button class="btn btn-outline-secondary" type="reset" @click="resetForm">Clear</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

const authStore = useAuthStore()
const loading = ref(false)
const message = ref('')
const messageType = ref('success')
const showModal = ref(false)
const modalType = ref('success')
const modalTitle = ref('')
const modalMessage = ref('')
const router = useRouter()

const woodStocks = ref([])
const furnitureStocks = ref([])

const form = ref({
  productType: '',
  productId: '',
  unitPrice: 0,
  quantity: 1,
  transportation: false,
  totalCost: 0,
  customerName: '',
  paymentMethod: '',
  dateOfSale: new Date().toISOString().substring(0, 10)
})

const filteredProducts = computed(() => {
  return form.value.productType === 'WoodStock' ? woodStocks.value : furnitureStocks.value
})

const selectedProduct = computed(() => {
  return filteredProducts.value.find(p => p._id === form.value.productId) || null
})

const formErrors = ref({
  productType: '',
  productId: '',
  quantity: '',
  customerName: '',
  paymentMethod: '',
  dateOfSale: ''
})

const touchedFields = ref({})

const touchField = (field) => {
  touchedFields.value[field] = true
  validateField(field)
}

const validateField = (field) => {
  const value = form.value[field]
  const namePattern = /^[A-Za-z ]+$/
  switch (field) {
    case 'productType':
      formErrors.value.productType = value ? '' : 'Product type is required.'
      break
    case 'productId':
      formErrors.value.productId = value ? '' : 'Please select a product.'
      break
    case 'quantity':
      if (!value || Number(value) < 1) {
        formErrors.value.quantity = 'Quantity must be at least 1.'
      } else if (selectedProduct.value && Number(value) > selectedProduct.value.quantity) {
        formErrors.value.quantity = `Only ${selectedProduct.value.quantity} units are available.`
      } else {
        formErrors.value.quantity = ''
      }
      break
    case 'customerName':
      if (!value || !value.trim()) {
        formErrors.value.customerName = 'Customer name is required.'
      } else if (value.trim().length < 3) {
        formErrors.value.customerName = 'Customer name must be at least 3 characters.'
      } else if (value.trim().length > 60) {
        formErrors.value.customerName = 'Customer name cannot exceed 60 characters.'
      } else if (!namePattern.test(value.trim())) {
        formErrors.value.customerName = 'Customer name can only contain letters and spaces.'
      } else {
        formErrors.value.customerName = ''
      }
      break
    case 'paymentMethod':
      formErrors.value.paymentMethod = value ? '' : 'Payment method is required.'
      break
    case 'dateOfSale':
      if (!value) {
        formErrors.value.dateOfSale = 'Sale date is required.'
      } else {
        const selectedDate = new Date(value)
        const today = new Date()
        if (isNaN(selectedDate.getTime())) {
          formErrors.value.dateOfSale = 'Please select a valid date.'
        } else if (selectedDate > today) {
          formErrors.value.dateOfSale = 'Sale date cannot be in the future.'
        } else {
          formErrors.value.dateOfSale = ''
        }
      }
      break
    default:
      break
  }
  return !formErrors.value[field]
}

const openModal = (type, title, messageText) => {
  modalType.value = type
  modalTitle.value = title
  modalMessage.value = messageText
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const validateForm = () => {
  const fields = ['productType', 'productId', 'quantity', 'customerName', 'paymentMethod', 'dateOfSale']
  fields.forEach((field) => {
    touchedFields.value[field] = true
    validateField(field)
  })
  const hasErrors = Object.values(formErrors.value).some((error) => error)
  if (hasErrors) {
    message.value = 'Please fix the highlighted fields before submitting.'
    messageType.value = 'danger'
    return false
  }
  return true
}

onMounted(async () => {
  try {
    const { data } = await axios.get('/api/record-sale')
    woodStocks.value = data.woodStocks || []
    furnitureStocks.value = data.furnitureStocks || []
  } catch (e) {
    message.value = e.response?.data?.error || 'Unable to load available stock.'
    messageType.value = 'danger'
  }
})

const handleTypeChange = () => {
  form.value.productId = ''
  form.value.unitPrice = 0
  calculateTotal()
}

const updateUnitPrice = () => {
  const product = filteredProducts.value.find(p => p._id === form.value.productId)
  form.value.unitPrice = product ? product.sellingPrice : 0
  calculateTotal()
}

const calculateTotal = () => {
  const subtotal = form.value.quantity * form.value.unitPrice
  form.value.totalCost = form.value.transportation ? subtotal * 1.05 : subtotal
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  loading.value = true
  try {
    const payload = {
      ...form.value,
      quantity: Number(form.value.quantity),
      transportation: form.value.transportation ? 'company' : 'none'
    }
    const response = await axios.post('/api/record-sale', payload)
    openModal('success', 'Sale recorded', 'Sale saved successfully. Redirecting to receipt...')
    setTimeout(() => {
      router.push({ name: 'Receipt', params: { id: response.data.sale._id } })
    }, 700)
  } catch (e) {
    message.value = 'Error recording sale.'
    messageType.value = 'danger'
    openModal('danger', 'Recording failed', 'Could not record sale. Please try again.')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = { ...form.value, productId: '', productType: '', unitPrice: 0, quantity: 1, totalCost: 0, customerName: '' }
  message.value = ''
  messageType.value = 'success'
  closeModal()
}
</script>

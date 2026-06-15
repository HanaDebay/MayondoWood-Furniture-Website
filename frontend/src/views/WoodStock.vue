<template>
  <div class="container-fluid p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Wood Stock</h2>
      <button class="btn btn-primary" @click="showAddModal = true">Add Wood Stock</button>
    </div>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Product Name</th>
          <th>Product Type</th>
          <th>Quantity</th>
          <th>Cost Price</th>
          <th>Selling Price</th>
          <th>Supplier</th>
          <th>Date Received</th>
          <th>Quality</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="stock in woodStocks" :key="stock._id">
          <td>{{ stock.productName }}</td>
          <td>{{ stock.productType }}</td>
          <td>{{ stock.quantity }}</td>
          <td>UGX {{ stock.costPrice }}</td>
          <td>UGX {{ stock.sellingPrice }}</td>
          <td>{{ stock.supplierName }}</td>
          <td>{{ formatDate(stock.date) }}</td>
          <td>{{ stock.quality }}</td>
          <td>
            <div class="actions-cell">
              <button type="button" class="icon-action-btn edit" title="Edit stock" aria-label="Edit stock" @click="editStock(stock)">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
              </button>
              <button type="button" class="icon-action-btn delete" title="Delete stock" aria-label="Delete stock" @click="askDeleteStock(stock)">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 15H6L5 6" /><path d="M10 11v6M14 11v6" /></svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingStock ? 'Edit' : 'Add' }} Wood Stock</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <form @submit.prevent="saveStock" novalidate>
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Product Name</label>
                <input v-model="form.productName" type="text" class="form-control" @input="validateField('productName')" @blur="touchField('productName')" />
                <div v-if="formErrors.productName" class="form-text text-danger">{{ formErrors.productName }}</div>
              </div>
              <div class="mb-3">
                <label class="form-label">Product Type</label>
                <select v-model="form.productType" class="form-select" @change="() => { touchField('productType'); validateField('productType') }">
                  <option value="">Select Type</option>
                  <option value="timber">Timber</option>
                  <option value="poles">Poles</option>
                  <option value="softwood">Soft Wood</option>
                  <option value="hardwood">Hard Wood</option>
                </select>
                <div v-if="formErrors.productType" class="form-text text-danger">{{ formErrors.productType }}</div>
              </div>
              <div class="row g-3">
                <div class="col-md-4">
                  <label class="form-label">Cost Price (UGX)</label>
                  <input v-model.number="form.costPrice" type="number" min="0" step="0.01" class="form-control" @input="() => { touchField('costPrice'); validateField('costPrice') }" @blur="touchField('costPrice')" />
                  <div v-if="formErrors.costPrice" class="form-text text-danger">{{ formErrors.costPrice }}</div>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Selling Price (UGX)</label>
                  <input v-model.number="form.sellingPrice" type="number" min="0" step="0.01" class="form-control" @input="() => { touchField('sellingPrice'); validateField('sellingPrice') }" @blur="touchField('sellingPrice')" />
                  <div v-if="formErrors.sellingPrice" class="form-text text-danger">{{ formErrors.sellingPrice }}</div>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Quantity</label>
                  <input v-model.number="form.quantity" type="number" min="0" step="1" class="form-control" @input="() => { touchField('quantity'); validateField('quantity') }" @blur="touchField('quantity')" />
                  <div v-if="formErrors.quantity" class="form-text text-danger">{{ formErrors.quantity }}</div>
                </div>
              </div>

              <div class="mb-3 mt-3">
                <label class="form-label">Supplier Name</label>
                <input v-model="form.supplierName" type="text" class="form-control" placeholder="e.g., Kibaale Timbers Ltd" @input="() => { touchField('supplierName'); validateField('supplierName') }" @blur="touchField('supplierName')" />
                <div v-if="formErrors.supplierName" class="form-text text-danger">{{ formErrors.supplierName }}</div>
              </div>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Date Received</label>
                  <input v-model="form.date" type="date" class="form-control" @change="() => { touchField('date'); validateField('date') }" />
                  <div v-if="formErrors.date" class="form-text text-danger">{{ formErrors.date }}</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Quality Grade</label>
                  <select v-model="form.quality" class="form-select" @change="() => { touchField('quality'); validateField('quality') }">
                    <option value="" disabled>Select quality</option>
                    <option value="A">A (Premium)</option>
                    <option value="B">B (Standard)</option>
                    <option value="C">C (Economy)</option>
                  </select>
                  <div v-if="formErrors.quality" class="form-text text-danger">{{ formErrors.quality }}</div>
                </div>
              </div>

              <div class="mb-3 mt-3">
                <label class="form-label">Color <span class="text-muted">(optional)</span></label>
                <input v-model="form.color" type="text" class="form-control" placeholder="e.g., Natural / Walnut" />
              </div>

              <div class="mb-3">
                <label class="form-label">Measurements <span class="text-muted">(optional)</span></label>
                <input v-model="form.measurements" type="text" class="form-control" placeholder="e.g., 2x4x12 ft / 180x60 cm" />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
              <button type="submit" class="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal d-block" tabindex="-1" role="dialog" aria-modal="true" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Delete Wood Stock</h5>
            <button type="button" class="btn-close" @click="closeDeleteModal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="mb-0">Are you sure you want to delete {{ stockToDelete?.productName || 'this stock item' }}?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="closeDeleteModal">Cancel</button>
            <button type="button" class="btn btn-danger" :disabled="deleting" @click="confirmDeleteStock">
              {{ deleting ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const woodStocks = ref([])
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const editingStock = ref(null)
const stockToDelete = ref(null)
const error = ref('')
const deleting = ref(false)

const today = () => new Date().toISOString().slice(0, 10)

const emptyForm = () => ({
  productName: '',
  productType: '',
  quantity: '',
  costPrice: '',
  sellingPrice: '',
  supplierName: '',
  date: today(),
  quality: '',
  color: '',
  measurements: ''
})

const form = ref(emptyForm())

const formErrors = ref({
  productName: '',
  productType: '',
  costPrice: '',
  sellingPrice: '',
  quantity: '',
  supplierName: '',
  date: '',
  quality: ''
})
const touchedFields = ref({})

const touchField = (field) => {
  touchedFields.value[field] = true
  validateField(field)
}

const validateField = (field) => {
  const value = form.value[field]
  switch (field) {
    case 'productName':
      if (!value || !value.toString().trim()) {
        formErrors.value.productName = 'Product name is required.'
      } else {
        formErrors.value.productName = ''
      }
      break
    case 'productType':
      formErrors.value.productType = value ? '' : 'Product type is required.'
      break
    case 'costPrice':
      if (value === '' || value === null) {
        formErrors.value.costPrice = 'Cost price is required.'
      } else if (Number(value) < 0) {
        formErrors.value.costPrice = 'Cost price cannot be negative.'
      } else {
        formErrors.value.costPrice = ''
      }
      break
    case 'sellingPrice':
      if (value === '' || value === null) {
        formErrors.value.sellingPrice = 'Selling price is required.'
      } else if (Number(value) < 0) {
        formErrors.value.sellingPrice = 'Selling price cannot be negative.'
      } else {
        formErrors.value.sellingPrice = ''
      }
      break
    case 'quantity':
      if (value === '' || value === null) {
        formErrors.value.quantity = 'Quantity is required.'
      } else if (Number(value) < 0) {
        formErrors.value.quantity = 'Quantity cannot be negative.'
      } else {
        formErrors.value.quantity = ''
      }
      break
    case 'supplierName':
      formErrors.value.supplierName = value && value.toString().trim() ? '' : 'Supplier name is required.'
      break
    case 'date':
      if (!value) {
        formErrors.value.date = 'Date received is required.'
      } else {
        const selectedDate = new Date(value)
        if (isNaN(selectedDate.getTime())) {
          formErrors.value.date = 'Select a valid date.'
        } else {
          formErrors.value.date = ''
        }
      }
      break
    case 'quality':
      formErrors.value.quality = value ? '' : 'Quality grade is required.'
      break
    default:
      break
  }
  return !formErrors.value[field]
}

const validateForm = () => {
  Object.keys(formErrors.value).forEach((field) => {
    touchedFields.value[field] = true
    validateField(field)
  })
  return !Object.values(formErrors.value).some((error) => error)
}

const formatDate = (value) => {
  if (!value) return ''
  return new Date(value).toLocaleDateString()
}

const loadWoodStocks = async () => {
  try {
    const { data } = await axios.get('/api/wood-stock')
    woodStocks.value = data.woodStocks || data
  } catch (e) {
    error.value = 'Failed to load wood stocks'
  }
}

const saveStock = async () => {
  if (!validateForm()) {
    error.value = 'Please fix the highlighted fields before saving.'
    return
  }
  try {
    if (editingStock.value) {
      await axios.put(`/api/wood-stock/${editingStock.value._id}`, form.value)
    } else {
      await axios.post('/api/wood-stock', form.value)
    }
    closeModal()
    loadWoodStocks()
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save stock'
  }
}

const editStock = (stock) => {
  editingStock.value = stock
  form.value = {
    ...emptyForm(),
    ...stock,
    date: stock.date ? stock.date.slice(0, 10) : today()
  }
  showAddModal.value = true
}

const askDeleteStock = (stock) => {
  stockToDelete.value = stock
  showDeleteModal.value = true
}

const confirmDeleteStock = async () => {
  if (!stockToDelete.value) return
  deleting.value = true
  try {
    await axios.delete(`/api/wood-stock/${stockToDelete.value._id}`)
    closeDeleteModal()
    loadWoodStocks()
  } catch (e) {
    error.value = 'Failed to delete stock'
  } finally {
    deleting.value = false
  }
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  stockToDelete.value = null
}

const closeModal = () => {
  showAddModal.value = false
  editingStock.value = null
  form.value = emptyForm()
  error.value = ''
  touchedFields.value = {}
  Object.keys(formErrors.value).forEach((field) => {
    formErrors.value[field] = ''
  })
}

onMounted(() => {
  loadWoodStocks()
})
</script>

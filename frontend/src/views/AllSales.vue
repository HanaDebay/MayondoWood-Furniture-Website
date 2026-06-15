<template>
  <div class="container-fluid p-4">
    <h2 class="mb-4">All Sales</h2>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Date</th>
          <th>Product</th>
          <th>Customer</th>
          <th>Agent</th>
          <th>Quantity</th>
          <th>Total</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="sale in sales" :key="sale._id">
          <td>{{ formatDate(sale.dateOfSale) }}</td>
          <td>{{ sale.productName }}</td>
          <td>{{ sale.customerName }}</td>
          <td>{{ sale.salesAgent?.fullName || 'N/A' }}</td>
          <td>{{ sale.quantity }}</td>
          <td>UGX {{ sale.totalCost?.toLocaleString() }}</td>
          <td>
            <div class="actions-cell">
              <button type="button" class="icon-action-btn view" title="View receipt" aria-label="View receipt" @click="viewReceipt(sale)">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10v18H7z" /><path d="M9 7h6M9 11h6M9 15h3" /></svg>
              </button>
              <button type="button" class="icon-action-btn edit" title="Edit sale" aria-label="Edit sale" @click="editSale(sale)">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
              </button>
              <button type="button" class="icon-action-btn delete" title="Delete sale" aria-label="Delete sale" @click="askDeleteSale(sale)">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 15H6L5 6" /><path d="M10 11v6M14 11v6" /></svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Receipt Modal -->
    <div v-if="showReceipt" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Receipt Preview</h5>
            <button type="button" class="btn-close" @click="showReceipt = false"></button>
          </div>
          <div class="modal-body p-4">
            <div class="receipt-card mx-auto shadow-sm">
              <div class="receipt-inner bg-white border p-4">
                <div class="receipt-header text-center mb-4">
                  <img src="/images/mwflogo.png" alt="Logo" class="receipt-logo mb-3" />
                  <h3 class="receipt-title mb-1">MAYONDO WOOD FURNITURE</h3>
                  <p class="text-muted small mb-1">Professional Woodwork & Custom Furniture</p>
                  <p class="text-muted small mb-0">Kampala, Uganda | +256 700 123 456 | sales@mayondowood.com</p>
                </div>

                <div class="row mb-4">
                  <div class="col-6">
                    <h6 class="text-uppercase text-muted small fw-bold mb-2">Billed To:</h6>
                    <h5 class="fw-bold mb-1">{{ receiptData.customerName }}</h5>
                    <p class="small text-muted mb-0">Payment via: {{ receiptData.paymentMethod || 'N/A' }}</p>
                  </div>
                  <div class="col-6 text-end">
                    <p class="mb-1"><span class="text-muted small text-uppercase fw-bold">Receipt ID:</span> <strong>#{{ receiptData._id?.slice(-8).toUpperCase() }}</strong></p>
                    <p class="mb-0"><span class="text-muted small text-uppercase fw-bold">Date:</span> <strong>{{ formatDate(receiptData.dateOfSale) }}</strong></p>
                  </div>
                </div>

                <table class="table table-bordered mb-4">
                  <thead class="bg-light text-uppercase small fw-bold">
                    <tr>
                      <th>Item Description</th>
                      <th class="text-center" width="100">Qty</th>
                      <th class="text-end" width="150">Unit Price</th>
                      <th class="text-end" width="150">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div class="fw-bold">{{ receiptData.productName }}</div>
                        <div class="text-muted small">{{ receiptData.productType?.replace('Stock', '') || 'Product' }}</div>
                      </td>
                      <td class="text-center">{{ receiptData.quantity }}</td>
                      <td class="text-end text-nowrap">UGX {{ receiptData.sellingPrice?.toLocaleString() }}</td>
                      <td class="text-end text-nowrap">UGX {{ (receiptData.sellingPrice * receiptData.quantity)?.toLocaleString() }}</td>
                    </tr>
                    <tr v-if="receiptData.transportation === 'company'">
                      <td colspan="3" class="text-end text-muted small">Transportation Surcharge (5%)</td>
                      <td class="text-end">UGX {{ (receiptData.totalCost - (receiptData.sellingPrice * receiptData.quantity))?.toLocaleString() }}</td>
                    </tr>
                  </tbody>
                  <tfoot class="border-top-0">
                    <tr class="fs-5 fw-bold">
                      <td colspan="3" class="text-end border-0 pt-4">Grand Total</td>
                      <td class="text-end border-0 pt-4 text-primary">UGX {{ receiptData.totalCost?.toLocaleString() }}</td>
                    </tr>
                  </tfoot>
                </table>

                <div class="row mt-4 pt-3 align-items-end">
                  <div class="col-7">
                    <p class="text-muted small fw-bold text-uppercase mb-2">Important Notice:</p>
                    <ul class="text-muted list-unstyled small" style="font-size: 0.85rem; line-height: 1.5;">
                      <li>• Goods once sold are not returnable.</li>
                      <li>• Please retain this receipt for any warranty claims.</li>
                      <li>• Full balance must be cleared before delivery/pickup.</li>
                    </ul>
                  </div>
                  <div class="col-5 text-center">
                    <div class="mx-auto border-bottom border-secondary mb-2" style="width: 200px; height: 40px;"></div>
                    <p class="small text-uppercase mb-0">Authorized Signature</p>
                    <p class="fw-bold small text-primary">{{ receiptData.salesAgent?.fullName || 'Sales Agent' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showEditModal" class="modal d-block" tabindex="-1" role="dialog" aria-modal="true" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit Sale</h5>
            <button type="button" class="btn-close" @click="closeEditModal" aria-label="Close"></button>
          </div>
          <form @submit.prevent="saveSale">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Customer Name</label>
                <input v-model="form.customerName" type="text" class="form-control" required>
              </div>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Quantity</label>
                  <input v-model.number="form.quantity" type="number" min="1" class="form-control" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Selling Price</label>
                  <input v-model.number="form.sellingPrice" type="number" min="0" step="0.01" class="form-control" required>
                </div>
              </div>
              <div class="row g-3 mt-1">
                <div class="col-md-6">
                  <label class="form-label">Payment Method</label>
                  <input v-model="form.paymentMethod" type="text" class="form-control">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Transportation</label>
                  <input v-model="form.transportation" type="text" class="form-control">
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" @click="closeEditModal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">{{ saving ? 'Saving...' : 'Save Changes' }}</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal d-block" tabindex="-1" role="dialog" aria-modal="true" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Delete Sale</h5>
            <button type="button" class="btn-close" @click="closeDeleteModal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="mb-0">Are you sure you want to delete this sale record?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="closeDeleteModal">Cancel</button>
            <button type="button" class="btn btn-danger" :disabled="deleting" @click="confirmDeleteSale">
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

const sales = ref([])
const error = ref('')
const showReceipt = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const receiptData = ref({})
const editingSale = ref(null)
const saleToDelete = ref(null)
const saving = ref(false)
const deleting = ref(false)
const form = ref({
  customerName: '',
  quantity: '',
  sellingPrice: '',
  paymentMethod: '',
  transportation: ''
})

const loadSales = async () => {
  try {
    const { data } = await axios.get('/api/all-sales')
    sales.value = data.sales || data
  } catch (e) {
    error.value = 'Failed to load sales'
  }
}

const viewReceipt = async (sale) => {
  try {
    const { data } = await axios.get(`/api/get-receipt/${sale._id}`)
    receiptData.value = data.receipt
    showReceipt.value = true
  } catch (e) {
    error.value = 'Failed to load receipt'
  }
}

const editSale = (sale) => {
  editingSale.value = sale
  form.value = {
    customerName: sale.customerName || '',
    quantity: sale.quantity || '',
    sellingPrice: sale.sellingPrice || '',
    paymentMethod: sale.paymentMethod || '',
    transportation: sale.transportation || ''
  }
  showEditModal.value = true
}

const saveSale = async () => {
  if (!editingSale.value) return
  saving.value = true
  try {
    await axios.post(`/api/edit-sale/${editingSale.value._id}`, form.value)
    closeEditModal()
    loadSales()
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to update sale'
  } finally {
    saving.value = false
  }
}

const askDeleteSale = (sale) => {
  saleToDelete.value = sale
  showDeleteModal.value = true
}

const confirmDeleteSale = async () => {
  if (!saleToDelete.value) return
  deleting.value = true
  try {
    await axios.delete(`/api/delete-sale/${saleToDelete.value._id}`)
    closeDeleteModal()
    loadSales()
  } catch (e) {
    error.value = 'Failed to delete sale'
  } finally {
    deleting.value = false
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editingSale.value = null
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  saleToDelete.value = null
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

onMounted(() => {
  loadSales()
})
</script>

<style scoped>
.receipt-card {
  max-width: 900px;
  margin: 0 auto;
}

.receipt-inner {
  background-color: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 20px;
  padding: 1.5rem;
}

.receipt-header {
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 1rem;
}

.receipt-logo {
  height: 70px;
  width: auto;
}

.receipt-title {
  font-size: 1.5rem;
}
</style>

<template>
  <div class="container-fluid p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Suppliers</h2>
      <button class="btn btn-primary" @click="showAddModal = true">Add Supplier</button>
    </div>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Supplier Name</th>
          <th>Contact Person</th>
          <th>Phone</th>
          <th>Email</th>
          <th>Address</th>
          <th>Supply Category</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="supplier in suppliers" :key="supplier._id">
          <td>{{ supplier.supplierName }}</td>
          <td>{{ supplier.contactPerson }}</td>
          <td>{{ supplier.phone }}</td>
          <td>{{ supplier.email }}</td>
          <td>{{ supplier.address }}</td>
          <td>{{ supplier.supplyCategory }}</td>
          <td>
            <div class="actions-cell">
              <button type="button" class="icon-action-btn edit" title="Edit supplier" aria-label="Edit supplier" @click="editSupplier(supplier)">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
              </button>
              <button type="button" class="icon-action-btn delete" title="Delete supplier" aria-label="Delete supplier" @click="askDeleteSupplier(supplier)">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 15H6L5 6" /><path d="M10 11v6M14 11v6" /></svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showAddModal" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingSupplier ? 'Edit' : 'Add' }} Supplier</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <form @submit.prevent="saveSupplier">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Supplier Name</label>
                <input v-model="form.supplierName" type="text" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Contact Person</label>
                <input v-model="form.contactPerson" type="text" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Phone</label>
                <input v-model="form.phone" type="tel" class="form-control" placeholder="+256 743 088 570 or 0743 088 570" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input v-model="form.email" type="email" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Address</label>
                <input v-model="form.address" type="text" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Supply Category</label>
                <select v-model="form.supplyCategory" class="form-select" required>
                  <option value="" disabled>Select category</option>
                  <option value="Timber">Timber</option>
                  <option value="Poles">Poles</option>
                  <option value="Hard-Wood">Hard Wood</option>
                  <option value="Soft-Wood">Soft Wood</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Notes <span class="text-muted">(optional)</span></label>
                <textarea v-model="form.notes" class="form-control" rows="3"></textarea>
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
            <h5 class="modal-title">Delete Supplier</h5>
            <button type="button" class="btn-close" @click="closeDeleteModal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="mb-0">Are you sure you want to delete {{ supplierToDelete?.supplierName || 'this supplier' }}?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="closeDeleteModal">Cancel</button>
            <button type="button" class="btn btn-danger" :disabled="deleting" @click="confirmDeleteSupplier">
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

const suppliers = ref([])
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const editingSupplier = ref(null)
const supplierToDelete = ref(null)
const error = ref('')
const deleting = ref(false)

const emptyForm = () => ({
  supplierName: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  supplyCategory: '',
  notes: ''
})

const form = ref(emptyForm())

const loadSuppliers = async () => {
  try {
    const { data } = await axios.get('/api/suppliers')
    suppliers.value = data.suppliers || data
  } catch (e) {
    error.value = 'Failed to load suppliers'
  }
}

const saveSupplier = async () => {
  try {
    if (editingSupplier.value) {
      await axios.put(`/api/suppliers/${editingSupplier.value._id}`, form.value)
    } else {
      await axios.post('/api/suppliers', form.value)
    }
    closeModal()
    loadSuppliers()
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to save supplier'
  }
}

const editSupplier = (supplier) => {
  editingSupplier.value = supplier
  form.value = { ...supplier }
  showAddModal.value = true
}

const askDeleteSupplier = (supplier) => {
  supplierToDelete.value = supplier
  showDeleteModal.value = true
}

const confirmDeleteSupplier = async () => {
  if (!supplierToDelete.value) return
  deleting.value = true
  try {
    await axios.delete(`/api/suppliers/${supplierToDelete.value._id}`)
    closeDeleteModal()
    loadSuppliers()
  } catch (e) {
    error.value = 'Failed to delete supplier'
  } finally {
    deleting.value = false
  }
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  supplierToDelete.value = null
}

const closeModal = () => {
  showAddModal.value = false
  editingSupplier.value = null
  form.value = emptyForm()
}

onMounted(() => {
  loadSuppliers()
})
</script>

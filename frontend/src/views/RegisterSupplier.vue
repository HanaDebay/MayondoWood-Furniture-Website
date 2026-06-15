<template>
  <div class="p-4 bg-light min-vh-100">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card shadow-lg rounded-4">
            <div class="card-header bg-success text-white text-center py-3 rounded-top-4">
              <h3 class="mb-0">Register Supplier</h3>
            </div>
            <div class="card-body p-4">
              <div v-if="message" :class="`alert alert-${messageType}`">{{ message }}</div>
              <form @submit.prevent="handleSubmit" novalidate>
                <div class="mb-3">
                  <label class="form-label" for="supplierName">Supplier Name <span class="text-danger">*</span></label>
                  <input v-model="form.supplierName" type="text" class="form-control" id="supplierName" placeholder="e.g., Kibaale Timbers Ltd" @input="validateField('supplierName')" @blur="touchField('supplierName')" />
                  <div v-if="formErrors.supplierName" class="form-text text-danger">{{ formErrors.supplierName }}</div>
                </div>

                <div class="mb-3">
                  <label class="form-label" for="contactPerson">Contact Person <span class="text-danger">*</span></label>
                  <input v-model="form.contactPerson" type="text" class="form-control" id="contactPerson" placeholder="e.g., John Doe" @input="validateField('contactPerson')" @blur="touchField('contactPerson')" />
                  <div v-if="formErrors.contactPerson" class="form-text text-danger">{{ formErrors.contactPerson }}</div>
                </div>

                <div class="mb-3">
                  <label class="form-label" for="email">Email <span class="text-danger">*</span></label>
                  <input v-model="form.email" type="email" class="form-control" id="email" placeholder="supplier@email.com" @input="validateField('email')" @blur="touchField('email')" />
                  <div v-if="formErrors.email" class="form-text text-danger">{{ formErrors.email }}</div>
                </div>

                <div class="mb-3">
                  <label class="form-label" for="phone">Phone <span class="text-danger">*</span></label>
                  <input v-model="form.phone" type="tel" class="form-control" id="phone" placeholder="+256 743 088 570 or 0743 088 570" @input="validateField('phone')" @blur="touchField('phone')" />
                  <div v-if="formErrors.phone" class="form-text text-danger">{{ formErrors.phone }}</div>
                </div>

                <div class="mb-3">
                  <label class="form-label" for="address">Address <span class="text-danger">*</span></label>
                  <input v-model="form.address" type="text" class="form-control" id="address" placeholder="e.g., Industrial Area, Kampala" @input="validateField('address')" @blur="touchField('address')" />
                  <div v-if="formErrors.address" class="form-text text-danger">{{ formErrors.address }}</div>
                </div>

                <div class="mb-3">
                  <label class="form-label" for="supplyCategory">Supply Category <span class="text-danger">*</span></label>
                  <select v-model="form.supplyCategory" class="form-select" id="supplyCategory" @change="validateField('supplyCategory'); touchField('supplyCategory')">
                    <option value="" disabled>Select category</option>
                    <option value="Timber">Timber</option>
                    <option value="Poles">Poles</option>
                    <option value="Hard-Wood">Hard Wood</option>
                    <option value="Soft-Wood">Soft Wood</option>
                  </select>
                  <div v-if="formErrors.supplyCategory" class="form-text text-danger">{{ formErrors.supplyCategory }}</div>
                </div>

                <div class="mb-3">
                  <label class="form-label" for="notes">Notes <span class="text-muted">(optional)</span></label>
                  <textarea v-model="form.notes" class="form-control" id="notes" rows="3" placeholder="Additional details about the supplier..."></textarea>
                </div>

                <div class="d-flex justify-content-between mt-4">
                  <button type="submit" class="btn btn-success px-4" :disabled="loading">
                    {{ loading ? 'Saving...' : 'Save Supplier' }}
                  </button>
                  <button type="reset" class="btn btn-outline-secondary" @click="resetForm">Clear</button>
                </div>

                <p class="text-muted mt-2">Ensure supplier details are accurate before saving.</p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <!-- Feedback Modal -->
      <div
        v-if="showModal"
        class="modal fade show d-block"
        tabindex="-1"
        aria-labelledby="feedbackModalLabel"
        aria-modal="true"
        role="dialog"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div :class="['modal-header', modalType === 'success' ? 'bg-success text-white' : 'bg-danger text-white']">
              <h5 class="modal-title" id="feedbackModalLabel">{{ modalTitle }}</h5>
              <button type="button" class="btn-close btn-close-white" @click="closeModal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p>{{ modalMessage }}</p>
            </div>
            <div class="modal-footer">
              <button type="button" :class="['btn', modalType === 'success' ? 'btn-success' : 'btn-danger']" @click="closeModal">Close</button>
            </div>
          </div>
        </div>
      </div>
      <!-- Modal Backdrop -->
      <div v-if="showModal" class="modal-backdrop fade show"></div>
    </Teleport>
  </div>
</template>

<script setup>
import { onUnmounted, ref, watch } from 'vue'
import axios from 'axios'

// Modal state
const showModal = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')
const modalType = ref('success') // 'success' or 'danger'

const form = ref({
  supplierName: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  supplyCategory: '',
  notes: ''
})

const formErrors = ref({
  supplierName: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  supplyCategory: ''
})
const touchedFields = ref({})

const loading = ref(false)
const message = ref('')
const messageType = ref('success')
const SUCCESS_MODAL_DURATION = 7000
let feedbackTimer = null

// Watch for changes in showModal to manage body overflow
watch(showModal, (newValue) => {
  if (newValue) {
    document.body.classList.add('modal-open')
  } else {
    document.body.classList.remove('modal-open')
  }
})

onUnmounted(() => {
  clearTimeout(feedbackTimer)
  document.body.classList.remove('modal-open')
})

const showFeedback = (title, text, type = 'success') => {
  clearTimeout(feedbackTimer)
  modalTitle.value = title
  modalMessage.value = text
  modalType.value = type
  showModal.value = true

  if (type === 'success') {
    feedbackTimer = setTimeout(() => {
      closeModal()
    }, SUCCESS_MODAL_DURATION)
  }
}

const validateField = (field) => {
  const value = form.value[field]?.toString().trim() || ''
  switch (field) {
    case 'supplierName':
      if (!value) return (formErrors.value.supplierName = 'Supplier name is required.')
      if (value.length < 3) return (formErrors.value.supplierName = 'Supplier name must be at least 3 characters.')
      formErrors.value.supplierName = ''
      break
    case 'contactPerson':
      if (!value) return (formErrors.value.contactPerson = 'Contact person is required.')
      if (!/^[A-Za-z ]+$/.test(value)) return (formErrors.value.contactPerson = 'Contact person can only contain letters and spaces.')
      formErrors.value.contactPerson = ''
      break
    case 'email':
      if (!value) return (formErrors.value.email = 'Email is required.')
      if (!/^\S+@\S+\.\S+$/.test(value)) return (formErrors.value.email = 'Enter a valid email address.')
      formErrors.value.email = ''
      break
    case 'phone':
      if (!value) return (formErrors.value.phone = 'Phone number is required.')
      if (!/^(?:\+256|0)(?:\s?\d){9}$/.test(value)) return (formErrors.value.phone = 'Enter a valid Uganda phone number.')
      formErrors.value.phone = ''
      break
    case 'address':
      if (!value) return (formErrors.value.address = 'Address is required.')
      if (value.length < 5) return (formErrors.value.address = 'Address must be at least 5 characters.')
      formErrors.value.address = ''
      break
    case 'supplyCategory':
      if (!value) return (formErrors.value.supplyCategory = 'Supply category is required.')
      formErrors.value.supplyCategory = ''
      break
    default:
      break
  }
}

const touchField = (field) => {
  touchedFields.value[field] = true
  validateField(field)
}

const validateForm = () => {
  Object.keys(formErrors.value).forEach((field) => {
    validateField(field)
  })
  return !Object.values(formErrors.value).some((error) => error)
}

const handleSubmit = async () => {
  message.value = ''
  if (!validateForm()) {
    message.value = 'Please fix the highlighted fields before saving.'
    messageType.value = 'danger'
    showFeedback('Validation error', 'Please correct the highlighted fields and try again.', 'danger')
    return
  }

  loading.value = true
  try {
    const response = await axios.post('/api/suppliers', form.value)
    showFeedback('Success!', response.data?.message || 'Supplier registered successfully!')
    resetForm()
  } catch (e) {
    console.error("Supplier registration error:", e)
    const errorMessage = e.response?.data?.error || e.message || 'An unexpected error occurred while saving the supplier.'
    showFeedback('Error!', errorMessage, 'danger')
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = {
    supplierName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    supplyCategory: '',
    notes: ''
  }
}

const closeModal = () => {
  clearTimeout(feedbackTimer)
  showModal.value = false
  message.value = '' // Clear any inline message if it was used
}
</script>

<style scoped>
@import '../assets/css/signup.css';

/*Consistency with theme colors*/
.min-vh-100 {
  min-height: 100vh;
}
.card-header.bg-success {
  background-color: #73d47bff !important; 
}
.btn-success {
  background-color: #73d47bff !important;
  border-color: #73d47bff !important;
  border-radius: 30px;
}
.btn-success:hover {
  background-color: #5cb85c !important;
  border-color: #5cb85c !important;
}
</style>

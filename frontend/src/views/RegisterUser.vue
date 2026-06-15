<template>
  <div class="p-4 bg-light min-vh-100">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card shadow-lg rounded-4">
            <div class="card-header bg-success text-white text-center py-3 rounded-top-4">
              <h3 class="mb-0">Register Staff</h3>
            </div>
            <div class="card-body p-4">
              <div v-if="message" :class="`alert alert-${messageType}`">{{ message }}</div>
              <form @submit.prevent="handleSubmit" novalidate>
                <div class="mb-3">
                  <label class="form-label" for="fullName">Full Name <span class="text-danger">*</span></label>
                  <input v-model="form.fullName" type="text" class="form-control" id="fullName" placeholder="e.g., John Doe" @input="validateField('fullName')" @blur="touchField('fullName')" />
                  <div v-if="formErrors.fullName" class="form-text text-danger">{{ formErrors.fullName }}</div>
                </div>

                <div class="mb-3">
                  <label class="form-label" for="email">Email <span class="text-danger">*</span></label>
                  <input v-model="form.email" type="email" class="form-control" id="email" placeholder="user@mwfuganda.com" @input="validateField('email')" @blur="touchField('email')" />
                  <div v-if="formErrors.email" class="form-text text-danger">{{ formErrors.email }}</div>
                </div>

                <div class="mb-3">
                  <label class="form-label" for="phone">Phone <span class="text-danger">*</span></label>
                  <input v-model="form.phone" type="tel" class="form-control" id="phone" placeholder="+256 743 088 570 or 0743 088 570" @input="validateField('phone')" @blur="touchField('phone')" />
                  <div v-if="formErrors.phone" class="form-text text-danger">{{ formErrors.phone }}</div>
                </div>

                <div class="mb-3">
                  <label class="form-label" for="username">Username <span class="text-danger">*</span></label>
                  <input v-model="form.username" type="text" class="form-control" id="username" @input="validateField('username')" @blur="touchField('username')" />
                  <div v-if="formErrors.username" class="form-text text-danger">{{ formErrors.username }}</div>
                </div>

                <div class="mb-3">
                  <label class="form-label" for="role">Role <span class="text-danger">*</span></label>
                  <select v-model="form.role" class="form-select" id="role" @change="validateField('role'); touchField('role')">
                    <option value="" disabled>-- Select Role --</option>
                    <option value="Manager">Manager</option>
                    <option value="Sales-Agent">Sales Agent</option>
                  </select>
                  <div v-if="formErrors.role" class="form-text text-danger">{{ formErrors.role }}</div>
                </div>

                <div class="row g-3">
                  <div class="col-md-6 mb-3">
                    <label class="form-label" for="password">Password <span class="text-danger">*</span></label>
                    <input v-model="form.password" type="password" class="form-control" id="password" @input="validateField('password')" @blur="touchField('password')" />
                    <div v-if="formErrors.password" class="form-text text-danger">{{ formErrors.password }}</div>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label" for="confirmPassword">Confirm Password <span class="text-danger">*</span></label>
                    <input v-model="form.confirmPassword" type="password" class="form-control" id="confirmPassword" @input="validateField('confirmPassword')" @blur="touchField('confirmPassword')" />
                    <div v-if="formErrors.confirmPassword" class="form-text text-danger">{{ formErrors.confirmPassword }}</div>
                  </div>
                </div>

                <div class="d-flex justify-content-between mt-4">
                  <button type="submit" class="btn btn-success px-4" :disabled="loading">
                    {{ loading ? 'Registering...' : 'Create Account' }}
                  </button>
                  <button type="reset" class="btn btn-outline-secondary" @click="resetForm">Clear</button>
                </div>

                <p class="text-muted mt-2">By submitting, you agree that all provided information is accurate.</p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showSuccessModal"
        class="modal fade show d-block"
        tabindex="-1"
        aria-labelledby="successModalLabel"
        aria-modal="true"
        role="dialog"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-success text-white">
              <h5 class="modal-title" id="successModalLabel">Success!</h5>
              <button type="button" class="btn-close btn-close-white" @click="closeSuccessModal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p>{{ successMessage }}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-success" @click="closeSuccessModal">Close</button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="showSuccessModal" class="modal-backdrop fade show"></div>
    </Teleport>
  </div>
</template>

<script setup>
import { onUnmounted, ref, watch } from 'vue'
import axios from 'axios'

const form = ref({
  fullName: '',
  email: '',
  phone: '',
  username: '',
  role: '',
  password: '',
  confirmPassword: ''
})

const formErrors = ref({
  fullName: '',
  email: '',
  phone: '',
  username: '',
  role: '',
  password: '',
  confirmPassword: ''
})
const touchedFields = ref({})

const loading = ref(false)
const message = ref('')
const messageType = ref('success')
const showSuccessModal = ref(false)
const successMessage = ref('')
const SUCCESS_MODAL_DURATION = 2 * 60 * 1000
let successModalTimer = null

watch(showSuccessModal, (isOpen) => {
  if (isOpen) {
    document.body.classList.add('modal-open')
  } else {
    document.body.classList.remove('modal-open')
  }
})

onUnmounted(() => {
  clearTimeout(successModalTimer)
  document.body.classList.remove('modal-open')
})

const showSuccessFeedback = (text) => {
  clearTimeout(successModalTimer)
  successMessage.value = text
  showSuccessModal.value = true

  successModalTimer = setTimeout(() => {
    closeSuccessModal()
  }, SUCCESS_MODAL_DURATION)
}

const closeSuccessModal = () => {
  clearTimeout(successModalTimer)
  showSuccessModal.value = false
}

const validateField = (field) => {
  const value = form.value[field]?.toString().trim() || ''
  switch (field) {
    case 'fullName':
      if (!value) return (formErrors.value.fullName = 'Full name is required.')
      if (value.length < 3) return (formErrors.value.fullName = 'Full name must be at least 3 characters.')
      if (value.length > 60) return (formErrors.value.fullName = 'Full name cannot exceed 60 characters.')
      if (!/^[A-Za-z ]+$/.test(value)) return (formErrors.value.fullName = 'Full name can only contain letters and spaces.')
      formErrors.value.fullName = ''
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
    case 'username':
      if (!value) return (formErrors.value.username = 'Username is required.')
      if (value.length < 3) return (formErrors.value.username = 'Username must be at least 3 characters.')
      if (value.length > 24) return (formErrors.value.username = 'Username cannot exceed 24 characters.')
      formErrors.value.username = ''
      break
    case 'role':
      if (!value) return (formErrors.value.role = 'Role is required.')
      formErrors.value.role = ''
      break
    case 'password':
      if (!value) return (formErrors.value.password = 'Password is required.')
      if (value.length < 6) return (formErrors.value.password = 'Password must be at least 6 characters.')
      formErrors.value.password = ''
      if (form.value.confirmPassword) validateField('confirmPassword')
      break
    case 'confirmPassword':
      if (!value) return (formErrors.value.confirmPassword = 'Please confirm the password.')
      if (value !== form.value.password) return (formErrors.value.confirmPassword = 'Passwords do not match.')
      formErrors.value.confirmPassword = ''
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
    message.value = 'Please fix the highlighted fields before submitting.'
    messageType.value = 'danger'
    return
  }

  loading.value = true
  try {
    const response = await axios.post('/api/register-user', form.value)
    showSuccessFeedback(response.data.message || 'User registered successfully!')
    resetForm(false)
  } catch (e) {
    console.error("Registration error:", e)
    if (e.response && e.response.data && e.response.data.error) {
      message.value = e.response.data.error
    } else {
      message.value = 'An unexpected error occurred during registration.'
    }
    messageType.value = 'danger'
  } finally {
    loading.value = false
  }
}

const resetForm = (clearMessage = true) => {
  form.value = {
    fullName: '',
    email: '',
    phone: '',
    username: '',
    role: '',
    password: '',
    confirmPassword: ''
  }
  touchedFields.value = {}
  Object.keys(formErrors.value).forEach((field) => {
    formErrors.value[field] = ''
  })
  if (clearMessage) {
    message.value = ''
  }
}
</script>

<style scoped>
@import '../assets/css/signup.css';

/* Additional styles for consistency with dashboard layout */
.min-vh-100 {
  min-height: 100vh;
}
.card-header.bg-success {
  background-color: #73d47bff !important; /* Use your theme's green */
}
.btn-success {
  background-color: #73d47bff !important;
  border-color: #73d47bff !important;
}
.btn-success:hover {
  background-color: #5cb85c !important; /* Darker shade on hover */
  border-color: #5cb85c !important;
}
</style>

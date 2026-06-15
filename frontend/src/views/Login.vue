<template>
  <div class="login-container">
    <div class="login-card">
      <h2>MWF Staff Login</h2>
      <p>Please enter your credentials to continue.</p>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <form @submit.prevent="handleLogin" novalidate>
        <div class="mb-3">
          <label class="form-label" for="email">Email or Username</label>
          <input v-model="form.email" @input="validateField('email')" :class="{'is-invalid': fieldErrors.email}" type="text" class="form-control" id="email" placeholder="Enter Your Email or Username" />
          <p v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</p>
        </div>
        <div class="mb-3">
          <label class="form-label">Password</label>
          <input v-model="form.password" @input="validateField('password')" :class="{'is-invalid': fieldErrors.password}" type="password" class="form-control" id="password" placeholder="Enter Your Password" />
          <p v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</p>
        </div>
        <div class="mb-4">
          <button type="submit" class="btn-login" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </div>
      </form>

      <p class="forgot-password">
        <span class="highlight">No account and forgot password?</span> Contact your manager.
      </p>
      <div class="links">
        <router-link to="/">← Back to Home</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth' // Assuming you have an auth store

onMounted(() => {
  // Add the 'login-page' class to the body when this component is mounted
  document.body.classList.add('login-page')
})

onUnmounted(() => {
  // Remove the 'login-page' class from the body when this component is unmounted
  document.body.classList.remove('login-page')
})

const router = useRouter()
const authStore = useAuthStore()
const error = ref('')
const loading = ref(false)
const form = ref({ email: '', password: '' })
const fieldErrors = ref({ email: '', password: '' })

const validateEmail = (email) => {
  if (!email) return 'Email or username is required.'
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const usernamePattern = /^[A-Za-z0-9._-]{3,}$/
  if (!emailPattern.test(email) && !usernamePattern.test(email)) return 'Enter a valid email address or username.'
  return ''
}

const validatePassword = (password) => {
  if (!password) return 'Password is required.'
  if (password.length < 3) return 'Password must be at least 6 characters.'
  return ''
}

const validateField = (field) => {
  if (field === 'email') {
    fieldErrors.value.email = validateEmail(form.value.email)
  } else if (field === 'password') {
    fieldErrors.value.password = validatePassword(form.value.password)
  }
}

const validateAll = () => {
  fieldErrors.value.email = validateEmail(form.value.email)
  fieldErrors.value.password = validatePassword(form.value.password)
  return !fieldErrors.value.email && !fieldErrors.value.password
}

const handleLogin = async () => {
  error.value = ''
  if (!form.value.email || !form.value.password) {
    validateAll()
    error.value = 'Please enter both email or username and password.'
    return
  }
  if (!validateAll()) {
    error.value = 'Please fix the errors below.'
    return
  }
  loading.value = true
  try {
    const data = await authStore.login(form.value.email, form.value.password)

    if (data.user.role === "Manager") {
      router.push('/manager/manager-dashboard')
    } else if (data.user.role === "Sales-Agent") {
      router.push('/sales/sales-agent-dashboard')
    } else {
      router.push('/')
    }
  } catch (e) {
    console.error("Login error:", e)
    if (e.response && e.response.data && e.response.data.message) {
      error.value = e.response.data.message
    } else if (e.response && e.response.data && e.response.data.error) {
      error.value = e.response.data.error
    } else {
      error.value = 'An unexpected error occurred during login.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import '../assets/css/login.css'; /* Keep component-specific styles here */

.forgot-password {
  color: #c00;
  font-weight: 700;
}

.field-error {
  margin-top: 0.4rem;
  font-size: 0.875rem;
  color: #c00;
}

.form-control.is-invalid {
  border-color: #c00;
  box-shadow: 0 0 0 1px rgba(255, 0, 0, 0.15);
}
</style>

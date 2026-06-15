<template>
  <div class="container-fluid p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="mb-0">User Management</h2>
      <router-link to="/manager/register-user" class="btn btn-primary">
        Add User
      </router-link>
    </div>

    <div v-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-if="message" class="alert alert-success">{{ message }}</div>

    <table class="table table-striped">
      <thead>
        <tr>
          <th>Username</th>
          <th>Full Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Role</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user._id">
          <td>{{ user.username }}</td>
          <td>{{ user.fullName }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.phone }}</td>
          <td>{{ user.role }}</td>
          <td>{{ user.status }}</td>
          <td>
            <div class="actions-cell">
              <button type="button" class="icon-action-btn edit" title="Edit user" aria-label="Edit user" @click="editUser(user)">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
              </button>
              <button type="button" class="icon-action-btn delete" title="Delete user" aria-label="Delete user" @click="askDeleteUser(user)">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 15H6L5 6" /><path d="M10 11v6M14 11v6" /></svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showEditModal" class="modal d-block" tabindex="-1" role="dialog" aria-modal="true" style="background: rgba(0,0,0,0.5)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Edit User</h5>
            <button type="button" class="btn-close" @click="closeEditModal" aria-label="Close"></button>
          </div>
          <form @submit.prevent="saveUser">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">Full Name</label>
                <input v-model="form.fullName" type="text" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input v-model="form.email" type="email" class="form-control" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Phone</label>
                <input v-model="form.phone" type="tel" class="form-control" placeholder="+256 743 088 570 or 0743 088 570" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Username</label>
                <input v-model="form.username" type="text" class="form-control" required>
              </div>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Role</label>
                  <select v-model="form.role" class="form-select" required>
                    <option value="Manager">Manager</option>
                    <option value="Sales-Agent">Sales Agent</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Status</label>
                  <select v-model="form.status" class="form-select" required>
                    <option value="Active">Active</option>
                    <option value="Left">Left</option>
                  </select>
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
            <h5 class="modal-title">Delete User</h5>
            <button type="button" class="btn-close" @click="closeDeleteModal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="mb-0">Are you sure you want to delete {{ userToDelete?.fullName || 'this user' }}?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="closeDeleteModal">Cancel</button>
            <button type="button" class="btn btn-danger" :disabled="deleting" @click="confirmDeleteUser">
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

const users = ref([])
const error = ref('')
const message = ref('')
const saving = ref(false)
const deleting = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingUser = ref(null)
const userToDelete = ref(null)

const emptyForm = () => ({
  fullName: '',
  email: '',
  phone: '',
  username: '',
  role: 'Sales-Agent',
  status: 'Active'
})

const form = ref(emptyForm())

const loadUsers = async () => {
  try {
    const { data } = await axios.get('/api/view-user')
    users.value = data.users || data
  } catch (e) {
    error.value = 'Failed to load users'
  }
}

const editUser = (user) => {
  error.value = ''
  message.value = ''
  editingUser.value = user
  form.value = {
    ...emptyForm(),
    fullName: user.fullName || '',
    email: user.email || '',
    phone: user.phone || '',
    username: user.username || '',
    role: user.role || 'Sales-Agent',
    status: user.status || 'Active'
  }
  showEditModal.value = true
}

const saveUser = async () => {
  if (!editingUser.value) return
  saving.value = true
  error.value = ''
  message.value = ''
  try {
    await axios.post(`/api/edit-user/${editingUser.value._id}`, form.value)
    message.value = 'User updated successfully.'
    closeEditModal()
    loadUsers()
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to update user'
  } finally {
    saving.value = false
  }
}

const askDeleteUser = (user) => {
  error.value = ''
  message.value = ''
  userToDelete.value = user
  showDeleteModal.value = true
}

const confirmDeleteUser = async () => {
  if (!userToDelete.value) return
  deleting.value = true
  error.value = ''
  message.value = ''
  try {
    await axios.delete(`/api/delete-user/${userToDelete.value._id}`)
    message.value = 'User deleted successfully.'
    closeDeleteModal()
    loadUsers()
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to delete user'
  } finally {
    deleting.value = false
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editingUser.value = null
  form.value = emptyForm()
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  userToDelete.value = null
}

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div class="app-shell d-flex" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <nav class="sidebar text-white p-3 shadow">
      <div class="sidebar-header mb-4 text-center border-bottom pb-3">
        <button
          type="button"
          class="sidebar-toggle icon-action-btn text-white"
          :aria-label="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          @click="sidebarCollapsed = !sidebarCollapsed"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <img src="/images/mwflogo.png" alt="logo" class="profile-img mb-2 sidebar-logo">
        <h6 class="sidebar-title text-uppercase fw-bold">Mayondo Wood</h6>
      </div>

      <div class="sidebar-links">
        <router-link to="/manager/manager-dashboard" class="nav-link" title="Dashboard">
          <span class="sidebar-icon icon-dashboard"><svg viewBox="0 0 24 24"><path d="M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-8" /></svg></span>
          <span class="nav-text">Dashboard</span>
        </router-link>
        <router-link to="/manager/suppliers" class="nav-link" title="Suppliers"> 
          <span class="sidebar-icon icon-suppliers"><svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-6h6v6" /></svg></span>
          <span class="nav-text">Suppliers</span>
        </router-link>
        <router-link to="/manager/furniture-stock" class="nav-link" title="Furniture Stock"> 
          <span class="sidebar-icon icon-furniture"><svg viewBox="0 0 24 24"><path d="M5 12V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4M4 12h16v7H4zM7 19v2M17 19v2" /></svg></span>
          <span class="nav-text">Furniture Stock</span>
        </router-link>
        <router-link to="/manager/wood-stock" class="nav-link" title="Wood Stock"> 
          <span class="sidebar-icon icon-wood"><svg viewBox="0 0 24 24"><path d="M4 17 17 4M7 20 20 7M6 14l4 4M14 6l4 4M3 21h18" /></svg></span>
          <span class="nav-text">Wood Stock</span>
        </router-link>
        <router-link to="/manager/all-sales" class="nav-link" title="Sales Report"> 
          <span class="sidebar-icon icon-sales"><svg viewBox="0 0 24 24"><path d="M7 3h10v18H7zM9 7h6M9 11h6M9 15h3" /></svg></span>
          <span class="nav-text">Sales Report</span>
        </router-link>
        <router-link to="/manager/users" class="nav-link" title="User Management"> 
          <span class="sidebar-icon icon-users"><svg viewBox="0 0 24 24"><path d="M16 19a4 4 0 0 0-8 0M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM20 20v-2M20 14v-2M18 16h-2M24 16h-2" /></svg></span>
          <span class="nav-text">User Management</span>
        </router-link>

        <hr class="bg-white">
        <router-link to="/manager/manager-dashboard" class="nav-link" title="Home"> 
          <span class="sidebar-icon icon-home"><svg viewBox="0 0 24 24"><path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-7h6v7" /></svg></span>
          <span class="nav-text">Home</span>
        </router-link>
        <a href="#" @click.prevent="handleLogout" class="nav-link text-danger mt-3" title="Logout">
          <span class="sidebar-icon"><svg viewBox="0 0 24 24"><path d="M14 8V5a2 2 0 0 0-2-2H5v18h7a2 2 0 0 0 2-2v-3M9 12h12M17 8l4 4-4 4" /></svg></span>
          <span class="nav-text">Logout</span>
        </a>
      </div>
    </nav>

    <div class="main-content flex-grow-1">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const sidebarCollapsed = ref(false)

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

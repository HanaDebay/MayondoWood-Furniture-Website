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
        <h6 class="sidebar-title text-uppercase fw-bold">MWF Sales</h6>
      </div>

      <div class="sidebar-links">
        <router-link to="/sales/sales-agent-dashboard" class="nav-link" title="Dashboard">
          <span class="sidebar-icon icon-dashboard"><svg viewBox="0 0 24 24"><path d="M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-8" /></svg></span>
          <span class="nav-text">Dashboard</span>
        </router-link>
        <router-link to="/sales/record-sale" class="nav-link" title="Record Sale">
          <span class="sidebar-icon icon-record"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg></span>
          <span class="nav-text">Record Sale</span>
        </router-link>
        <router-link to="/sales/my-sales" class="nav-link" title="My Sales">
          <span class="sidebar-icon icon-sales"><svg viewBox="0 0 24 24"><path d="M7 3h10v18H7zM9 7h6M9 11h6M9 15h3" /></svg></span>
          <span class="nav-text">My Sales</span>
        </router-link>
        <router-link to="/sales/view-stock" class="nav-link" title="Check Stock">
          <span class="sidebar-icon icon-furniture"><svg viewBox="0 0 24 24"><path d="M5 12V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4M4 12h16v7H4zM7 19v2M17 19v2" /></svg></span>
          <span class="nav-text">Check Stock</span>
        </router-link>

        <hr class="bg-white">
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

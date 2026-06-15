import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import ManagerLayout from '../views/ManagerLayout.vue'
import SalesAgentLayout from '../views/SalesAgentLayout.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  // Manager Routes wrapped in Layout
  {
    path: '/manager',
    component: ManagerLayout,
    redirect: '/manager/manager-dashboard',
    meta: { requiresAuth: true, role: 'Manager' },
    children: [ // These routes will render inside ManagerLayout's <router-view>
      {
        path: 'manager-dashboard',
        name: 'ManagerDashboard',
        component: () => import('../views/ManagerDashboard.vue')
      },
      {
        path: 'wood-stock',
        name: 'WoodStock',
        component: () => import('../views/WoodStock.vue')
      },
      {
        path: 'register-user', // Added for manager to register staff
        name: 'RegisterUser',
        component: () => import('../views/RegisterUser.vue') // Assuming you'll create this component
      },
      {
        path: 'furniture-stock',
        name: 'FurnitureStock',
        component: () => import('../views/FurnitureStock.vue')
      },
      {
        path: 'suppliers',
        name: 'Suppliers',
        component: () => import('../views/Suppliers.vue')
      },
      {
        path: 'all-sales',
        name: 'AllSales',
        component: () => import('../views/AllSales.vue')
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/Users.vue')
      },
      {
        path: 'register-supplier', // Added for manager to register suppliers
        name: 'RegisterSupplier',
        component: () => import('../views/RegisterSupplier.vue') // Assuming you'll create this component
      }
    ]
  },
  // Sales Agent Routes wrapped in Layout
  {
    path: '/sales',
    component: SalesAgentLayout,
    redirect: '/sales/sales-agent-dashboard',
    meta: { requiresAuth: true, role: 'Sales-Agent' },
    children: [ // These routes will render inside SalesAgentLayout's <router-view>
      {
        path: 'sales-agent-dashboard',
        name: 'SalesAgentDashboard',
        component: () => import('../views/SalesAgentDashboard.vue')
      },
      {
        path: 'record-sale',
        name: 'RecordSale',
        component: () => import('../views/RecordSale.vue')
      },
      {
        path: 'my-sales',
        name: 'MySales',
        component: () => import('../views/MySales.vue')
      },
      {
        path: 'view-stock',
        name: 'ViewStock',
        component: () => import('../views/ViewStock.vue')
      },
      {
        path: 'receipt/:id',
        name: 'Receipt',
        component: () => import('../views/Receipt.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  if (!authStore.initialized) {
    await authStore.checkAuth()
  }
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }

  // Redirect authenticated users from login/home or old dashboard paths to their correct prefixed dashboard
  if (authStore.isAuthenticated) {
    if (to.path === '/login' || to.path === '/' || to.path === '/manager-dashboard' || to.path === '/sales-agent-dashboard') {
      if (authStore.role === 'Manager') {
        return next('/manager/manager-dashboard');
      } else if (authStore.role === 'Sales-Agent' || authStore.role === 'SalesAgent') {
        return next('/sales/sales-agent-dashboard');
      }
      return next('/'); // Fallback for other roles or if role is not set
    }
  }
  
  // Find the required role from the matched route records
  const requiredRoleRaw = to.matched.find(record => record.meta.role)?.meta.role;
  
  // Normalize roles (remove hyphens) for reliable comparison
  const userRole = authStore.role?.replace(/-/g, '');
  const requiredRole = requiredRoleRaw?.replace(/-/g, '');

  console.log(`Navigating to: ${to.path} | User Role: ${userRole} | Required: ${requiredRole}`);

  if (requiredRole && userRole !== requiredRole) {
    console.warn("Role mismatch. Redirecting to appropriate dashboard.");
    if (userRole === 'Manager') {
      return next('/manager/manager-dashboard')
    } else if (userRole === 'SalesAgent') {
      return next('/sales/sales-agent-dashboard')
    }
  }
  
  next()
})

export default router
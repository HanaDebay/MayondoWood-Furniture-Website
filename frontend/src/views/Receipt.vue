<template>
  <div class="receipt-page p-4">
    <!-- Actions Bar (Hidden on Print) -->
    <div class="d-print-none mb-4 d-flex justify-content-between align-items-center bg-white p-3 rounded shadow-sm border">
      <div>
        <router-link to="/sales/sales-agent-dashboard" class="btn btn-sm btn-outline-secondary me-2">
          &larr; Dashboard
        </router-link>
        <span class="text-muted">Sale recorded successfully!</span>
      </div>
      <button class="btn btn-primary px-4" type="button" @click="printReceipt">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2" style="width:18px; height:18px;">
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
        Print Receipt
      </button>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2">Generating receipt...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <!-- Professional Receipt -->
    <div v-else class="receipt-card mx-auto shadow-sm" id="printable-area">
      <div class="receipt-inner bg-white border p-5">
        <!-- Header -->
        <div class="receipt-header text-center mb-3">
          <img src="/images/mwflogo.png" alt="Logo" class="receipt-logo mb-2">
          <h1 class="receipt-title mb-1">MAYONDO WOOD FURNITURE</h1>
          <p class="text-muted small mb-1" style="line-height: 1.2;">Professional Woodwork & Custom Furniture</p>
          <p class="text-muted small mb-0" style="line-height: 1.2;">Kampala, Uganda | +256 700 123 456 | sales@mayondowood.com</p>
        </div>

        <div class="row mb-3">
          <div class="col-6">
            <h6 class="text-uppercase text-muted small fw-bold mb-1">Billed To:</h6>
            <h5 class="fw-bold mb-1" style="font-size: 1rem;">{{ receipt.customerName }}</h5>
            <p class="small text-muted mb-0">Payment via: {{ receipt.paymentMethod }}</p>
          </div>
          <div class="col-6 text-end">
            <p class="mb-1"><span class="text-muted small text-uppercase fw-bold">Receipt ID:</span> <strong>#{{ receipt._id.slice(-8).toUpperCase() }}</strong></p>
            <p class="mb-0"><span class="text-muted small text-uppercase fw-bold">Date:</span> <strong>{{ formatDate(receipt.dateOfSale) }}</strong></p>
          </div>
        </div>

        <!-- Table -->
        <table class="table table-bordered mb-3" style="margin-bottom: 0.5rem; font-size: 0.9rem;">
          <thead class="bg-light text-uppercase small fw-bold">
            <tr>
              <th>Item Description</th>
              <th class="text-center" width="80">Qty</th>
              <th class="text-end" width="120">Unit Price</th>
              <th class="text-end" width="120">Total</th>
            </tr>
          </thead>
          <tbody class="align-middle">
            <tr>
              <td>
                <div class="fw-bold">{{ receipt.productName }}</div>
                <div class="text-muted small">{{ receipt.productType.replace('Stock', '') }} Product</div>
              </td>
              <td class="text-center">{{ receipt.quantity }}</td>
              <td class="text-end text-nowrap">{{ formatCurrency(receipt.sellingPrice) }}</td>
              <td class="text-end text-nowrap">{{ formatCurrency(receipt.sellingPrice * receipt.quantity) }}</td>
            </tr>
            <tr v-if="receipt.transportation === 'company'">
              <td colspan="3" class="text-end text-muted small">Transportation Surcharge (5%)</td>
              <td class="text-end">{{ formatCurrency(receipt.totalCost - (receipt.sellingPrice * receipt.quantity)) }}</td>
            </tr>
          </tbody>
          <tfoot class="border-top-0">
            <tr class="fw-bold" style="font-size: 1rem;">
              <td colspan="3" class="text-end border-0 pt-2">Grand Total</td>
              <td class="text-end border-0 pt-2 text-primary">{{ formatCurrency(receipt.totalCost) }}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Footer -->
        <div class="row mt-3 pt-2 align-items-end" style="font-size: 0.85rem;">
          <div class="col-7">
            <p class="text-muted small fw-bold text-uppercase mb-1" style="margin-bottom: 0.25rem !important;">Important Notice:</p>
            <ul class="text-muted list-unstyled small" style="font-size: 0.7rem; line-height: 1.3; padding-left: 0; margin-bottom: 0;">
              <li>• Goods once sold are not returnable.</li>
              <li>• Please retain this receipt for warranty claims.</li>
              <li>• Full balance must be cleared before delivery.</li>
            </ul>
          </div>
          <div class="col-5 text-center">
            <div class="mx-auto border-bottom border-secondary mb-1" style="width: 150px; height: 25px;"></div>
            <p class="small text-uppercase mb-0" style="font-size: 0.7rem;">Authorized Signature</p>
            <p class="fw-bold small text-primary" style="font-size: 0.8rem;">{{ receipt.salesAgent?.fullName || 'Sales Agent' }}</p>
          </div>
        </div>

        <div class="text-center mt-2 text-muted small border-top pt-2 fst-italic" style="font-size: 0.8rem; padding-top: 0.5rem !important;">
          Thank you for your business! We build for your comfort.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const loading = ref(true)
const error = ref('')
const receipt = ref(null)

const fetchReceipt = async () => {
  try {
    const { data } = await axios.get(`/api/get-receipt/${route.params.id}`)
    receipt.value = data.receipt
  } catch (err) {
    error.value = 'Could not load receipt data.'
  } finally {
    loading.value = false
  }
}

const printReceipt = () => {
  if (typeof window !== 'undefined') {
    window.print()
  }
}

const formatCurrency = (value) => `${Number(value || 0).toLocaleString()} UGX`
const formatDate = (date) => new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })

onMounted(fetchReceipt)
</script>

<style scoped>
.receipt-page {
  background-color: #f0f2f5;
  min-height: 100vh;
}

.receipt-card {
  max-width: 900px;
  margin: 0 auto;
}

.receipt-inner {
  font-family: 'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  background-color: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 20px;
  padding: 2rem;
}

.receipt-header {
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}

.receipt-logo {
  height: 60px;
  width: auto;
}

.receipt-title {
  font-size: 1.8rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-weight: 700;
  margin-bottom: 0.25rem !important;
}

.company-details {
  line-height: 1.75;
}

@media print {
  /* Hide all non-printable elements */
  .d-print-none,
  :deep(.sidebar),
  :deep(.sidebar-toggle),
  :deep(.sidebar-header),
  :deep(.sidebar-links),
  :deep(.nav-link),
  :deep(.app-shell .sidebar),
  :deep(nav) {
    display: none !important;
    visibility: hidden !important;
  }

  /* Show and style the printable area */
  * {
    box-shadow: none !important;
  }

  html, body {
    width: 100%;
    height: auto;
    margin: 0;
    padding: 0;
    background: white !important;
  }

  .receipt-page {
    width: 100%;
    height: auto;
    padding: 0.3in !important;
    background: white !important;
    margin: 0 !important;
  }

  .receipt-card {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
  }

  .receipt-inner {
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    padding: 0.3in !important;
    page-break-after: auto;
  }

  /* Ensure main content is full width when printing */
  :deep(.main-content) {
    margin-left: 0 !important;
    width: 100% !important;
  }

  :deep(.app-shell) {
    display: block !important;
  }

  /* Hide Bootstrap print utilities that might interfere */
  .btn,
  button:not(.d-print-inline-block) {
    display: none !important;
  }

  /* Print-friendly table styling with compact spacing */
  .table {
    page-break-inside: avoid;
    margin-bottom: 0 !important;
  }

  .table thead {
    display: table-header-group;
  }

  .table tr {
    page-break-inside: avoid;
  }

  .table th,
  .table td {
    padding: 0.25rem 0.5rem !important;
    font-size: 0.9rem;
  }

  /* Reduce margins throughout */
  h1, h2, h3, h4, h5, h6, p {
    margin-bottom: 0.1rem !important;
    page-break-inside: avoid;
  }

  /* Remove bottom margins for compact layout */
  .mb-1 { margin-bottom: 0.1rem !important; }
  .mb-2 { margin-bottom: 0.2rem !important; }
  .mb-3 { margin-bottom: 0.3rem !important; }
  .mb-4 { margin-bottom: 0.4rem !important; }
  .mb-5 { margin-bottom: 0.4rem !important; }

  .mt-1 { margin-top: 0.1rem !important; }
  .mt-2 { margin-top: 0.2rem !important; }
  .mt-3 { margin-top: 0.3rem !important; }
  .mt-4 { margin-top: 0.3rem !important; }
  .mt-5 { margin-top: 0.4rem !important; }

  .pt-2 { padding-top: 0.2rem !important; }
  .pt-3 { padding-top: 0.2rem !important; }
  .pt-4 { padding-top: 0.2rem !important; }

  .pb-2 { padding-bottom: 0.2rem !important; }
  .pb-3 { padding-bottom: 0.2rem !important; }
  .pb-4 { padding-bottom: 0.2rem !important; }
}
</style>
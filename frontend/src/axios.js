import axios from 'axios'

// This ensures that cookies (sessions) are sent to the backend
axios.defaults.withCredentials = true;

const apiBaseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : '')

axios.defaults.baseURL = apiBaseUrl

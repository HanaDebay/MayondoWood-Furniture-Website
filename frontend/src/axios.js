import axios from 'axios'

// This ensures that cookies (sessions) are sent to the backend
axios.defaults.withCredentials = true;

const apiBaseUrl = import.meta.env.DEV ? 'http://localhost:3000' : '/api'

axios.defaults.baseURL = apiBaseUrl

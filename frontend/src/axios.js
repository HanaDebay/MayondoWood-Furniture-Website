import axios from 'axios'

// This ensures that cookies (sessions) are sent to the backend
axios.defaults.withCredentials = true;
axios.defaults.baseURL = ''; // Handled by Vite proxy in development

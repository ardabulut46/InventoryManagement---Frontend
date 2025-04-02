// API URL configuration
const isProd = window.location.hostname !== 'localhost';

export const API_BASE_URL = isProd 
  ? 'https://hysistemi-ehdghjdubmb7gudg.northeurope-01.azurewebsites.net'
  : 'http://localhost:5192';
  
export const API_URL = API_BASE_URL;
// Add other configuration constants here if needed 
//import.meta.env.VITE_API_URL || 
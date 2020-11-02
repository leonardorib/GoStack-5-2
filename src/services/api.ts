import axios from 'axios';

// Running on android emulator => Change localhost to 10.0.2.2
const api = axios.create({
  baseURL: 'http://localhost:3333',
});

export default api;

import axios from 'axios';

const configured = axios.create({
  baseURL: 'http://localhost:8000/api', // Replace with your base URL
});

export default configured;
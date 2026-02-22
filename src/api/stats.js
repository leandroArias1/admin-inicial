import api from './axios';
export const getStats = () => api.get('/stats');

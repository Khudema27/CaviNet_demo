// frontend/src/services/patientService.js
import api from '../utils/axiosConfig';

const getAll = async () => {
  const res = await api.get('/api/patients');
  return res.data;
};

const getById = async (id) => {
  const res = await api.get(`/api/patients/${id}`);
  return res.data;
};

const create = async (payload) => {
  const res = await api.post('/api/patients', payload);
  return res.data;
};

const update = async (id, payload) => {
  const res = await api.put(`/api/patients/${id}`, payload);
  return res.data;
};

export default {
  getAll,
  getById,
  create,
  update,
};

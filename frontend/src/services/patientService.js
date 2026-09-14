import api from '../utils/axiosConfig';

const getAll = async () => {
  const response = await api.get('/api/patients');
  return response.data;
};

const getById = async (id) => {
  const response = await api.get(`/api/patients/${id}`);
  return response.data;
};

const create = async (payload) => {
  const response = await api.post(
    '/api/patients',
    payload
  );

  return response.data;
};

const update = async (id, payload) => {
  const response = await api.put(
    `/api/patients/${id}`,
    payload
  );

  return response.data;
};

const getScans = async (patientId) => {
  const response = await api.get(
    `/api/patients/${patientId}/scans`
  );

  return response.data;
};

export default {
  getAll,
  getById,
  create,
  update,
  getScans,
};
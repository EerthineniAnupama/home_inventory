import api from './api';

export async function getAllItems() {
  const { data } = await api.get('/inventory');
  return data;
}

export async function getItemById(id) {
  const { data } = await api.get(`/inventory/${id}`);
  return data;
}

export async function createItem(payload) {
  const { data } = await api.post('/inventory', payload);
  return data;
}

export async function updateItem(id, payload) {
  const { data } = await api.put(`/inventory/${id}`, payload);
  return data;
}

export async function deleteItem(id) {
  const { data } = await api.delete(`/inventory/${id}`);
  return data;
}
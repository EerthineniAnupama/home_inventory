import api from './api';

// ASSUMPTION - confirm with the Media teammate:
// - request field name is "image"
// - response contains the URL under one of: url / imageUrl / secure_url
// If their controller uses different names, only this function needs to change.
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const { data } = await api.post('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data.url || data.imageUrl || data.secure_url || null;
}
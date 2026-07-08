import api from './api';

// ASSUMPTION - confirm with the Media teammate:
// - request field name is "image"
// - response contains the URL under one of: url / imageUrl / secure_url
// If their controller uses different names, only this function needs to change.
export async function uploadImage(file, itemId) {
  if (!itemId) {
    throw new Error('uploadImage requires itemId');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('item_id', itemId);

  const { data } = await api.post('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  const media = data.media || data;
  return media.url || media.imageUrl || media.secure_url || null;
}
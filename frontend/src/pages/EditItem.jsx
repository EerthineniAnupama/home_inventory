import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ItemForm from '../components/ItemForm.jsx';
import * as inventoryService from '../services/inventoryService.js';
import * as mediaService from '../services/mediaService.js';
import Loader from '../components/Loader.jsx';

// Backend stores dates as full ISO strings; <input type="date"> needs "yyyy-MM-dd"
function toDateInputValue(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toISOString().split('T')[0];
}

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    inventoryService
      .getItemById(id)
      .then(setItem)
      .catch(() => setError('Could not load this item.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(payload, imageFile) {
    if (imageFile) {
      const imageUrl = await mediaService.uploadImage(imageFile, id);
      payload.imageUrl = imageUrl;
    }

    await inventoryService.updateItem(id, payload);
    navigate(`/inventory/${id}`);
  }

  if (loading) return <Loader label="Loading item…" />;
  if (error) return <div className="text-sm text-status-danger">{error}</div>;

  return (
    <div>
      <h1 className="text-xl font-display font-bold text-zinc-900 mb-6">Edit item</h1>
      <ItemForm
        initialValues={{
          itemName: item.itemName || '',
          category: item.category || '',
          description: item.description || '',
          purchaseDate: toDateInputValue(item.purchaseDate),
          purchasePrice: item.purchasePrice ?? '',
          warrantyExpiry: toDateInputValue(item.warrantyExpiry),
          serialNumber: item.serialNumber || '',
        }}
        existingImageUrl={item.imageUrl}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
      />
    </div>
  );
}
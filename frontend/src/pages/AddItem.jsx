import { useNavigate } from 'react-router-dom';
import ItemForm from '../components/ItemForm.jsx';
import * as inventoryService from '../services/inventoryService.js';
import * as mediaService from '../services/mediaService.js';

export default function AddItem() {
  const navigate = useNavigate();

  async function handleSubmit(payload, imageFile) {
    const item = await inventoryService.createItem(payload);

    if (imageFile) {
      const itemId = item._id || item.id;
      const imageUrl = await mediaService.uploadImage(imageFile, itemId);
      await inventoryService.updateItem(itemId, { imageUrl });
    }

    navigate('/inventory');
  }

  return (
    <div>
      <h1 className="text-xl font-display font-bold text-zinc-900 mb-6">Add item</h1>
      <ItemForm onSubmit={handleSubmit} submitLabel="Add item" />
    </div>
  );
}
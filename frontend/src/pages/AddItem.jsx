import { useNavigate } from 'react-router-dom';
import ItemForm from '../components/ItemForm.jsx';
import * as inventoryService from '../services/inventoryService.js';

export default function AddItem() {
  const navigate = useNavigate();

  async function handleSubmit(payload) {
    await inventoryService.createItem(payload);
    navigate('/inventory');
  }

  return (
    <div>
      <h1 className="text-xl font-display font-bold text-zinc-900 mb-6">Add item</h1>
      <ItemForm onSubmit={handleSubmit} submitLabel="Add item" />
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    quantity: '',
    imageUrl: ''
  });
  const [isEdit, setIsEdit] = useState(false);
  const [editItemId, setEditItemId] = useState(null);

  // Fetch all items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  // Fetch items from the server
  const fetchItems = async () => {
    try {
      const response = await api.get('/api/inventory/all');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  // Add or update item
  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        // Update item
        await api.put(`/api/inventory/update`, { ...form, id: editItemId });
        setIsEdit(false);
        setEditItemId(null);
      } else {
        // Add new item
        await api.post('/api/inventory/add', form);
      }
      setForm({
        name: '',
        category: '',
        price: '',
        stock: '',
        quantity: '',
        imageUrl: ''
      });
      fetchItems(); // Refresh the list after adding/updating an item
    } catch (error) {
      console.error('Error adding/updating item:', error);
    }
  };

  // Delete item
  const handleDeleteItem = async (id) => {
    try {
      await api.delete(`/api/inventory/delete/${id}`);
      fetchItems(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // Handle edit button click
  const handleEditItem = (item) => {
    setForm({
      name: item.name || '',
      category: item.category || '',
      price: item.price || '',
      stock: item.stock || '',
      quantity: item.quantity || '',
      imageUrl: item.imageUrl || ''
    });
    setIsEdit(true);
    setEditItemId(item.id);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>

      {/* Item Form */}
      <form className="mb-6" onSubmit={handleAddItem}>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Item Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Category</label>
          <input
            type="text"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Price</label>
          <input
            type="number"
            value={form.price || ''}
            onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Stock</label>
          <input
            type="number"
            value={form.stock || ''}
            onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Quantity</label>
          <input
            type="number"
            value={form.quantity || ''}
            onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Image URL</label>
          <input
            type="text"
            value={form.imageUrl || ''}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          />
        </div>

        <button
          type="submit"
          className={`bg-${isEdit ? 'yellow' : 'blue'}-500 hover:bg-${isEdit ? 'yellow' : 'blue'}-700 text-white font-bold py-2 px-4 rounded`}
        >
          {isEdit ? 'Update Item' : 'Add Item'}
        </button>
      </form>

      {/* Item List */}
      <table className="table-auto w-full mb-6">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2">Image</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Stock</th>
            <th className="px-4 py-2">Quantity</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="border px-4 py-2">
                <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover" />
              </td>
              <td className="border px-4 py-2">{item.name}</td>
              <td className="border px-4 py-2">{item.category}</td>
              <td className="border px-4 py-2">{item.price}</td>
              <td className="border px-4 py-2">{item.stock}</td>
              <td className="border px-4 py-2">{item.quantity}</td>
              <td className="border px-4 py-2">
                <button
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                  onClick={() => handleEditItem(item)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Inventory;

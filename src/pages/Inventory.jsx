import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get('/api/inventory/all');
      setItems(response.data);
      toast.success('Items fetched successfully!');
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to fetch items.');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await api.put(`/api/inventory/update`, { ...form, id: editItemId });
        toast.success('Item updated successfully!');
        setIsEdit(false);
        setEditItemId(null);
      } else {
        await api.post('/api/inventory/add', form);
        toast.success('Item added successfully!');
      }
      setForm({
        name: '',
        category: '',
        price: '',
        stock: '',
        quantity: '',
        imageUrl: ''
      });
      fetchItems();
    } catch (error) {
      console.error('Error adding/updating item:', error);
      toast.error('Failed to add/update item.');
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await api.delete(`/api/inventory/delete/${id}`);
      toast.success('Item deleted successfully!');
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item.');
    }
  };

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
    <div className="container mx-auto p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Inventory Management</h1>

      <form className="mb-6 shadow-lg p-4 sm:p-6 bg-white rounded-lg" onSubmit={handleAddItem}>
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">{isEdit ? 'Edit Item' : 'Add Item'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">Item Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Category</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Price</label>
            <input
              type="number"
              value={form.price || ''}
              onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Stock</label>
            <input
              type="number"
              value={form.stock || ''}
              onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Quantity</label>
            <input
              type="number"
              value={form.quantity || ''}
              onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Image URL</label>
            <input
              type="text"
              value={form.imageUrl || ''}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            />
          </div>
        </div>
        <button
          type="submit"
          className={`mt-4 bg-${isEdit ? 'yellow' : 'blue'}-500 hover:bg-${isEdit ? 'yellow' : 'blue'}-700 text-white font-bold py-2 px-4 rounded w-full sm:w-auto`}
        >
          {isEdit ? 'Update Item' : 'Add Item'}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="table-auto w-full mb-6 shadow-lg bg-white rounded-lg">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-2 py-2 sm:px-4">Image</th>
              <th className="px-2 py-2 sm:px-4">Name</th>
              <th className="px-2 py-2 sm:px-4">Category</th>
              <th className="px-2 py-2 sm:px-4">Price</th>
              <th className="px-2 py-2 sm:px-4">Stock</th>
              <th className="px-2 py-2 sm:px-4">Quantity</th>
              <th className="px-2 py-2 sm:px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="border px-2 py-2 sm:px-4">
                  <img src={item.imageUrl} alt={item.name} className="w-12 h-12 sm:w-20 sm:h-20 object-cover" />
                </td>
                <td className="border px-2 py-2 sm:px-4">{item.name}</td>
                <td className="border px-2 py-2 sm:px-4">{item.category}</td>
                <td className="border px-2 py-2 sm:px-4">{item.price}</td>
                <td className="border px-2 py-2 sm:px-4">{item.stock}</td>
                <td className="border px-2 py-2 sm:px-4">{item.quantity}</td>
                <td className="border px-2 py-2 sm:px-4">
                  <button
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2 mb-2 sm:mb-0"
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

      <ToastContainer />
    </div>
  );
};

export default Inventory;
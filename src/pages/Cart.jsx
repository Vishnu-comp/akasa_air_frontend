import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CartItem = ({ item, onRemove, onUpdateQuantity }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-200">
    <div className="flex items-center">
      <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-full object-cover mr-3" />
      <div>
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-sm text-gray-500">{item.description || 'No description'}</p>
        <div className="flex items-center mt-2">
          <button
            onClick={() => onUpdateQuantity(item.itemId, Math.max(1, item.quantity - 1))}
            className="bg-gray-200 px-2 py-1 rounded-l"
          >
            -
          </button>
          <span className="mx-2">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.itemId, item.quantity + 1)}
            className="bg-gray-200 px-2 py-1 rounded-r"
          >
            +
          </button>
        </div>
      </div>
    </div>
    <div className="text-right">
      <div className="text-orange-500 font-semibold">Rs{(item.price * item.quantity).toFixed(2)}</div>
      <button
        onClick={() => onRemove(item.itemId)}
        className="text-red-500 hover:text-red-700 mt-2"
      >
        Remove
      </button>
    </div>
  </div>
);

const Cart = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserEmail(decodedToken.sub);
      } catch (error) {
        console.error('Error decoding token:', error);
        toast.error('Authentication error. Please log in again.');
        setLoading(false);
      }
    } else {
      toast.error('User is not authenticated. Please log in.');
      setLoading(false);
    }
  }, [token]);

  const handleRedirect = () => {
    navigate('/');
  };

  const fetchCart = useCallback(async () => {
    if (!userEmail) return;

    try {
      const response = await api.get(`/api/cart/user/${userEmail}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCart(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to fetch cart. Please try again.');
      setLoading(false);
    }
  }, [userEmail, token]);

  useEffect(() => {
    if (userEmail) {
      fetchCart();
    }
  }, [userEmail, fetchCart]);

  const removeFromCart = async (itemId) => {
    try {
      await api.delete(`/api/cart/remove/${userEmail}/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchCart();
      toast.success('Item removed from cart.');
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast.error('Failed to remove item from cart.');
    }
  };

  const updateQuantity = (itemId, newQuantity) => {
    // Optimistically update the local state first
    const updatedItems = cart.items.map((item) =>
      item.itemId === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCart({ items: updatedItems });
    toast.info(`Updated quantity for item with ID ${itemId}.`);
  };

  const checkout = async () => {
    try {
      for (let item of cart.items) {
        try {
          await api.get(`/api/inventory/check-stock/${item.itemId}/${item.quantity}`);
        } catch (error) {
          if (error.response && error.response.status === 400) {
            toast.error(`Item ${item.name} exceeds available stock. ${error.response.data}`);
            return;
          }
        }
      }

      const itemIds = cart.items.map((item) => item.itemId);
      const totalAmount = cart.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      await api.post(
        '/api/order/checkout',
        {
          userEmail,
          itemIds,
          totalAmount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      for (let item of cart.items) {
        await api.put(`/api/inventory/update-stock`, {
          itemId: item.itemId,
          quantityPurchased: item.quantity,
        });
      }

      setCart({ items: [] });
      toast.success('Order placed successfully! Your cart is now empty.');
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error('Checkout failed. Please try again.');
    }
  };

  if (loading) {
    return <p className="text-center p-4">Loading...</p>;
  }

  const subtotal = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
  const shippingCost = cart.items.length > 0 ? 9 : 0;
  const total = subtotal + shippingCost;

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="bg-white p-4 flex items-center justify-between">
        <button className="text-gray-600" onClick={handleRedirect}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold">Food Card Cart</h1>
        <ShoppingBag size={24} className="text-orange-500" />
      </div>

      <div className="p-4">
        {cart.items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xl font-semibold text-gray-600">Your cart is empty</p>
            <p className="text-gray-500 mt-2">Add some items to your cart and they will appear here.</p>
          </div>
        ) : (
          <>
            {cart.items.map((item) => (
              <CartItem 
                key={item.itemId}
                item={item}
                onRemove={removeFromCart}
                onUpdateQuantity={updateQuantity}
              />
            ))}

            <div className="mt-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">Rs{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Shipping Cost</span>
                <span className="font-semibold">Rs{shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Cost</span>
                <span>Rs{total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              className="w-full bg-orange-500 text-white font-semibold py-3 rounded-lg mt-6"
              onClick={checkout}
            >
              Checkout
            </button>
          </>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default Cart;




// import React, { useState, useEffect, useCallback } from 'react';
// import api from '../services/api';
// import { jwtDecode } from 'jwt-decode';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// function Cart() {
//     const [cart, setCart] = useState({ items: [] });
//     const [loading, setLoading] = useState(true);
//     const token = localStorage.getItem('token');
//     const [userEmail, setUserEmail] = useState('');

//     useEffect(() => {
//         if (token) {
//             try {
//                 const decodedToken = jwtDecode(token);
//                 setUserEmail(decodedToken.sub);
//             } catch (error) {
//                 console.error('Error decoding token:', error);
//                 toast.error('Authentication error. Please log in again.');
//                 setLoading(false);
//             }
//         } else {
//             toast.error('User is not authenticated. Please log in.');
//             setLoading(false);
//         }
//     }, [token]);

//     const fetchCart = useCallback(async () => {
//         if (!userEmail) return;

//         try {
//             const response = await api.get(`/api/cart/user/${userEmail}`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });
//             setCart(response.data);
//             setLoading(false);
//         } catch (error) {
//             console.error('Error fetching cart:', error);
//             toast.error('Failed to fetch cart. Please try again.');
//             setLoading(false);
//         }
//     }, [userEmail, token]);

//     useEffect(() => {
//         if (userEmail) {
//             fetchCart();
//         }
//     }, [userEmail, fetchCart]);

//     const removeFromCart = async (itemId) => {
//         try {
//             await api.delete(`/api/cart/remove/${userEmail}/${itemId}`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });
//             fetchCart();
//             toast.success('Item removed from cart.');
//         } catch (error) {
//             console.error('Error removing item from cart:', error);
//             toast.error('Failed to remove item from cart.');
//         }
//     };

//     const updateQuantity = async (itemId, newQuantity) => {
//         const updatedItems = cart.items.map((item) =>
//             item.itemId === itemId ? { ...item, quantity: newQuantity } : item
//         );
//         setCart({ items: updatedItems });
//         toast.info(`Updated quantity for ${itemId}.`);
//     };

//     const checkout = async () => {
//         try {
//             for (let item of cart.items) {
//                 try {
//                     console.log(`Checking stock for Item ID: ${item.itemId}, Quantity: ${item.quantity}`);
//                     await api.get(`/api/inventory/check-stock/${item.itemId}/${item.quantity}`);
//                 } catch (error) {
//                     if (error.response && error.response.status === 400) {
//                         toast.error(`Item ${item.name} exceeds available stock. ${error.response.data}`);
//                         return;
//                     }
//                 }
//             }

//             const itemIds = cart.items.map((item) => item.itemId);
//             const totalAmount = cart.items.reduce(
//                 (total, item) => total + item.price * item.quantity,
//                 0
//             );

//             await api.post(
//                 '/api/order/checkout',
//                 {
//                     userEmail,
//                     itemIds,
//                     totalAmount,
//                 },
//                 {
//                     headers: {
//                         Authorization: `Bearer ${token}`,
//                     },
//                 }
//             );

//             toast.success('Order placed successfully!');

//             for (let item of cart.items) {
//                 await api.put(`/api/inventory/update-stock`, {
//                     itemId: item.itemId,
//                     quantityPurchased: item.quantity,
//                 });
//             }

//             setCart({ items: [] });
//             toast.success('Cart cleared after checkout.');
//         } catch (error) {
//             console.error('Error during checkout:', error);
//             toast.error('Checkout failed. Please try again.');
//         }
//     };

//     if (loading) {
//         return <p className="text-center p-4">Loading...</p>;
//     }

//     return (
//         <div className="min-h-screen bg-orange-100 flex items-center justify-center px-4 py-8">
//             <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
//                 <h1 className="text-2xl sm:text-3xl font-bold p-4 sm:p-6 bg-orange-500 text-white text-center">Your Cart</h1>
//                 <div className="p-4 sm:p-6">
//                     {cart.items.length === 0 ? (
//                         <p className="text-center text-gray-500">Your cart is empty.</p>
//                     ) : (
//                         <>
//                             <div className="space-y-4">
//                                 {cart.items.map((item) => (
//                                     <div key={item.itemId} className="flex flex-col sm:flex-row justify-between items-center border-b pb-4">
//                                         <div className="flex items-center mb-4 sm:mb-0 w-full sm:w-auto">
//                                             <img
//                                                 src={item.imageUrl}
//                                                 alt={item.name}
//                                                 className="w-20 h-20 object-cover rounded-md mr-4"
//                                             />
//                                             <div>
//                                                 <h2 className="text-lg font-semibold">{item.name}</h2>
//                                                 <div className="flex items-center mt-2">
//                                                     <button
//                                                         onClick={() => updateQuantity(item.itemId, Math.max(1, item.quantity - 1))}
//                                                         className="bg-gray-200 px-2 py-1 rounded-l"
//                                                     >
//                                                         -
//                                                     </button>
//                                                     <span className="mx-2">{item.quantity}</span>
//                                                     <button
//                                                         onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
//                                                         className="bg-gray-200 px-2 py-1 rounded-r"
//                                                     >
//                                                         +
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                         <div className="flex items-center justify-between w-full sm:w-auto mt-4 sm:mt-0">
//                                             <p className="text-lg sm:text-xl font-bold">Rs{(item.price * item.quantity).toFixed(2)}</p>
//                                             <button
//                                                 onClick={() => removeFromCart(item.itemId)}
//                                                 className="text-red-500 hover:text-red-700 ml-4"
//                                             >
//                                                 Remove
//                                             </button>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>

//                             <div className="bg-gray-100 p-4 rounded-lg mt-6">
//                                 <div className="flex justify-between mb-2">
//                                     <span className="text-gray-600">Sub Total</span>
//                                     <span className="font-bold">
//                                         Rs{cart.items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
//                                     </span>
//                                 </div>
//                                 <div className="flex justify-between font-semibold">
//                                     <span>Total</span>
//                                     <span className="text-xl font-bold">
//                                         Rs{(cart.items.reduce((total, item) => total + item.price * item.quantity, 0) + 9).toFixed(2)}
//                                     </span>
//                                 </div>
//                             </div>

//                             <button
//                                 onClick={checkout}
//                                 className="w-full bg-orange-500 text-white font-semibold py-3 rounded-lg mt-6 hover:bg-orange-600 transition duration-300"
//                             >
//                                 Check Out
//                             </button>
//                         </>
//                     )}
//                 </div>
//             </div>
//             <ToastContainer />
//         </div>
//     );
// }

// export default Cart;
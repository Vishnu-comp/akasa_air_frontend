// import React, { useState, useEffect } from 'react';
// import api from '../services/api';
// import {jwtDecode} from 'jwt-decode';

// function Cart() {
//   const [cart, setCart] = useState({ items: [] });
//   const [error, setError] = useState(null);
//   const token = localStorage.getItem('token');
//   let userEmail = '';

//   if (token) {
//     try {
//       const decodedToken = jwtDecode(token);
//       userEmail = decodedToken.sub;
//     } catch (error) {
//       console.error('Error decoding token:', error);
//     }
//   }

//   useEffect(() => {
//     if (userEmail) {
//       fetchCart();
//     } else {
//       setError('User is not authenticated. Please log in.');
//     }
//   }, [userEmail]);

//   const fetchCart = async () => {
//     try {
//       const response = await api.get(`/api/cart/user/${userEmail}`, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       setCart(response.data);
//     } catch (error) {
//       console.error('Error fetching cart:', error);
//       setError('Failed to fetch cart. Please try again.');
//     }
//   };

//   const removeFromCart = async (itemId) => {
//     try {
//       await api.delete(`/api/cart/remove/${userEmail}/${itemId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       fetchCart();
//     } catch (error) {
//       console.error('Error removing item from cart:', error);
//       setError('Failed to remove item from cart.');
//     }
//   };

//   const checkout = async () => {
//     try {
//       await api.post('/api/order/checkout', { items: cart.items }, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       alert('Order placed successfully!');
//       setCart({ items: [] });
//     } catch (error) {
//       console.error('Error during checkout:', error);
//       setError('Checkout failed. Please try again.');
//     }
//   };

//   return (
//     <div>
//       <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
//       {error && <p className="text-red-500">{error}</p>}
//       {cart.items.length === 0 ? (
//         <p>Your cart is empty.</p>
//       ) : (
//         <>
//           <div className="bg-white p-6 rounded-lg shadow-md">
//             {cart.items.map((item) => (
//               <div key={item.id} className="flex justify-between items-center mb-4">
//                 <div>
//                   <h2 className="text-xl font-semibold">{item.name}</h2>
//                   <p className="text-gray-600">Quantity: {item.quantity}</p>
//                 </div>
//                 <div>
//                   <p className="text-lg font-bold">${(item.price * item.quantity).toFixed(2)}</p>
//                   <button
//                     onClick={() => removeFromCart(item.itemId)}
//                     className="text-red-500 hover:text-red-700"
//                   >
//                     Remove
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//           <div className="mt-6 text-right">
//             <p className="text-xl font-bold mb-4">
//               Total: ${cart.items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
//             </p>
//             <button
//               onClick={checkout}
//               className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
//             >
//               Checkout
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// export default Cart;


import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

function Cart() {
  const [cart, setCart] = useState({ items: [] });
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');
  let userEmail = '';

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userEmail = decodedToken.sub;
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  useEffect(() => {
    if (userEmail) {
      fetchCart();
    } else {
      setError('User is not authenticated. Please log in.');
    }
  }, [userEmail]);

  const fetchCart = async () => {
    try {
      const response = await api.get(`/api/cart/user/${userEmail}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to fetch cart. Please try again.');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await api.delete(`/api/cart/remove/${userEmail}/${itemId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchCart(); // Refresh cart after item is removed
    } catch (error) {
      console.error('Error removing item from cart:', error);
      setError('Failed to remove item from cart.');
    }
  };

  const checkout = async () => {
    try {
      const token = localStorage.getItem('token');
      const decodedToken = jwtDecode(token); // Get userEmail from the token
      const userEmail = decodedToken.sub;

      // Create an array of itemIds from the cart items
      const itemIds = cart.items.map(item => item.itemId); // Assuming item.itemId is correct
      const totalAmount = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

      // Send the request to the backend without manually setting orderDate and status
      const response = await api.post('/api/order/checkout', {
        userEmail,       // Add userEmail to the request body
        itemIds,         // Send itemIds to the backend
        totalAmount      // Calculate and send totalAmount
      }, {
        headers: {
          Authorization: `Bearer ${token}`,  // Ensure token is sent for authentication
        },
      });

      console.log('Order placed:', response.data); // Check if the response contains the correct data
      alert('Order placed successfully!');
      setCart({ items: [] }); // Clear the cart after successful order placement
    } catch (error) {
      console.error('Error during checkout:', error);
      setError('Checkout failed. Please try again.');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      {error && <p className="text-red-500">{error}</p>}
      {cart.items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="bg-white p-6 rounded-lg shadow-md">
            {cart.items.map((item) => (
              <div key={item.itemId} className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  {/* Add Image here */}
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="w-24 h-24 object-cover mr-4" 
                  />
                  <div>
                    <h2 className="text-xl font-semibold">{item.name}</h2>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                </div>
                <div>
                  <p className="text-lg font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => removeFromCart(item.itemId)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-right">
            <p className="text-xl font-bold mb-4">
              Total: ${cart.items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
            </p>
            <button
              onClick={checkout}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;

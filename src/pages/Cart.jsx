// import React, { useState, useEffect, useCallback } from 'react';
// import api from '../services/api';
// import { jwtDecode } from 'jwt-decode';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css'; // Import CSS for toast notifications

// function Cart() {
//     const [cart, setCart] = useState({ items: [] });
//     const [error, setError] = useState(null);
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
//                 toast.error('Authentication error. Please log in again.'); // Toast notification
//                 setLoading(false);
//             }
//         } else {
//             toast.error('User is not authenticated. Please log in.'); // Toast notification
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
//             toast.error('Failed to fetch cart. Please try again.'); // Toast notification
//             setLoading(false);
//         }
//     }, [userEmail, token]);

//     useEffect(() => {
//         if (userEmail) {
//             fetchCart();
//         }
//     }, [userEmail, fetchCart]);

//     // Remove item from cart
//     const removeFromCart = async (itemId) => {
//         try {
//             await api.delete(`/api/cart/remove/${userEmail}/${itemId}`, {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });
//             fetchCart(); // Refresh cart after item is removed
//             toast.success('Item removed from cart.'); // Toast notification
//         } catch (error) {
//             console.error('Error removing item from cart:', error);
//             toast.error('Failed to remove item from cart.'); // Toast notification
//         }
//     };

//     // Update item quantity in cart
//     const updateQuantity = async (itemId, newQuantity) => {
//         const updatedItems = cart.items.map((item) =>
//             item.itemId === itemId ? { ...item, quantity: newQuantity } : item
//         );
//         setCart({ items: updatedItems });
//         toast.info(`Updated quantity for ${itemId}.`); // Toast notification
//     };

//     // Checkout implementation
//     const checkout = async () => {
//         try {
//             // Step 1: Check stock availability before proceeding with checkout
//             for (let item of cart.items) {
//                 try {
//                     console.log(`Checking stock for Item ID: ${item.itemId}, Quantity: ${item.quantity}`);
//                     const response = await api.get(`/api/inventory/check-stock/${item.itemId}/${item.quantity}`);
//                 } catch (error) {
//                     if (error.response && error.response.status === 400) {
//                         toast.error(`Item ${item.name} exceeds available stock. ${error.response.data}`); // Toast notification
//                         return; // Stop checkout if stock is exceeded
//                     }
//                 }
//             }

//             // Step 2: Proceed with checkout
//             const itemIds = cart.items.map((item) => item.itemId);
//             const totalAmount = cart.items.reduce(
//                 (total, item) => total + item.price * item.quantity,
//                 0
//             );

//             const response = await api.post(
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

//             toast.success('Order placed successfully!'); // Toast notification

//             // Step 3: Update stock after successful checkout
//             for (let item of cart.items) {
//                 await api.put(`/api/inventory/update-stock`, {
//                     itemId: item.itemId,
//                     quantityPurchased: item.quantity,
//                 });
//             }

//             setCart({ items: [] }); // Clear cart after checkout
//             toast.success('Cart cleared after checkout.'); // Toast notification
//         } catch (error) {
//             console.error('Error during checkout:', error);
//             toast.error('Checkout failed. Please try again.'); // Toast notification
//         }
//     };

//     if (loading) {
//         return <p>Loading...</p>;
//     }

//     if (error) {
//         return <p className="text-red-500">{error}</p>;
//     }

//     return (
//         <div className="min-h-screen bg-orange-100 flex items-center justify-center">
//             <div className="max-w-md w-full md:w-2/3 lg:w-1/3 p-4 sm:p-6 bg-white rounded-lg shadow-lg">
//                 <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center">Your Cart</h1>
//                 {cart.items.length === 0 ? (
//                     <p className="text-center">Your cart is empty.</p>
//                 ) : (
//                     <>
//                         {cart.items.map((item) => (
//                             <div key={item.itemId} className="flex flex-col sm:flex-row justify-between items-center mb-4 border-b pb-2">
//                                 <div className="flex items-center mb-4 sm:mb-0">
//                                     <img
//                                         src={item.imageUrl}
//                                         alt={item.name}
//                                         className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md mr-4"
//                                     />
//                                     <div>
//                                         <h2 className="text-lg font-semibold">{item.name}</h2>
//                                         <div className="flex items-center mt-2">
//                                             <button
//                                                 onClick={() => updateQuantity(item.itemId, Math.max(1, item.quantity - 1))}
//                                                 className="bg-gray-200 px-2 rounded-l"
//                                             >
//                                                 -
//                                             </button>
//                                             <span className="mx-2">{item.quantity}</span>
//                                             <button
//                                                 onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
//                                                 className="bg-gray-200 px-2 rounded-r"
//                                             >
//                                                 +
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </div>
//                                 <div className="text-right">
//                                     <p className="text-lg sm:text-xl font-bold">Rs{(item.price * item.quantity).toFixed(2)}</p>
//                                     <button
//                                         onClick={() => removeFromCart(item.itemId)}
//                                         className="text-red-500 hover:text-red-700 ml-2"
//                                     >
//                                         X
//                                     </button>
//                                 </div>
//                             </div>
//                         ))}

//                         <div className="bg-gray-100 p-4 rounded-lg">
//                             <div className="flex justify-between mb-2">
//                                 <span className="text-gray-600">Sub Total</span>
//                                 <span className="font-bold">
//                                     Rs{cart.items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
//                                 </span>
//                             </div>
//                             <div className="flex justify-between font-semibold">
//                                 <span>Total</span>
//                                 <span className="text-xl font-bold">
//                                     Rs{(cart.items.reduce((total, item) => total + item.price * item.quantity, 0) + 9).toFixed(2)}
//                                 </span>
//                             </div>
//                         </div>

//                         <button
//                             onClick={checkout}
//                             className="w-full bg-orange-500 text-white font-semibold py-3 rounded-lg mt-4 hover:bg-orange-600 transition duration-300"
//                         >
//                             Check Out
//                         </button>
//                     </>
//                 )}
//             </div>
//             <ToastContainer /> {/* Add the ToastContainer here */}
//         </div>
//     );
// }

// export default Cart;



import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Cart() {
    const [cart, setCart] = useState({ items: [] });
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');
    const [userEmail, setUserEmail] = useState('');

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

    const updateQuantity = async (itemId, newQuantity) => {
        const updatedItems = cart.items.map((item) =>
            item.itemId === itemId ? { ...item, quantity: newQuantity } : item
        );
        setCart({ items: updatedItems });
        toast.info(`Updated quantity for ${itemId}.`);
    };

    const checkout = async () => {
        try {
            for (let item of cart.items) {
                try {
                    console.log(`Checking stock for Item ID: ${item.itemId}, Quantity: ${item.quantity}`);
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

            toast.success('Order placed successfully!');

            for (let item of cart.items) {
                await api.put(`/api/inventory/update-stock`, {
                    itemId: item.itemId,
                    quantityPurchased: item.quantity,
                });
            }

            setCart({ items: [] });
            toast.success('Cart cleared after checkout.');
        } catch (error) {
            console.error('Error during checkout:', error);
            toast.error('Checkout failed. Please try again.');
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="min-h-screen bg-orange-100 flex items-center justify-center">
            <div className="max-w-md w-full md:w-2/3 lg:w-1/3 p-4 sm:p-6 bg-white rounded-lg shadow-lg">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center">Your Cart</h1>
                {cart.items.length === 0 ? (
                    <p className="text-center">Your cart is empty.</p>
                ) : (
                    <>
                        {cart.items.map((item) => (
                            <div key={item.itemId} className="flex flex-col sm:flex-row justify-between items-center mb-4 border-b pb-2">
                                <div className="flex items-center mb-4 sm:mb-0">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md mr-4"
                                    />
                                    <div>
                                        <h2 className="text-lg font-semibold">{item.name}</h2>
                                        <div className="flex items-center mt-2">
                                            <button
                                                onClick={() => updateQuantity(item.itemId, Math.max(1, item.quantity - 1))}
                                                className="bg-gray-200 px-2 rounded-l"
                                            >
                                                -
                                            </button>
                                            <span className="mx-2">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                                                className="bg-gray-200 px-2 rounded-r"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg sm:text-xl font-bold">Rs{(item.price * item.quantity).toFixed(2)}</p>
                                    <button
                                        onClick={() => removeFromCart(item.itemId)}
                                        className="text-red-500 hover:text-red-700 ml-2"
                                    >
                                        X
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className="bg-gray-100 p-4 rounded-lg">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Sub Total</span>
                                <span className="font-bold">
                                    Rs{cart.items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between font-semibold">
                                <span>Total</span>
                                <span className="text-xl font-bold">
                                    Rs{(cart.items.reduce((total, item) => total + item.price * item.quantity, 0) + 9).toFixed(2)}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={checkout}
                            className="w-full bg-orange-500 text-white font-semibold py-3 rounded-lg mt-4 hover:bg-orange-600 transition duration-300"
                        >
                            Check Out
                        </button>
                    </>
                )}
            </div>
            <ToastContainer />
        </div>
    );
}

export default Cart;

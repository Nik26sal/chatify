import { useState, useContext } from 'react';
import { UserContext } from '../contextApi/UserContext.jsx';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function LoginForm() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [requesting, setRequesting] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const navigate = useNavigate();
    const { setUser ,user} = useContext(UserContext);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setRequesting(true);
        setMessage('');
        try {
            const response = await axios.post(
                "http://localhost:3030/api/user/login",
                {
                    email: formData.email,
                    password: formData.password,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true
                }
            );
            if (response.data && response.data.user) {
                setUser(response.data.user);
                setMessageType('success');
                setMessage('Login successful! Redirecting...');
                setTimeout(() => {
                    navigate('/home');
                }, 1500);
            } else {
                setMessageType('error');
                setMessage('Login failed. Please try again.');
            }
        } catch (error) {
            console.error(error);
            setMessageType('error');
            setMessage(error.response?.data?.message || 'Something went wrong!');
        }
        setRequesting(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 px-4">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
            >
                <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">
                    Login to Chatify
                </h2>

                {message && (
                    <div
                        className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium
                        ${messageType === 'success' ? 'bg-green-100 text-green-800 border border-green-300' :
                            'bg-red-100 text-red-800 border border-red-300'}
                        `}
                    >
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: "#4f46e5" }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={requesting}
                        className={`w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition font-semibold
                            ${requesting
                                ? "bg-indigo-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-700 hover:to-pink-600 text-white shadow-lg"
                            }`}
                    >
                        {requesting ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                </svg>
                                Login...
                            </>
                        ) : (
                            <>
                                Login <Send size={18} />
                            </>
                        )}
                    </motion.button>
                </form>
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-indigo-700 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                     onClick={() => !user ? navigate('/') : navigate(-1)}
                >
                    Back <Send size={18} />
                </motion.button>
            </motion.div>
        </div>
    );
}

export default LoginForm;

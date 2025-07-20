import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        avatar: null,
    });
    const [requesting, setRequesting] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' | 'error'

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setRequesting(true);
        setMessage('');
        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("email", formData.email);
            data.append("password", formData.password);
            if (formData.avatar) {
                data.append("avatar", formData.avatar);
            }

            const response = await axios.post(
                "http://localhost:3030/api/user/addUser",
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setMessageType('success');
            setMessage('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 1500);

        } catch (error) {
            console.error(error);
            setMessageType('error');
            setMessage(error.response?.data?.message || 'Registration failed. Please try again.');
        }
        setRequesting(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 px-4">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
            >
                <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">
                    Create Your Account
                </h2>

                {message && (
                    <div
                        className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium border
                            ${messageType === 'success'
                                ? 'bg-green-100 text-green-800 border-green-300'
                                : 'bg-red-100 text-red-800 border-red-300'
                            }`}
                    >
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>
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
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Avatar</label>
                        <input
                            type="file"
                            name="avatar"
                            accept="image/*"
                            onChange={handleChange}
                            className="w-full"
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
                                Registering...
                            </>
                        ) : (
                            <>
                                Register <Send size={18} />
                            </>
                        )}
                    </motion.button>
                </form>
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-indigo-700 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                    onClick={() => navigate(-1)}
                >
                    Back <Send size={18} />
                </motion.button>
            </motion.div>
        </div>
    );
}

export default Register;

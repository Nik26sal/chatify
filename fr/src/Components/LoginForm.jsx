import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function LoginForm() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append("email", formData.email);
            data.append("password", formData.password);
            const response = await axios.post(
                "http://localhost:3030/api/user/login",
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            console.log(response);
            navigate('/login')
        } catch (error) {
            console.log(error);
        }
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
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                    >
                        Login <Send size={18} />
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

export default LoginForm;

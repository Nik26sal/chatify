import React, { useState } from 'react';
import { motion } from 'framer-motion';

function Profile() {
    // Fake authenticated user
    const [user, setUser] = useState({
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://i.pravatar.cc/150?img=32',
    });

    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ ...user });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: files ? URL.createObjectURL(files[0]) : value,
        }));
    };

    const handleSave = () => {
        setUser(formData);
        setEditMode(false);
    };

    const handleLogout = () => {
        alert('You have been logged out.');
        // Add logout logic here (clear tokens, redirect, etc.)
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center"
            >
                <img
                    src={formData.avatar}
                    alt="Avatar"
                    className="w-28 h-28 mx-auto rounded-full border-4 border-indigo-500 mb-4"
                />

                {editMode ? (
                    <>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full mb-2 px-4 py-2 border rounded-lg text-center"
                        />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full mb-4 px-4 py-2 border rounded-lg text-center"
                        />
                        <input
                            type="file"
                            name="avatar"
                            accept="image/*"
                            onChange={handleChange}
                            className="w-full mb-4"
                        />
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-gray-800 mb-1">{user.name}</h2>
                        <p className="text-gray-500 mb-6">{user.email}</p>
                    </>
                )}

                <div className="flex gap-4 justify-center">
                    {editMode ? (
                        <button
                            onClick={handleSave}
                            className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition"
                        >
                            Save
                        </button>
                    ) : (
                        <button
                            onClick={() => setEditMode(true)}
                            className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
                        >
                            Edit Profile
                        </button>
                    )}
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition"
                    >
                        Logout
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default Profile;

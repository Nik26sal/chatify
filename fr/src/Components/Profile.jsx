import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserContext } from '../contextApi/UserContext.jsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const { user, setUser, loading } = useContext(UserContext);
    const navigate = useNavigate();

    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [avatarPreview, setAvatarPreview] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const [requesting, setRequesting] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
        if (user) {
            setFormData({ name: user.name, email: user.email, description: user.description });
            setAvatarPreview(user.avatar || 'avatar.png');
        }
    }, [user, loading, navigate]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'avatar' && files.length > 0) {
            setAvatarFile(files[0]);
            setAvatarPreview(URL.createObjectURL(files[0]));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setRequesting(true);
        setMessage('');
        let hasUpdate = false;
        let messages = [];

        try {
            const nameChanged = formData.name !== user.name;
            const emailChanged = formData.email !== user.email;
            const descriptionChanged = formData.description !== user.description;
            const avatarChanged = !!avatarFile;

            if (nameChanged || emailChanged || descriptionChanged) {
                const userData = {};
                if (nameChanged) userData.name = formData.name;
                if (emailChanged) userData.email = formData.email;
                if (descriptionChanged) userData.description = formData.description;

                await axios.patch("http://localhost:3030/api/user/update", userData, { withCredentials: true });
                hasUpdate = true;
                messages.push("Details updated successfully");
            }

            if (avatarChanged) {
                const avatarData = new FormData();
                avatarData.append("avatar", avatarFile);
                await axios.patch("http://localhost:3030/api/user/updateAvatar", avatarData, { withCredentials: true });
                hasUpdate = true;
                messages.push("Avatar updated successfully");
            }

            if (!hasUpdate) {
                setMessageType('info');
                setMessage("No changes made.");
                setRequesting(false);
                return;
            }

            setMessageType('success');
            setMessage(messages.join(". ") + ". Refreshing...");

            setTimeout(async () => {
                const res = await axios.get("http://localhost:3030/api/user/me", {
                    withCredentials: true,
                });
                setUser(res.data.user);
                setEditMode(false);
                setRequesting(false);
                navigate('/profile')
            }, 1500);

        } catch (error) {
            console.error(error);
            setMessageType('error');
            setMessage('Failed to update profile.');
            setRequesting(false);
        }
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        setRequesting(true);
        setMessage('');
        try {
            await axios.post("http://localhost:3030/api/user/logout", {}, { withCredentials: true });
            setMessageType('success');
            setMessage('Logout successful. Redirecting...');
            setTimeout(() => {
                setUser(null);
                navigate('/');
            }, 1500);
        } catch (error) {
            console.error(error);
            setMessageType('error');
            setMessage('Logout failed. Try again.');
            setRequesting(false);
        }
    };

    if (loading) return <div className="text-center text-white mt-10">Loading...</div>;
    if (!user) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm text-center"
            >
                {message && (
                    <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium border
                        ${messageType === 'success'
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : 'bg-red-100 text-red-800 border-red-300'
                        }`}
                    >
                        {message}
                    </div>
                )}

                <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-28 h-28 mx-auto rounded-full border-4 border-indigo-500 mb-4 object-cover"
                />

                {editMode ? (
                    <>
                        <input
                            type="text"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleChange}
                            placeholder="Name"
                            className="w-full mb-2 px-4 py-2 border rounded-lg text-center"
                        />
                        <input
                            type="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleChange}
                            placeholder="Email"
                            className="w-full mb-4 px-4 py-2 border rounded-lg text-center"
                        />
                        <input
                            type="text"
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            placeholder="description"
                            className="w-full mb-4 px-4 py-2 border rounded-lg text-center"
                        />
                        <input
                            type="file"
                            name="avatar"
                            accept="image/*"
                            onChange={handleChange}
                            className="w-full mb-4"
                        />
                        <button
                            onClick={() => setEditMode(false)}
                            className="bg-red-600 text-white py-2 px-4 my-3 rounded-lg hover:bg-red-700 transition"
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-gray-800 mb-1">{user?.name}</h2>
                        <h3 className="text-xl font-bold text-gray-500 mb-1">{user?.description}</h3>
                        <p className="text-gray-500 mb-6">{user?.email}</p>
                    </>
                )}

                <div className="flex gap-4 justify-center">
                    {editMode ? (
                        <button
                            onClick={handleSave}
                            className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition"
                            disabled={requesting}
                        >
                            {requesting ? 'Saving...' : 'Save'}
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
                        disabled={requesting}
                    >
                        {requesting ? 'Logging out...' : 'Logout'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default Profile;

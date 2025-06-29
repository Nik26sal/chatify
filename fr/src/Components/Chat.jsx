import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import Message from './Message'; // ← make sure Message component is created as in previous step

function Chat() {
    const [messages, setMessages] = useState([
        { text: 'Hey there!', sender: 'Alice', isOwnMessage: false, time: '2:45 PM' },
        { text: 'Hi! How are you?', sender: 'You', isOwnMessage: true, time: '2:46 PM' },
    ]);
    const [input, setInput] = useState('');

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMessage = {
            text: input,
            sender: 'You',
            isOwnMessage: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages([...messages, newMessage]);
        setInput('');
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-indigo-600 text-white px-4 py-3 text-lg font-semibold shadow">
                Chat with Alice
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
                {messages.map((msg, i) => (
                    <Message key={i} {...msg} />
                ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 bg-white border-t">
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full transition"
                >
                    <Send size={20} />
                </motion.button>
            </form>
        </div>
    );
}

export default Chat;

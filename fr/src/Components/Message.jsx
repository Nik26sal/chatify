import React from 'react';
import { motion } from 'framer-motion';

function Message({ text, sender, isOwnMessage, time }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} px-2`}
        >
            <div className={`max-w-xs md:max-w-md rounded-2xl p-3 shadow-sm
                ${isOwnMessage ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-gray-900 rounded-bl-none'}
            `}>
                <div className="text-sm">{text}</div>
                <div className="text-xs text-gray-400 mt-1 text-right">
                    {sender} • {time}
                </div>
            </div>
        </motion.div>
    );
}

export default Message;

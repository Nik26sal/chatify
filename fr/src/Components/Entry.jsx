import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { Link ,NavLink} from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../contextApi/UserContext.jsx';



function Entry() {
    const {user} = useContext(UserContext);
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white font-sans">
            <header className="flex justify-between items-center p-6 max-w-6xl mx-auto">
                <div className="text-2xl font-bold text-yellow-300">Chatify</div>
                <nav className="space-x-6 text-white font-medium">
                    {(!user)?<Link to="/register" className="hover:underline">Register</Link>:""}
                    {(!user)?<Link to="/login" className="hover:underline">Login</Link>:""}
                    <Link to="/home" className="hover:underline">Get Started</Link>
                </nav>
            </header>
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col-reverse md:flex-row items-center justify-between max-w-6xl mx-auto px-6 py-20"
            >
                <div className="md:w-1/2">
                    <h1 className="text-5xl font-extrabold leading-tight mb-4">
                        Welcome to <span className="text-yellow-300">Chatify</span>
                    </h1>
                    <p className="text-lg mb-6">
                        The smartest way to connect, collaborate and chat. Powered by AI.
                    </p>
                    <a href="#get-started">
                        <button className="bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-bold py-3 px-6 rounded-xl shadow-lg transition duration-300">
                            Get Started
                        </button>
                    </a>
                </div>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-full md:w-1/2 mb-10 md:mb-0 flex justify-center"
                >
                    <div className="w-72 h-72 bg-white/10 border-4 border-white rounded-3xl flex items-center justify-center shadow-xl">
                        <span className="text-white text-xl font-semibold">Chatify UI</span>
                    </div>
                </motion.div>
            </motion.section>
            <section id="features" className="py-16 bg-white text-gray-900">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-12">Features</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard title="AI Responses" desc="Smart replies, sentiment analysis and more." />
                        <FeatureCard title="Multiplatform" desc="Chat on Web, Android, iOS, or Desktop." />
                        <FeatureCard title="Secure & Fast" desc="End-to-end encryption with blazing speed." />
                    </div>
                </div>
            </section>
            <section id="demo" className="py-20 bg-gray-100">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-4xl font-bold text-center mb-10 text-gray-800">Live Chatify UI Demo</h2>
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="h-96 p-4 flex flex-col space-y-2 overflow-y-auto">
                            <ChatBubble text="Hey Chatify, what's the weather like today?" sender="user" />
                            <ChatBubble text="Today it's sunny in New York ☀️ with a high of 25°C!" sender="bot" />
                            <ChatBubble text="Nice! Can you also remind me to drink water?" sender="user" />
                            <ChatBubble text="Sure! I'll remind you every 2 hours to stay hydrated 💧" sender="bot" />
                        </div>
                        <div className="flex items-center border-t px-4 py-3 bg-gray-50">
                            <input
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none"
                                placeholder="Type your message..."
                            />
                            <button className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full">
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            <section id="get-started" className="py-16 bg-indigo-700 text-white text-center">
                <h2 className="text-4xl font-bold mb-4">Ready to Chat Smarter?</h2>
                <p className="mb-6">Join Chatify and experience intelligent messaging.</p>
                <button className="bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-bold py-3 px-8 rounded-xl shadow-lg transition duration-300">
                    Get Started for Free
                </button>
            </section>

            <footer className="bg-indigo-900 text-white py-8 mt-16">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm">
                    <p>&copy; {new Date().getFullYear()} Chatify. All rights reserved.</p>
                    <div className="space-x-4 mt-4 md:mt-0">
                        <a href="#" className="hover:underline">Privacy Policy</a>
                        <a href="#" className="hover:underline">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

const FeatureCard = ({ title, desc }) => (
    <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-gray-200">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p>{desc}</p>
    </div>
);

const ChatBubble = ({ text, sender }) => {
    const isUser = sender === "user";
    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                    isUser ? "bg-indigo-500 text-white" : "bg-gray-200 text-gray-900"
                }`}
            >
                {text}
            </div>
        </div>
    );
};

export default Entry;

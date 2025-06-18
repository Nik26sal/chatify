import { motion } from "framer-motion";

const navVariants = {
  hidden: { y: -50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, type: "spring" } },
};

const hoverVariant = {
  hover: { scale: 1.1, color: "#2563eb" },
};

function Navbar() {
  return (
    <motion.div
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className="flex justify-around items-center p-4 bg-white text-gray-800 shadow-md"
    >
      <div className="text-xl font-bold text-blue-600">Chatify</div>
      <div className="flex justify-between w-1/2 gap-6 text-base font-medium">
        {["Chats", "Profile", "Setting", "Contact-Us"].map((item, idx) => (
          <motion.button
            key={idx}
            variants={hoverVariant}
            whileHover="hover"
            className="px-3 py-1 rounded-md transition duration-200 hover:bg-blue-100"
          >
            {item}
          </motion.button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <motion.img
          src="avatar.png"
          alt="avatar"
          className="w-8 h-8 rounded-full object-cover border-2 border-blue-400"
          whileHover={{ scale: 1.15 }}
          transition={{ type: "spring", stiffness: 300 }}
        />
        <h1 className="text-sm font-semibold">UserName</h1>
      </div>
    </motion.div>
  );
}

export default Navbar;

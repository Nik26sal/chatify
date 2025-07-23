import { motion } from "framer-motion";
import { Link, NavLink } from 'react-router-dom';
import { useContext } from "react";
import { UserContext } from "../contextApi/UserContext.jsx";

const navVariants = {
  hidden: { y: -50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, type: "spring" } },
};

const hoverVariant = {
  hover: { scale: 1.1, color: "#2563eb" },
};
function Navbar() {
  const {user} = useContext(UserContext);
  return (
    <motion.div
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className="flex justify-around items-center p-4 bg-white text-gray-800 shadow-md"
    >
      
      <Link to ="/">
        <div className="text-xl font-bold text-blue-600">Chatify</div>
      </Link>
      <div className="flex justify-between w-1/2 gap-6 text-base font-medium">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            `px-3 py-1 rounded-md transition duration-200 hover:bg-blue-100 ${isActive ? "bg-blue-100 text-blue-600 font-bold" : ""
            }`
          }
        >
          Chats
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `px-3 py-1 rounded-md transition duration-200 hover:bg-blue-100 ${isActive ? "bg-blue-100 text-blue-600 font-bold" : ""
            }`
          }
        >
          Profile
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `px-3 py-1 rounded-md transition duration-200 hover:bg-blue-100 ${isActive ? "bg-blue-100 text-blue-600 font-bold" : ""
            }`
          }
        >
          Setting
        </NavLink>
        <NavLink
          to="/contact"
          className={({ isActive }) =>
            `px-3 py-1 rounded-md transition duration-200 hover:bg-blue-100 ${isActive ? "bg-blue-100 text-blue-600 font-bold" : ""
            }`
          }
        >
          Contact-Us
        </NavLink>
      </div>
      <Link to={'/profile'}>
      <div className="flex items-center gap-3">
        <motion.img
         src={user?.avatar}
          alt="avatar"
          className="w-8 h-8 rounded-full object-cover border-2 border-blue-400"
          whileHover={{ scale: 1.15 }}
          transition={{ type: "spring", stiffness: 300 }}
        />
        <h1 className="text-sm font-semibold">{user?.name}</h1>
      </div>
      </Link>
    </motion.div>
  );
}

export default Navbar;

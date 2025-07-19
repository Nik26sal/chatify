import { useState ,useContext} from "react";
import { UserContext } from "../contextApi/UserContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";


function Setting() {
  const [theme, setTheme] = useState("light");
  const [showConfirm, setShowConfirm] = useState(false);
  const {setUser} = useContext(UserContext)
  const navigate = useNavigate();
  const handleThemeChange = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleDeleteAccount = () => {
    setShowConfirm(true);
  };

  const confirmDelete = async() => {
    setShowConfirm(false);
   try {
            const response = await axios.delete(
                "http://localhost:3030/api/user/deleteAccount",
                {
                   headers: {
                        "Content-Type": "application/json",
                    },
                    withCredentials: true
                }
            );
            if (response) {
                setUser(null);
                navigate('/login');
            }
        } catch (error) {
            console.log(error);
        }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        theme === "dark" ? "bg-gray-900" : "bg-gray-100"
      } transition-colors`}
    >
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 w-full max-w-md`}>
        <h2 className="text-2xl font-bold mb-6 text-indigo-700 dark:text-indigo-300 text-center">
          Settings
        </h2>

        <div className="flex items-center justify-between mb-8">
          <span className="text-gray-700 dark:text-gray-200 font-medium">Theme</span>
          <button
            onClick={handleThemeChange}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              theme === "dark"
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-200 text-indigo-700 hover:bg-gray-300"
            }`}
          >
            {theme === "dark" ? "Dark" : "Light"}
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-700 dark:text-gray-200 font-medium">Delete Account</span>
          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>

        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
              <h3 className="text-lg font-bold mb-4 text-red-600">Are you sure?</h3>
              <p className="mb-6 text-gray-700 dark:text-gray-200">
                This action cannot be undone.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Setting;

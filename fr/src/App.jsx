import { Routes, Route, useLocation } from "react-router-dom";
import Entry from "./Components/Entry";
import LoginForm from "./Components/LoginForm";
import Message from "./Components/Message";
import Navbar from "./Components/Navbar";
import Profile from "./Components/Profile";
import Register from "./Components/Register";
import Home from "./Components/Home";
import Setting from "./Components/Setting";
import Contact from "./Components/Contact";


function App() {
  const location = useLocation();
  if (location.pathname === "/") {
    return <Entry />;
  }
  else if(location.pathname === "/register"){
    return <Register/>
  }
  else if(location.pathname === "/login"){
    return <LoginForm/>
  }
  return (
    <>
      <Navbar />
      <div className="w-full">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/message" element={<Message />} />
          <Route path="/settings" element={<Setting/>} />
          <Route path="/contact" element={<Contact/>} />
        </Routes>
      </div>
    </>
  );
}

export default App;

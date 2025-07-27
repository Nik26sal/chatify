import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  SendHorizonal,
  Users,
  User,
  Search,
  X,
} from "lucide-react";
import { io } from "socket.io-client";

function Home() {
  const [full, setFull] = useState(true);
  const [search, setSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasChat, setHasChat] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [singleChat, setSingleChat] = useState([]);
  const [groupChat, setGroupChat] = useState([]);
  const [showGroupChats, setShowGroupChats] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [toast, setToast] = useState(null);
  const socket = useRef(null);

  const toggleFull = () => setFull((prev) => !prev);
  const toggleSearch = () => setSearch((prev) => !prev);
  const toggleChatType = () => setShowGroupChats((prev) => !prev);

  useEffect(() => {
    const fetchUserAndChats = async () => {
      try {
        const userRes = await axios.get("http://localhost:3030/api/user/me", {
          withCredentials: true,
        });
        setCurrentUser(userRes.data.user);

        const res = await axios.get("http://localhost:3030/api/chat/getAll", {
          withCredentials: true,
        });

        const single = [];
        const group = [];

        res.data.chats.forEach((chat) => {
          if (chat.title === "singleChat") {
            single.push(chat);
          } else {
            group.push(chat);
          }
        });

        setSingleChat(single);
        setGroupChat(group);
      } catch (error) {
        console.error("Error fetching user or chats:", error);
      }
    };

    fetchUserAndChats();
  }, []);

  useEffect(() => {
    socket.current = io("http://localhost:3030", {
      withCredentials: true,
      transports: ["websocket"],
    });

    socket.current.on("connect", () => {
      console.log("🟢 Socket connected:", socket.current.id);
    });

    socket.current.on("receive_message", (newMsg) => {
      console.log("📥 Message received via socket:", newMsg);
      setChatMessages((prev) => [...prev, newMsg]);
      fetchMessages()
    });

    socket.current.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
    });

    return () => {
      socket.current.disconnect();
    };
  }, []);


  useEffect(() => {
    if (selectedChat?._id && socket.current) {
      fetchMessages();
      socket.current.emit("join_room", selectedChat._id);
    }
  }, [selectedChat]);

  const fetchMessages = async () => {
    if (!selectedChat?._id) return;
    try {
      const res = await axios.post(
        "http://localhost:3030/api/message/getAllMessage",
        { chatId: selectedChat._id },
        { withCredentials: true }
      );
      setChatMessages(res.data.messages || []);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const handleMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const res = await axios.post(
        "http://localhost:3030/api/message/sendMessage",
        {
          chatId: selectedChat._id,
          message: message,
        },
        { withCredentials: true }
      );

      const newMsg = res.data.message;

      setMessage("");
      setChatMessages((prev) => [...prev, newMsg]);
      socket.current.emit("send_message", {
        chatId: selectedChat._id,
        message: newMsg,
      });

      setToast({ type: "success", message: "Message sent!" });
      fetchMessages()
    } catch (error) {
      console.error("Message sending failed:", error);
      setToast({ type: "error", message: "Failed to send message" });
    } finally {
      setTimeout(() => setToast(null), 3000);
    }
  };

  const displayedChats = (showGroupChats ? groupChat : singleChat).filter((chat) =>
    chat.chatName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const existingSingleChatUserIds = singleChat.map((chat) =>
    chat.members.find((member) => member._id !== currentUser?._id)?._id
  );

  const Toast = ({ type = "success", message }) => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-5 right-5 px-4 py-3 rounded-lg shadow-lg text-white z-50 ${type === "success" ? "bg-green-600" : "bg-red-600"
        }`}
    >
      <div className="flex items-center gap-2">
        {type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
        <span>{message}</span>
      </div>
    </motion.div>
  );

  return (
    <div className="h-screen flex bg-gray-100 text-gray-800">
      <AnimatePresence>
        {toast && <Toast type={toast.type} message={toast.message} />}
      </AnimatePresence>

      <div className={`${full ? "w-1/4" : "w-1/12"} relative bg-white border-r overflow-y-auto`}>
        <div className="flex items-center justify-between p-4 border-b bg-indigo-600 text-white">
          {!search && full && <h1 className="text-xl font-semibold">Chats</h1>}
          <div className="flex items-center space-x-2 mr-4">
            {!search ? (
              <button onClick={toggleSearch} className="text-lg" title="Search">
                <Search size={20} />
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={searchQuery}
                  placeholder="Search..."
                  className="p-2 border rounded text-gray-900"
                  onChange={async (e) => {
                    const query = e.target.value;
                    setSearchQuery(query);

                    if (query.trim() === "") {
                      setSearchResults([]);
                      setIsSearchingUsers(false);
                      return;
                    }

                    try {
                      const res = await axios.get(
                        `http://localhost:3030/api/user/getSearchedUser?query=${query}`,
                        { withCredentials: true }
                      );

                      const filtered = res.data.filter(
                        (user) =>
                          user._id !== currentUser?._id &&
                          !existingSingleChatUserIds.includes(user._id)
                      );

                      setSearchResults(filtered);
                      setIsSearchingUsers(true);
                    } catch (err) {
                      console.error("Search error:", err);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    setSearch(false);
                    setSearchQuery("");
                    setSearchResults([]);
                    setIsSearchingUsers(false);
                  }}
                  className="text-red-500"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
            )}
            <button onClick={toggleChatType} title="Toggle chat type" className="text-lg">
              {showGroupChats ? <User size={20} /> : <Users size={20} />}
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {isSearchingUsers ? (
            searchResults.length > 0 ? (
              searchResults.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between hover:bg-gray-200 p-2 rounded cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full" />
                    {full && (
                      <div>
                        <h2 className="font-medium text-gray-900">{user.name}</h2>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const res = await axios.post(
                          "http://localhost:3030/api/chat/createChat",
                          { groupMembersId: [user._id] },
                          { withCredentials: true }
                        );
                        setToast({ type: "success", message: "Chat successfully created!" });
                        setSearch(false);
                        setSearchQuery("");
                        setSearchResults([]);
                        setIsSearchingUsers(false);
                      } catch (err) {
                        setToast({
                          type: "error",
                          message: err.response?.data?.message || "Failed to create chat",
                        });
                      } finally {
                        setTimeout(() => setToast(null), 3000);
                      }
                    }}
                    className="text-green-600 text-xl font-bold hover:text-green-800"
                    title="Start Chat"
                  >
                    +
                  </button>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-400 text-center">No users found</div>
            )
          ) : (
            displayedChats.map((chat) => {
              const isSingle = chat.title === "singleChat";
              const otherUser =
                isSingle && chat.members.length > 1
                  ? chat.members.find((m) => m._id !== currentUser?._id)
                  : chat.members[0];

              const avatar = isSingle ? otherUser?.avatar : chat.chatAvatar;
              const name = isSingle ? otherUser?.name : chat.chatName;
              const description = isSingle ? otherUser?.email : chat.chatdescription;

              return (
                <div
                  key={chat._id}
                  className="flex items-center space-x-4 hover:bg-gray-200 p-2 rounded cursor-pointer"
                  onClick={() => {
                    setSelectedChat(chat);
                    setHasChat(true);
                  }}
                >
                  <img src={avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                  {full && (
                    <div>
                      <h2 className="font-medium text-gray-900">{name}</h2>
                      <p className="text-sm text-gray-500">{description}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
          {!isSearchingUsers && displayedChats.length === 0 && (
            <div className="text-sm text-gray-400 text-center">No chats found</div>
          )}
        </div>

        <div className="absolute top-4 right-2 z-10 flex flex-col gap-2 items-center">
          <button
            onClick={toggleFull}
            className="bg-indigo-600 text-white text-sm rounded-full px-2 py-1 shadow hover:bg-indigo-700"
            title={full ? "Collapse sidebar" : "Expand sidebar"}
          >
            {full ? "⟨" : "⟩"}
          </button>
        </div>
      </div>

      <div className="w-3/4 flex flex-col bg-white">
        {hasChat && selectedChat ? (
          <>
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-md rounded-t-2xl">
              <div className="flex items-center gap-3">
                {(() => {
                  const isSingle = selectedChat.title === "singleChat";
                  const otherUser =
                    isSingle && selectedChat.members.length > 1
                      ? selectedChat.members.find((m) => m._id !== currentUser?._id)
                      : selectedChat.members[0];

                  const avatar = isSingle ? otherUser?.avatar : selectedChat.chatAvatar;
                  const name = isSingle ? otherUser?.name : selectedChat.chatName;

                  return (
                    <>
                      <img
                        src={avatar}
                        alt="Chat Avatar"
                        className="w-10 h-10 rounded-full border-2 border-white shadow"
                      />
                      <div>
                        <h2 className="font-semibold text-lg">{name}</h2>
                        <span className="text-xs text-white/80">Online</span>
                      </div>
                    </>
                  );
                })()}
              </div>
              <button
                onClick={() => setHasChat(false)}
                className="ml-2 p-2 rounded-full hover:bg-white/20 transition flex items-center justify-center shadow hover:scale-110 active:scale-95"
                title="Close chat"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {chatMessages.map((msg) => {
                const isSentByCurrentUser = msg.sendBy && msg.sendBy._id === currentUser?._id;

                return (
                  <div
                    key={msg._id}
                    className={`w-fit p-2 rounded-lg ${isSentByCurrentUser ? "bg-indigo-600 text-white ml-auto" : "bg-white"
                      }`}
                  >
                    {msg.message}
                  </div>
                );
              })}
            </div>

            <form
              className="flex items-center p-4 border-t space-x-4 bg-white"
              onSubmit={handleMessage}
            >
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded-lg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full transition"
              >
                <SendHorizonal size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
            <div className="text-2xl text-gray-400 mb-2">Select a chat to start messaging</div>
            <div className="text-sm text-gray-400">Your messages will appear here.</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;

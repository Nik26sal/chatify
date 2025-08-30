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
  PlusCircle,
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
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [toast, setToast] = useState(null);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [groupUsers, setGroupUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [groupChatAvatar, setgroupChatAvatar] = useState(null);
  const socket = useRef(null);
  const toggleFull = () => setFull((prev) => !prev);
  const toggleSearch = () => setSearch((prev) => !prev);
  const toggleChatType = () => {
    setSearch(false)
    setCreatingGroup(false)
    setShowGroupChats((prev) => !prev)
  };

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
  useEffect(() => {
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
      setChatMessages((prev) => [...prev, newMsg]);
      fetchMessages();
    });

    socket.current.on("new_chat_created", () => {
      fetchUserAndChats();
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

      const newMsg = res.data.data.message;

      setMessage("");
      setChatMessages((prev) => [...prev, newMsg]);
      socket.current.emit("send_message", {
        chatId: selectedChat._id,
        message: newMsg,
      });

      setToast({ type: "success", message: "Message sent!" });
      fetchMessages();
    } catch (error) {
      console.error("Message sending failed:", error);
      setToast({ type: "error", message: "Failed to send message" });
    } finally {
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleGroupUserSearch = async (query) => {
    try {
      setSearchQuery(query);
      const res = await axios.get(
        `http://localhost:3030/api/user/getSearchedUser?query=${query}`,
        { withCredentials: true }
      );
      console.log(res.data)
      const filtered = res.data.filter(
        (u) => u._id !== currentUser._id && !displayedChats.some((c) => c.members[0]._id === u._id)
      );
      setSearchResults(filtered);
    } catch (err) {
      console.error("Group search error:", err);
    }
  };

  const createGroupChat = async () => {
    try {
      const ids = groupUsers.map((u) => u._id);
      const formData = new FormData();
      formData.append("groupName", groupName);
      formData.append("groupMembersId", JSON.stringify(ids));
      if (groupChatAvatar) {
        formData.append("groupChatAvatar", groupChatAvatar);
      }

      await axios.post(
        "http://localhost:3030/api/chat/createChat",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setToast({ type: "success", message: "Group created!" });
      setCreatingGroup(false);
      setGroupUsers([]);
      setGroupName("");
      setgroupChatAvatar(null);
      setShowGroupChats(false)
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.message || "Group creation failed",
      });
    } finally {
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleAddChat = async (chat) => {
    try {
      const ids = [chat._id];
      const formData = new FormData();
      formData.append("groupMembersId", JSON.stringify(ids));
      const res = await axios.post(
        "http://localhost:3030/api/chat/createChat",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(res)
      setToast({ type: "success", message: "Chat created!" });
      setSearchQuery("")
      setSearch(false);
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.message || "chat creation failed",
      });
    }
  }

  const displayedChats = (showGroupChats ? groupChat : singleChat).filter((chat) =>
    chat.chatName.toLowerCase().includes(searchQuery.toLowerCase())
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
      <AnimatePresence>{toast && <Toast type={toast.type} message={toast.message} />}</AnimatePresence>
      <div className={`${full ? "w-1/4" : "w-1/12"} relative bg-white border-r overflow-y-auto`}>
        <div className="flex items-center justify-between p-4 border-b bg-indigo-600 text-white">
          {!search && full && (
            <h1 className="text-xl font-semibold">Chats</h1>
          )}
          {search && full && (
            <input
              type="search"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => handleGroupUserSearch(e.target.value)}
              className="px-2 py-1 rounded text-black"
            />
          )}
          <div className="flex items-center space-x-2 mr-4">
            {!showGroupChats && <button onClick={toggleSearch} title="Search">
              <Search size={20} />
            </button>}
            <button onClick={toggleChatType} title="Toggle chat type">
              {showGroupChats ? <User size={20} /> : <Users size={20} />}
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {showGroupChats && !creatingGroup && (
            <button
              className="flex items-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
              onClick={() => {
                setCreatingGroup(true);
                setGroupUsers([]);
              }}
            >
              <PlusCircle size={18} />
              {full && "Create Group"}
            </button>
          )}

          {creatingGroup && (
            <div className="bg-gray-100 p-3 rounded space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setgroupChatAvatar(e.target.files[0])}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Search users..."
                onChange={(e) => handleGroupUserSearch(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <div className="flex flex-wrap gap-2">
                {groupUsers.map((u) => (
                  <span
                    key={u._id}
                    className="bg-indigo-200 px-2 py-1 rounded text-sm flex items-center gap-1"
                  >
                    {u.name}
                    <button
                      onClick={() =>
                        setGroupUsers((prev) => prev.filter((gu) => gu._id !== u._id))
                      }
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                {searchResults.map((u) => (
                  <div
                    key={u._id}
                    className="cursor-pointer hover:bg-gray-200 p-2 rounded"
                    onClick={() => {
                      setGroupUsers((prev) => [...prev, u]);
                      setSearchResults([]);
                    }}
                  >
                    {u.name}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={createGroupChat}
                  className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
                >
                  Create
                </button>
                <button
                  onClick={() => setCreatingGroup(false)}
                  className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {!search && displayedChats.map((chat) => {
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
          })}
          {search && searchResults.map((chat) => {
            const avatar = chat.avatar;
            const name = chat.name;
            const email = chat.email;
            return (
              <div
                key={chat._id}
                className="flex items-center justify-between hover:bg-gray-200 p-2 rounded cursor-pointer"
                onClick={() => {
                  handleAddChat(chat)
                }}
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {full && (
                    <div>
                      <h2 className="font-medium text-gray-900">{name}</h2>
                      <p className="text-sm text-gray-500">{email}</p>
                    </div>
                  )}
                </div>
                <div className="text-gray-600">
                  <span className="text-blue-600 font-bold">+</span>
                </div>
              </div>
            )
          })}
        </div>
        <div className="absolute top-3 right-1 z-10 flex flex-col gap-2 items-center">
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
                    className={`w-fit max-w-xs break-words p-2 rounded-lg shadow ${isSentByCurrentUser ? "bg-indigo-600 text-white ml-auto" : "bg-white text-gray-800"
                      }`}
                  >
                    {!isSentByCurrentUser && (
                      <div className="text-xs font-semibold text-indigo-500 mb-1">
                        {msg.sendBy?.name || "Unknown"}
                      </div>
                    )}
                    <div>{msg.message}</div>
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

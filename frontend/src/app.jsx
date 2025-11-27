import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Search,
  User,
  Clock,
  MessageSquare,
  TrendingUp,
  Users,
  ArrowLeft,
  BarChart3,
} from "lucide-react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [view, setView] = useState("chat"); // 'chat' veya 'stats'
  const messagesEndRef = useRef(null);

  // Kullanıcıları yükle
  useEffect(() => {
    loadUsers();
    loadStats();
  }, []);

  // Seçili kullanıcı değiştiğinde mesajları yükle
  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser);
    }
  }, [selectedUser]);

  // Mesajlar yüklendiğinde en alta scroll
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data);
      if (response.data.length > 0) {
        setSelectedUser(response.data[0].user_id);
      }
      setLoading(false);
    } catch (error) {
      console.error("Kullanıcılar yüklenirken hata:", error);
      setLoading(false);
    }
  };

  const loadMessages = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/messages/${userId}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Mesajlar yüklenirken hata:", error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("İstatistikler yüklenirken hata:", error);
    }
  };

  const formatTime = (datetime) => {
    const date = new Date(datetime);
    return date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (datetime) => {
    const date = new Date(datetime);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Bugün";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Dün";
    } else {
      return date.toLocaleDateString("tr-TR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    }
  };

  const filteredUsers = users.filter((user) =>
    user.user_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach((msg) => {
      const date = formatDate(msg.created_at);
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const groupedMessages = groupMessagesByDate(messages);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  // İstatistikler görünümü
  if (view === "stats") {
    return (
      <div className="h-screen bg-gray-100 flex flex-col">
        {/* Header */}
        <div className="bg-emerald-600 text-white p-4 flex items-center">
          <button
            onClick={() => setView("chat")}
            className="mr-3 hover:bg-emerald-700 p-2 rounded-full transition"
          >
            <ArrowLeft size={24} />
          </button>
          <BarChart3 size={24} className="mr-3" />
          <h1 className="text-xl font-semibold">İstatistikler</h1>
        </div>

        {/* Stats Cards */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Toplam Mesaj</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {stats?.totalMessages || 0}
                    </p>
                  </div>
                  <MessageSquare className="text-emerald-600" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Toplam Kullanıcı</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {stats?.totalUsers || 0}
                    </p>
                  </div>
                  <Users className="text-blue-600" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Gelen Mesaj</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {stats?.incomingMessages || 0}
                    </p>
                  </div>
                  <TrendingUp className="text-green-600" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Giden Mesaj</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {stats?.outgoingMessages || 0}
                    </p>
                  </div>
                  <Send className="text-purple-600" size={32} />
                </div>
              </div>
            </div>

            {/* Kullanıcı Listesi */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Aktif Kullanıcılar</h2>
              <div className="space-y-2">
                {users.slice(0, 10).map((user) => (
                  <div
                    key={user.user_id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                        <User size={20} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.user_id}
                        </p>
                        <p className="text-sm text-gray-500 truncate max-w-md">
                          {user.last_message}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatTime(user.last_message_time)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chat görünümü
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Kullanıcı Listesi */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Mesajlar</h1>
          <button
            onClick={() => setView("stats")}
            className="hover:bg-emerald-700 p-2 rounded-full transition"
          >
            <BarChart3 size={20} />
          </button>
        </div>

        {/* Arama */}
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Kullanıcı ara..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Kullanıcı Listesi */}
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Users size={48} className="mb-2" />
              <p>Kullanıcı bulunamadı</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.user_id}
                onClick={() => setSelectedUser(user.user_id)}
                className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 transition ${
                  selectedUser === user.user_id ? "bg-emerald-50" : ""
                }`}
              >
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <User size={24} className="text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {user.user_id}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {formatTime(user.last_message_time)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {user.last_direction === "out" && "✓ "}
                    {user.last_message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mesajlaşma Alanı */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="bg-emerald-600 text-white p-4 flex items-center shadow">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                <User size={20} />
              </div>
              <div>
                <h2 className="font-semibold">{selectedUser}</h2>
                <p className="text-xs text-emerald-100">
                  {messages.length} mesaj
                </p>
              </div>
            </div>

            {/* Mesajlar */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date}>
                  {/* Tarih Ayırıcı */}
                  <div className="flex justify-center my-4">
                    <span className="bg-white px-3 py-1 rounded-lg text-xs text-gray-600 shadow-sm">
                      {date}
                    </span>
                  </div>

                  {/* Mesajlar */}
                  {msgs.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex mb-3 ${
                        msg.direction === "out"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-md px-4 py-2 rounded-lg shadow-sm ${
                          msg.direction === "out"
                            ? "bg-emerald-500 text-white rounded-br-none"
                            : "bg-white text-gray-900 rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm break-words whitespace-pre-wrap">
                          {msg.message}
                        </p>
                        <div className="flex items-center justify-end mt-1 space-x-1">
                          <span
                            className={`text-xs ${
                              msg.direction === "out"
                                ? "text-emerald-100"
                                : "text-gray-500"
                            }`}
                          >
                            {formatTime(msg.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Mesaj Gönderme Alanı (Devre dışı) */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Bu görünüm sadece okuma modundadır..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none bg-gray-50"
                  disabled
                />
                <button
                  className="bg-gray-300 text-gray-500 p-3 rounded-full cursor-not-allowed"
                  disabled
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <MessageSquare size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg">
                Mesajlaşmaya başlamak için bir kullanıcı seçin
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

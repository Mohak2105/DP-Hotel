import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, CalendarCheck, BedDouble, MessageSquare, PartyPopper,
  LogOut, Users, IndianRupee, TrendingUp, Clock, Eye, Trash2,
  Check, X, Plus, Edit3, Mail, Phone, ChevronDown, RefreshCw,
  ArrowLeft, Lock, User, AlertCircle, CheckCircle2
} from "lucide-react";
import { authAPI, roomsAPI, adminAPI } from "../services/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import "./AdminPanel.css";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "bookings", label: "Bookings", icon: CalendarCheck },
  { id: "rooms", label: "Rooms", icon: BedDouble },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "events", label: "Events", icon: PartyPopper },
];

const STATUS_COLORS = {
  confirmed: "#22c55e",
  pending: "#f59e0b",
  cancelled: "#ef4444",
  checked_in: "#3b82f6",
  checked_out: "#8b5cf6",
  completed: "#22c55e",
  refunded: "#f59e0b",
  failed: "#ef4444",
  approved: "#22c55e",
  rejected: "#ef4444",
};

const CHART_COLORS = ["#c9a86c", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

const AdminPanel = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Login state
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Data state
  const [bookingStats, setBookingStats] = useState(null);
  const [paymentStats, setPaymentStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [events, setEvents] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // Room form
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({
    name: "", room_type: "deluxe", price_per_night: "", description: "",
    capacity: "2", floor: "1", amenities: "WiFi, TV, AC, Mini Bar",
    images: "", status: "available"
  });

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    try {
      const res = await authAPI.getProfile();
      if (res.success && res.data.user.role === "admin") {
        setIsAuthenticated(true);
        setIsAdmin(true);
      } else {
        setIsAuthenticated(true);
        setIsAdmin(false);
      }
    } catch {
      localStorage.removeItem("token");
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await authAPI.login(loginData);
      if (res.success) {
        localStorage.setItem("token", res.data.token);
        const profile = await authAPI.getProfile();
        if (profile.success && profile.data.user.role === "admin") {
          setIsAuthenticated(true);
          setIsAdmin(true);
        } else {
          setLoginError("Access denied. This account does not have admin privileges.");
          localStorage.removeItem("token");
        }
      }
    } catch (err) {
      setLoginError(err.message || "Invalid credentials");
    }
    setLoginLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setIsAdmin(false);
    setLoginData({ email: "", password: "" });
  };

  // Data loading
  const loadDashboardData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [bStats, pStats, bList, rList] = await Promise.all([
        adminAPI.getBookingStats().catch(() => null),
        adminAPI.getPaymentStats().catch(() => null),
        adminAPI.getAllBookings().catch(() => null),
        roomsAPI.getAll().catch(() => null),
      ]);
      if (bStats?.success) setBookingStats(bStats.data);
      if (pStats?.success) setPaymentStats(pStats.data);
      if (bList?.success) setBookings(bList.data.bookings || bList.data || []);
      if (rList?.success) setRooms(rList.data.rooms || rList.data || []);
    } catch (err) {
      console.error("Dashboard load error:", err);
    }
    setDataLoading(false);
  }, []);

  const loadBookings = useCallback(async () => {
    setDataLoading(true);
    try {
      const res = await adminAPI.getAllBookings();
      if (res.success) setBookings(res.data.bookings || res.data || []);
    } catch (err) { console.error(err); }
    setDataLoading(false);
  }, []);

  const loadRooms = useCallback(async () => {
    setDataLoading(true);
    try {
      const res = await roomsAPI.getAll();
      if (res.success) setRooms(res.data.rooms || res.data || []);
    } catch (err) { console.error(err); }
    setDataLoading(false);
  }, []);

  const loadMessages = useCallback(async () => {
    setDataLoading(true);
    try {
      const res = await adminAPI.getAllMessages();
      if (res.success) setMessages(res.data.messages || res.data || []);
    } catch (err) { console.error(err); }
    setDataLoading(false);
  }, []);

  const loadEvents = useCallback(async () => {
    setDataLoading(true);
    try {
      const res = await adminAPI.getAllEvents();
      if (res.success) setEvents(res.data.events || res.data || []);
    } catch (err) { console.error(err); }
    setDataLoading(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    if (activeTab === "dashboard") loadDashboardData();
    else if (activeTab === "bookings") loadBookings();
    else if (activeTab === "rooms") loadRooms();
    else if (activeTab === "messages") loadMessages();
    else if (activeTab === "events") loadEvents();
  }, [activeTab, isAuthenticated, isAdmin, loadDashboardData, loadBookings, loadRooms, loadMessages, loadEvents]);

  // Actions
  const showNotification = (msg, isError = false) => {
    if (isError) { setActionError(msg); setTimeout(() => setActionError(""), 4000); }
    else { setActionSuccess(msg); setTimeout(() => setActionSuccess(""), 4000); }
  };

  const handleUpdateBookingStatus = async (id, status) => {
    try {
      await adminAPI.updateBookingStatus(id, status);
      showNotification(`Booking ${status} successfully`);
      loadBookings();
    } catch (err) { showNotification(err.message, true); }
  };

  const handleMarkRead = async (id) => {
    try {
      await adminAPI.markMessageRead(id);
      showNotification("Message marked as read");
      loadMessages();
    } catch (err) { showNotification(err.message, true); }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await adminAPI.deleteMessage(id);
      showNotification("Message deleted");
      loadMessages();
    } catch (err) { showNotification(err.message, true); }
  };

  const handleEventStatus = async (id, status) => {
    try {
      await adminAPI.updateEventStatus(id, status);
      showNotification(`Event ${status} successfully`);
      loadEvents();
    } catch (err) { showNotification(err.message, true); }
  };

  const openRoomForm = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setRoomForm({
        name: room.name || "",
        room_type: room.room_type || "deluxe",
        price_per_night: room.price_per_night || "",
        description: room.description || "",
        capacity: room.capacity || "2",
        floor: room.floor || "1",
        amenities: Array.isArray(room.amenities) ? room.amenities.join(", ") : (room.amenities || ""),
        images: Array.isArray(room.images) ? room.images.join(", ") : (room.images || ""),
        status: room.status || "available",
      });
    } else {
      setEditingRoom(null);
      setRoomForm({
        name: "", room_type: "deluxe", price_per_night: "", description: "",
        capacity: "2", floor: "1", amenities: "WiFi, TV, AC, Mini Bar",
        images: "", status: "available"
      });
    }
    setShowRoomForm(true);
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...roomForm,
        price_per_night: parseFloat(roomForm.price_per_night),
        capacity: parseInt(roomForm.capacity),
        floor: parseInt(roomForm.floor),
        amenities: roomForm.amenities.split(",").map(a => a.trim()).filter(Boolean),
        images: roomForm.images ? roomForm.images.split(",").map(i => i.trim()).filter(Boolean) : [],
      };
      if (editingRoom) {
        await adminAPI.updateRoom(editingRoom.id, payload);
        showNotification("Room updated successfully");
      } else {
        await adminAPI.createRoom(payload);
        showNotification("Room created successfully");
      }
      setShowRoomForm(false);
      loadRooms();
    } catch (err) { showNotification(err.message, true); }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch { return String(d); }
  };

  const formatCurrency = (n) => {
    if (!n && n !== 0) return "₹0";
    return `₹${parseFloat(n).toLocaleString("en-IN")}`;
  };

  // ─── LOADING SCREEN ───
  if (loading) return (
    <div className="admin-loading-screen">
      <div className="admin-spinner" />
      <span>Loading...</span>
    </div>
  );

  // ─── LOGIN SCREEN ───
  if (!isAuthenticated || !isAdmin) return (
    <div className="admin-login-page">
      <div className="admin-login-bg" />
      <div className="admin-login-card">
        <button className="admin-login-back" onClick={() => navigate("/")}>
          <ArrowLeft size={16} /> Back to Website
        </button>
        <div className="admin-login-header">
          <div className="admin-login-icon"><Lock size={28} /></div>
          <h1>Admin Portal</h1>
          <p>Sign in with your admin credentials</p>
        </div>
        {loginError && (
          <div className="admin-login-error">
            <AlertCircle size={16} /> {loginError}
          </div>
        )}
        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="admin-form-group">
            <label><Mail size={14} /> Email</label>
            <input
              type="email" placeholder="admin@dphotel.com" required
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
            />
          </div>
          <div className="admin-form-group">
            <label><Lock size={14} /> Password</label>
            <input
              type="password" placeholder="Enter password" required
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            />
          </div>
          <button type="submit" className="admin-login-btn" disabled={loginLoading}>
            {loginLoading ? <><span className="admin-spinner-sm" /> Signing in...</> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );

  // ─── Prepare chart data ───
  const bookingStatusData = bookings.length > 0
    ? Object.entries(bookings.reduce((acc, b) => { acc[b.status] = (acc[b.status] || 0) + 1; return acc; }, {}))
      .map(([name, value]) => ({ name, value }))
    : [];

  const roomTypeData = rooms.length > 0
    ? Object.entries(rooms.reduce((acc, r) => { acc[r.room_type] = (acc[r.room_type] || 0) + 1; return acc; }, {}))
      .map(([name, value]) => ({ name, value }))
    : [];

  // ─── DASHBOARD TAB ───
  const renderDashboard = () => (
    <div className="admin-dashboard">
      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "rgba(201,168,108,0.15)", color: "#c9a86c" }}>
            <CalendarCheck size={22} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Total Bookings</span>
            <span className="admin-stat-value">{bookingStats?.totalBookings ?? bookings.length}</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>
            <IndianRupee size={22} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Total Revenue</span>
            <span className="admin-stat-value">{formatCurrency(paymentStats?.totalRevenue ?? 0)}</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "rgba(59,130,246,0.15)", color: "#3b82f6" }}>
            <BedDouble size={22} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Total Rooms</span>
            <span className="admin-stat-value">{rooms.length}</span>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: "rgba(139,92,246,0.15)", color: "#8b5cf6" }}>
            <MessageSquare size={22} />
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Messages</span>
            <span className="admin-stat-value">{messages.length || "—"}</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="admin-charts-grid">
        {bookingStatusData.length > 0 && (
          <div className="admin-chart-card">
            <h3>Bookings by Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={bookingStatusData}>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "#1a1d2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f0e6d3" }}
                />
                <Bar dataKey="value" fill="#c9a86c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {roomTypeData.length > 0 && (
          <div className="admin-chart-card">
            <h3>Rooms by Type</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={roomTypeData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                  {roomTypeData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#1a1d2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f0e6d3" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent Bookings */}
      {bookings.length > 0 && (
        <div className="admin-table-card">
          <div className="admin-table-header">
            <h3>Recent Bookings</h3>
            <button className="admin-btn-text" onClick={() => setActiveTab("bookings")}>View All →</button>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th><th>Room</th><th>Check-in</th><th>Check-out</th><th>Status</th><th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map(b => (
                  <tr key={b.id}>
                    <td className="admin-id-cell">#{(b.id || "").toString().slice(0, 8)}</td>
                    <td>{b.room?.name || b.roomId?.slice(0, 8) || "—"}</td>
                    <td>{formatDate(b.checkInDate || b.check_in_date)}</td>
                    <td>{formatDate(b.checkOutDate || b.check_out_date)}</td>
                    <td><span className="admin-status-badge" style={{ background: `${STATUS_COLORS[b.status] || "#666"}22`, color: STATUS_COLORS[b.status] || "#666" }}>{b.status}</span></td>
                    <td className="admin-amount-cell">{formatCurrency(b.totalAmount || b.total_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  // ─── BOOKINGS TAB ───
  const renderBookings = () => (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>All Bookings</h2>
        <button className="admin-btn-icon" onClick={loadBookings}><RefreshCw size={16} /></button>
      </div>
      {bookings.length === 0 ? (
        <div className="admin-empty">No bookings found.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>Guest</th><th>Room</th><th>Check-in</th><th>Check-out</th><th>Guests</th><th>Status</th><th>Amount</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td className="admin-id-cell">#{(b.id || "").toString().slice(0, 8)}</td>
                  <td>{b.user?.firstName || b.user?.email || "—"}</td>
                  <td>{b.room?.name || "—"}</td>
                  <td>{formatDate(b.checkInDate || b.check_in_date)}</td>
                  <td>{formatDate(b.checkOutDate || b.check_out_date)}</td>
                  <td>{b.guests || b.number_of_guests || "—"}</td>
                  <td><span className="admin-status-badge" style={{ background: `${STATUS_COLORS[b.status] || "#666"}22`, color: STATUS_COLORS[b.status] || "#666" }}>{b.status}</span></td>
                  <td className="admin-amount-cell">{formatCurrency(b.totalAmount || b.total_amount)}</td>
                  <td>
                    <div className="admin-action-btns">
                      {b.status === "pending" && (
                        <>
                          <button className="admin-btn-sm admin-btn-success" onClick={() => handleUpdateBookingStatus(b.id, "confirmed")}><Check size={14} /></button>
                          <button className="admin-btn-sm admin-btn-danger" onClick={() => handleUpdateBookingStatus(b.id, "cancelled")}><X size={14} /></button>
                        </>
                      )}
                      {b.status === "confirmed" && (
                        <button className="admin-btn-sm admin-btn-primary" onClick={() => handleUpdateBookingStatus(b.id, "checked_in")}>Check In</button>
                      )}
                      {b.status === "checked_in" && (
                        <button className="admin-btn-sm admin-btn-primary" onClick={() => handleUpdateBookingStatus(b.id, "checked_out")}>Check Out</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // ─── ROOMS TAB ───
  const renderRooms = () => (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Room Management</h2>
        <div className="admin-header-actions">
          <button className="admin-btn-icon" onClick={loadRooms}><RefreshCw size={16} /></button>
          <button className="admin-btn-gold" onClick={() => openRoomForm()}><Plus size={16} /> Add Room</button>
        </div>
      </div>

      {/* Room Form Modal */}
      {showRoomForm && (
        <div className="admin-modal-overlay" onClick={() => setShowRoomForm(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingRoom ? "Edit Room" : "Add New Room"}</h3>
              <button onClick={() => setShowRoomForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleRoomSubmit} className="admin-room-form">
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Room Name</label>
                  <input type="text" value={roomForm.name} onChange={e => setRoomForm({...roomForm, name: e.target.value})} required placeholder="e.g. Deluxe King Suite" />
                </div>
                <div className="admin-form-group">
                  <label>Room Type</label>
                  <select value={roomForm.room_type} onChange={e => setRoomForm({...roomForm, room_type: e.target.value})}>
                    <option value="deluxe">Deluxe</option>
                    <option value="executive">Executive</option>
                    <option value="suite">Suite</option>
                  </select>
                </div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>Price/Night (₹)</label>
                  <input type="number" value={roomForm.price_per_night} onChange={e => setRoomForm({...roomForm, price_per_night: e.target.value})} required placeholder="5000" />
                </div>
                <div className="admin-form-group">
                  <label>Capacity</label>
                  <input type="number" value={roomForm.capacity} onChange={e => setRoomForm({...roomForm, capacity: e.target.value})} placeholder="2" />
                </div>
                <div className="admin-form-group">
                  <label>Floor</label>
                  <input type="number" value={roomForm.floor} onChange={e => setRoomForm({...roomForm, floor: e.target.value})} placeholder="1" />
                </div>
              </div>
              <div className="admin-form-group">
                <label>Description</label>
                <textarea value={roomForm.description} onChange={e => setRoomForm({...roomForm, description: e.target.value})} rows={3} placeholder="Spacious room with city view..." />
              </div>
              <div className="admin-form-group">
                <label>Amenities (comma-separated)</label>
                <input type="text" value={roomForm.amenities} onChange={e => setRoomForm({...roomForm, amenities: e.target.value})} placeholder="WiFi, TV, AC, Mini Bar" />
              </div>
              <div className="admin-form-group">
                <label>Status</label>
                <select value={roomForm.status} onChange={e => setRoomForm({...roomForm, status: e.target.value})}>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn-secondary" onClick={() => setShowRoomForm(false)}>Cancel</button>
                <button type="submit" className="admin-btn-gold">{editingRoom ? "Update Room" : "Create Room"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {rooms.length === 0 ? (
        <div className="admin-empty">No rooms found.</div>
      ) : (
        <div className="admin-rooms-grid">
          {rooms.map(room => (
            <div key={room.id} className="admin-room-card">
              <div className="admin-room-card-header">
                <h4>{room.name}</h4>
                <span className="admin-room-type">{room.room_type}</span>
              </div>
              <div className="admin-room-card-body">
                <div className="admin-room-detail"><IndianRupee size={14} /><span>{formatCurrency(room.price_per_night)}/night</span></div>
                <div className="admin-room-detail"><Users size={14} /><span>Capacity: {room.capacity}</span></div>
                <div className="admin-room-detail"><BedDouble size={14} /><span>Floor: {room.floor}</span></div>
                <span className="admin-status-badge" style={{ background: room.status === "available" ? "#22c55e22" : "#f59e0b22", color: room.status === "available" ? "#22c55e" : "#f59e0b" }}>{room.status}</span>
              </div>
              {room.amenities && (
                <div className="admin-room-amenities">
                  {(Array.isArray(room.amenities) ? room.amenities : []).slice(0, 4).map((a, i) => (
                    <span key={i} className="admin-amenity-chip">{a}</span>
                  ))}
                </div>
              )}
              <button className="admin-btn-sm admin-btn-outline" onClick={() => openRoomForm(room)}>
                <Edit3 size={14} /> Edit
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── MESSAGES TAB ───
  const renderMessages = () => (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Customer Messages</h2>
        <button className="admin-btn-icon" onClick={loadMessages}><RefreshCw size={16} /></button>
      </div>
      {messages.length === 0 ? (
        <div className="admin-empty">No messages yet.</div>
      ) : (
        <div className="admin-messages-list">
          {messages.map(msg => (
            <div key={msg.id} className={`admin-message-card ${msg.is_read || msg.isRead ? "read" : "unread"}`}>
              <div className="admin-message-top">
                <div className="admin-message-sender">
                  <strong>{msg.name || msg.senderName || "Guest"}</strong>
                  <span className="admin-message-meta">
                    {msg.email && <><Mail size={12} /> {msg.email}</>}
                    {msg.phone && <><Phone size={12} /> {msg.phone}</>}
                  </span>
                </div>
                <span className="admin-message-date">{formatDate(msg.createdAt || msg.created_at)}</span>
              </div>
              {msg.subject && <div className="admin-message-subject">{msg.subject}</div>}
              <p className="admin-message-body">{msg.message || msg.content}</p>
              <div className="admin-action-btns">
                {!(msg.is_read || msg.isRead) && (
                  <button className="admin-btn-sm admin-btn-outline" onClick={() => handleMarkRead(msg.id)}>
                    <Eye size={14} /> Mark Read
                  </button>
                )}
                <button className="admin-btn-sm admin-btn-danger" onClick={() => handleDeleteMessage(msg.id)}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── EVENTS TAB ───
  const renderEvents = () => (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>Event Bookings</h2>
        <button className="admin-btn-icon" onClick={loadEvents}><RefreshCw size={16} /></button>
      </div>
      {events.length === 0 ? (
        <div className="admin-empty">No event bookings yet.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Event</th><th>Type</th><th>Date</th><th>Guests</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id}>
                  <td>{ev.event_name || ev.eventName || "—"}</td>
                  <td>{ev.event_type || ev.eventType || "—"}</td>
                  <td>{formatDate(ev.event_date || ev.eventDate)}</td>
                  <td>{ev.expected_guests || ev.expectedGuests || "—"}</td>
                  <td><span className="admin-status-badge" style={{ background: `${STATUS_COLORS[ev.status] || "#666"}22`, color: STATUS_COLORS[ev.status] || "#666" }}>{ev.status}</span></td>
                  <td>
                    <div className="admin-action-btns">
                      {ev.status === "pending" && (
                        <>
                          <button className="admin-btn-sm admin-btn-success" onClick={() => handleEventStatus(ev.id, "approved")}><Check size={14} /> Approve</button>
                          <button className="admin-btn-sm admin-btn-danger" onClick={() => handleEventStatus(ev.id, "rejected")}><X size={14} /> Reject</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // ─── MAIN LAYOUT ───
  return (
    <div className="admin-page">
      {/* Notification Toasts */}
      {actionSuccess && (
        <div className="admin-toast admin-toast-success"><CheckCircle2 size={16} /> {actionSuccess}</div>
      )}
      {actionError && (
        <div className="admin-toast admin-toast-error"><AlertCircle size={16} /> {actionError}</div>
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="admin-sidebar-header">
          <a href="/" className="admin-logo">
            <img src="/favicon.png" alt="DP" className="admin-logo-img" />
            <span className="admin-logo-text">
              <span className="admin-logo-gold">Deccan</span>
              <span>Admin</span>
            </span>
          </a>
        </div>
        <nav className="admin-sidebar-nav">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`admin-nav-btn ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="admin-sidebar-footer">
          <button className="admin-nav-btn admin-logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="admin-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-topbar">
          <button className="admin-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span /><span /><span />
          </button>
          <h1 className="admin-page-title">{TABS.find(t => t.id === activeTab)?.label}</h1>
          {dataLoading && <span className="admin-spinner-sm" />}
        </header>

        <div className="admin-content">
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "bookings" && renderBookings()}
          {activeTab === "rooms" && renderRooms()}
          {activeTab === "messages" && renderMessages()}
          {activeTab === "events" && renderEvents()}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;

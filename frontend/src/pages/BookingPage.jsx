import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Calendar, Users, CreditCard, Check, ChevronLeft, ChevronRight,
  Wifi, Tv, Coffee, Bath, Bed, MapPin, Phone, Mail, User,
  Star, Shield, Clock, ArrowLeft, Sparkles, CircleCheck, X
} from "lucide-react";
import { roomsAPI, authAPI, bookingsAPI, paymentsAPI } from "../services/api";
import { TextField, TextArea } from "../components/ui/TextField";
import CustomSelect from "../components/ui/CustomSelect";
import { QRCodeSVG } from "qrcode.react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./BookingPage.css";

// Import room images
import roomSuite from "../assets/room-suite.jpg";
import roomExecutive from "../assets/room-executive.jpg";
import roomDeluxe from "../assets/room-deluxe.jpg";
import heroHotel from "../assets/hero-hotel.jpg";
// Dynamic UPI QR is generated at runtime using qrcode.react

const roomImages = {
  'suite': roomSuite,
  'executive': roomExecutive,
  'deluxe': roomDeluxe,
};

const AMENITY_ICONS = {
  'WiFi': Wifi,
  'TV': Tv,
  'Coffee': Coffee,
  'Bathroom': Bath,
};

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const roomId = searchParams.get('roomId');
  const roomType = searchParams.get('type');
  const checkInParam = searchParams.get('checkIn');
  const checkOutParam = searchParams.get('checkOut');
  const guestsParam = searchParams.get('guests');

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [bookingData, setBookingData] = useState({
    checkIn: checkInParam ? new Date(checkInParam) : null,
    checkOut: checkOutParam ? new Date(checkOutParam) : null,
    guests: guestsParam || '2',
  });

  const [guestData, setGuestData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    specialRequests: '',
  });

  const [useGst, setUseGst] = useState(false);
  const [gstDetails, setGstDetails] = useState({
    gstNo: '',
    companyName: '',
  });

  const [cardData, setCardData] = useState({
    name: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState('upi_qr');
  const [upiTransactionId, setUpiTransactionId] = useState('');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [selectedBank, setSelectedBank] = useState('');

  useEffect(() => {
    fetchRooms();
    fetchPaymentMethods();
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.getProfile();
        if (response.success) {
          setIsLoggedIn(true);
          setGuestData(prev => ({
            ...prev,
            firstName: response.data.user.firstName || '',
            lastName: response.data.user.lastName || '',
            email: response.data.user.email || '',
            phone: response.data.user.phone || '',
          }));
        }
      } catch (err) {
        localStorage.removeItem('token');
      }
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await roomsAPI.getAll();
      if (response.success) {
        setRooms(response.data.rooms);
        if (roomId) {
          const room = response.data.rooms.find(r => r.id === roomId);
          if (room) {
            setSelectedRoom(room);
            setCurrentStep(2);
          }
        } else if (roomType) {
          const normalized = roomType.toLowerCase().replace(/[-_]/g, ' ');
          const room = response.data.rooms.find(r => 
            r.room_type?.toLowerCase() === roomType.toLowerCase() ||
            (r.name && r.name.toLowerCase().includes(normalized)) ||
            (r.room_type && normalized.includes(r.room_type.toLowerCase()))
          );
          if (room) {
            setSelectedRoom(room);
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await paymentsAPI.getMethods();
      if (response.success) {
        setPaymentMethods(response.data.methods);
      }
    } catch (err) {
      console.error('Failed to fetch payment methods:', err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await authAPI.login(loginData);
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        setIsLoggedIn(true);
        setShowLogin(false);
        setGuestData(prev => ({
          ...prev,
          firstName: response.data.user.firstName || '',
          lastName: response.data.user.lastName || '',
          email: response.data.user.email || '',
          phone: response.data.user.phone || '',
        }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isLoggedIn) {
        const registerResponse = await authAPI.register({
          email: guestData.email,
          password: 'temp' + Date.now(),
          firstName: guestData.firstName,
          lastName: guestData.lastName,
          phone: guestData.phone,
          address: guestData.address,
        });
        if (registerResponse.success) {
          localStorage.setItem('token', registerResponse.data.token);
          setIsLoggedIn(true);
        }
      }

      const bookingResponse = await bookingsAPI.create({
        roomId: selectedRoom.id,
        checkInDate: formatDateForAPI(bookingData.checkIn),
        checkOutDate: formatDateForAPI(bookingData.checkOut),
        guests: parseInt(bookingData.guests),
        specialRequests: guestData.specialRequests,
        gstNumber: useGst ? gstDetails.gstNo : null,
        companyName: useGst ? gstDetails.companyName : null,
      });

      if (bookingResponse.success) {
        setBookingResult(bookingResponse.data.booking);

        let backendPaymentMethod = selectedPayment;
        if (selectedPayment === 'upi_qr') backendPaymentMethod = 'upi';
        if (selectedPayment === 'pay_at_hotel') backendPaymentMethod = 'cash';

        const paymentResponse = await paymentsAPI.initiate({
          bookingId: bookingResponse.data.booking.id,
          paymentMethod: backendPaymentMethod,
          upiId: upiTransactionId || null,
        });

        if (paymentResponse.success) {
          const processResponse = await paymentsAPI.process(
            paymentResponse.data.payment.id,
            { upiTransactionId }
          );

          if (processResponse.success) {
            window.scrollTo(0, 0);
            setCurrentStep(4);
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForAPI = (date) => {
    if (!date) return '';
    if (date instanceof Date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    const parts = String(date).split('/');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return date;
  };

  const formatDisplayDate = (date) => {
    if (!date) return '—';
    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d)) return String(date);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return String(date);
    }
  };

  const calculateTotalNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const checkIn = new Date(formatDateForAPI(bookingData.checkIn));
    const checkOut = new Date(formatDateForAPI(bookingData.checkOut));
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const calculateTotalPrice = () => {
    if (!selectedRoom) return 0;
    const nights = calculateTotalNights();
    return nights * parseFloat(selectedRoom.price_per_night);
  };

  const calculateTaxes = () => {
    return Math.round(calculateTotalPrice() * 0.18);
  };

  const getRoomImage = (room) => roomImages[room.room_type] || roomDeluxe;

  const steps = [
    { num: 1, label: 'Select Room', icon: Bed },
    { num: 2, label: 'Guest Details', icon: User },
    { num: 3, label: 'Payment', icon: CreditCard },
    { num: 4, label: 'Confirmation', icon: CircleCheck },
  ];

  // ─── PROGRESS BAR ───
  const renderProgressBar = () => (
    <div className="bp-progress-bar">
      {steps.map((step, idx) => (
        <div key={step.num} className="bp-progress-step-wrap">
          <div
            className={`bp-progress-step ${currentStep >= step.num ? 'active' : ''} ${currentStep > step.num ? 'completed' : ''}`}
            onClick={() => {
              if (currentStep > step.num) setCurrentStep(step.num);
            }}
          >
            <div className="bp-step-num">
              {currentStep > step.num ? <Check size={14} /> : step.num}
            </div>
            <span className="bp-step-text">{step.label}</span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`bp-step-line ${currentStep > step.num ? 'filled' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );

  // ─── STICKY SIDEBAR ───
  const renderSidebar = () => (
    <aside className="bp-sidebar">
      <div className="bp-sidebar-card">
        {selectedRoom && (
          <>
            <div className="bp-sidebar-img-wrap">
              <img src={getRoomImage(selectedRoom)} alt={selectedRoom.name} />
              <div className="bp-sidebar-badge">
                <Star size={12} /> Premium
              </div>
            </div>
            <div className="bp-sidebar-room-info">
              <h3>{selectedRoom.name}</h3>
              <span className="bp-sidebar-type">{selectedRoom.room_type}</span>
            </div>
          </>
        )}

        <div className="bp-sidebar-details">
          <div className="bp-sidebar-row">
            <div className="bp-sidebar-detail">
              <Calendar size={14} />
              <div>
                <span className="bp-detail-label">Check-in</span>
                <span className="bp-detail-value">{formatDisplayDate(bookingData.checkIn)}</span>
              </div>
            </div>
            <div className="bp-sidebar-detail">
              <Calendar size={14} />
              <div>
                <span className="bp-detail-label">Check-out</span>
                <span className="bp-detail-value">{formatDisplayDate(bookingData.checkOut)}</span>
              </div>
            </div>
          </div>
          <div className="bp-sidebar-row">
            <div className="bp-sidebar-detail">
              <Users size={14} />
              <div>
                <span className="bp-detail-label">Guests</span>
                <span className="bp-detail-value">{bookingData.guests} Guest{bookingData.guests > 1 ? 's' : ''}</span>
              </div>
            </div>
            <div className="bp-sidebar-detail">
              <Clock size={14} />
              <div>
                <span className="bp-detail-label">Duration</span>
                <span className="bp-detail-value">{calculateTotalNights()} Night{calculateTotalNights() !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {selectedRoom && (
          <div className="bp-sidebar-pricing">
            <div className="bp-price-row">
              <span>₹{parseFloat(selectedRoom.price_per_night).toLocaleString()} × {calculateTotalNights()} night{calculateTotalNights() !== 1 ? 's' : ''}</span>
              <span>₹{calculateTotalPrice().toLocaleString()}</span>
            </div>
            <div className="bp-price-row">
              <span>Taxes & Fees (18% GST)</span>
              <span>₹{calculateTaxes().toLocaleString()}</span>
            </div>
            <div className="bp-price-divider" />
            <div className="bp-price-row bp-price-total">
              <span>Total</span>
              <span>₹{(calculateTotalPrice() + calculateTaxes()).toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="bp-sidebar-trust">
          <div className="bp-trust-item">
            <Shield size={14} />
            <span>Secure 256-bit SSL Encryption</span>
          </div>
          <div className="bp-trust-item">
            <Clock size={14} />
            <span>Free cancellation up to 24hrs</span>
          </div>
          <div className="bp-trust-item">
            <Sparkles size={14} />
            <span>Best price guarantee</span>
          </div>
        </div>
      </div>
    </aside>
  );

  // ─── STEP 1: ROOM SELECTION ───
  const renderRoomSelection = () => (
    <div className="bp-form-area">
      <div className="bp-section-head">
        <h2>Choose Your Room</h2>
        <p>Select your preferred dates and find the perfect room for your stay.</p>
      </div>

      <div className="bp-date-bar">
        <div className="bp-date-bar-field">
          <label className="bp-datepicker-label"><Calendar size={14} /> Check-in</label>
          <DatePicker
            selected={bookingData.checkIn}
            onChange={(date) => setBookingData({ ...bookingData, checkIn: date })}
            selectsStart
            startDate={bookingData.checkIn}
            endDate={bookingData.checkOut}
            minDate={new Date()}
            dateFormat="dd MMM yyyy"
            placeholderText="Select date"
            className="bp-datepicker-input"
            calendarClassName="bp-datepicker-calendar"
          />
        </div>
        <div className="bp-date-bar-field">
          <label className="bp-datepicker-label"><Calendar size={14} /> Check-out</label>
          <DatePicker
            selected={bookingData.checkOut}
            onChange={(date) => setBookingData({ ...bookingData, checkOut: date })}
            selectsEnd
            startDate={bookingData.checkIn}
            endDate={bookingData.checkOut}
            minDate={bookingData.checkIn || new Date()}
            dateFormat="dd MMM yyyy"
            placeholderText="Select date"
            className="bp-datepicker-input"
            calendarClassName="bp-datepicker-calendar"
          />
        </div>
        <div className="bp-date-bar-field bp-guest-select">
          <label className="bp-guest-label"><Users size={14} /> Guests</label>
          <CustomSelect
            value={bookingData.guests}
            onChange={(value) => setBookingData({ ...bookingData, guests: value })}
            options={[1, 2, 3, 4].map(n => ({ value: String(n), label: `${n} Guest${n > 1 ? 's' : ''}` }))}
          />
        </div>
      </div>

      <div className="bp-rooms-list">
        {rooms.map(room => (
          <div
            key={room.id}
            className={`bp-room-card ${selectedRoom?.id === room.id ? 'selected' : ''}`}
            onClick={() => setSelectedRoom(room)}
          >
            <div className="bp-room-img-wrap">
              <img src={getRoomImage(room)} alt={room.name} />
              {selectedRoom?.id === room.id && (
                <div className="bp-room-selected-overlay">
                  <CircleCheck size={32} />
                </div>
              )}
            </div>
            <div className="bp-room-info">
              <div className="bp-room-header">
                <div>
                  <h3>{room.name}</h3>
                  <span className="bp-room-type-tag">{room.room_type}</span>
                </div>
                <div className="bp-room-price-block">
                  <span className="bp-room-price">₹{parseFloat(room.price_per_night).toLocaleString()}</span>
                  <span className="bp-per-night">/ night</span>
                </div>
              </div>
              <p className="bp-room-desc">{room.description}</p>
              <div className="bp-room-amenities-row">
                {room.amenities?.slice(0, 5).map((amenity, idx) => (
                  <span key={idx} className="bp-amenity-chip">{amenity}</span>
                ))}
              </div>
              <button
                className={`bp-select-room-btn ${selectedRoom?.id === room.id ? 'selected' : ''}`}
                onClick={(e) => { e.stopPropagation(); setSelectedRoom(room); }}
              >
                {selectedRoom?.id === room.id ? (
                  <><Check size={16} /> Selected</>
                ) : (
                  'Select Room'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bp-step-nav">
        <button className="bp-btn-secondary" onClick={() => navigate('/')}>
          <ArrowLeft size={18} /> Back to Home
        </button>
        <button
          className="bp-btn-primary"
          disabled={!selectedRoom || !bookingData.checkIn || !bookingData.checkOut}
          onClick={() => setCurrentStep(2)}
        >
          Continue <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );

  // ─── STEP 2: GUEST DETAILS ───
  const renderGuestDetails = () => (
    <div className="bp-form-area">
      <div className="bp-section-head">
        <h2>Guest Information</h2>
        <p>Please provide your details for the reservation.</p>
      </div>

      {!isLoggedIn && (
        <div className="bp-login-banner">
          <div className="bp-login-banner-text">
            <User size={18} />
            <div>
              <strong>Already have an account?</strong>
              <p>Sign in for a faster checkout experience.</p>
            </div>
          </div>
          <button className="bp-login-trigger" onClick={() => setShowLogin(true)}>Sign In</button>
        </div>
      )}

      {showLogin && (
        <div className="bp-modal-overlay" onClick={() => setShowLogin(false)}>
          <div className="bp-modal" onClick={e => e.stopPropagation()}>
            <button className="bp-modal-close" onClick={() => setShowLogin(false)}><X size={20} /></button>
            <h3>Welcome Back</h3>
            <p className="bp-modal-subtitle">Sign in to your account</p>
            <form onSubmit={handleLogin} className="bp-modal-form">
              <TextField
                label="Email Address"
                icon={Mail}
                type="email"
                placeholder="you@example.com"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
              />
              <TextField
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
              <button type="submit" className="bp-btn-primary bp-btn-full">Sign In</button>
            </form>
          </div>
        </div>
      )}

      <form className="bp-guest-form">
        <div className="bp-form-grid">
          <TextField
            label="First Name"
            icon={User}
            type="text"
            placeholder="Enter first name"
            value={guestData.firstName}
            onChange={(e) => setGuestData({ ...guestData, firstName: e.target.value })}
            required
          />
          <TextField
            label="Last Name"
            icon={User}
            type="text"
            placeholder="Enter last name"
            value={guestData.lastName}
            onChange={(e) => setGuestData({ ...guestData, lastName: e.target.value })}
            required
          />
        </div>
        <div className="bp-form-grid">
          <TextField
            label="Email Address"
            icon={Mail}
            type="email"
            placeholder="Enter your email"
            value={guestData.email}
            onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
            required
          />
          <TextField
            label="Phone Number"
            icon={Phone}
            type="tel"
            placeholder="Enter phone number"
            value={guestData.phone}
            onChange={(e) => setGuestData({ ...guestData, phone: e.target.value })}
            required
          />
        </div>
        <TextField
          label="Address"
          icon={MapPin}
          type="text"
          placeholder="Enter your full address"
          value={guestData.address}
          onChange={(e) => setGuestData({ ...guestData, address: e.target.value })}
        />
        <TextArea
          label="Special Requests"
          placeholder="Early check-in, extra pillows, dietary needs..."
          value={guestData.specialRequests}
          onChange={(e) => setGuestData({ ...guestData, specialRequests: e.target.value })}
          rows={3}
        />

        <div className="bp-gst-section" style={{ marginTop: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <label className="bp-checkbox-wrap" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', fontSize: '0.9375rem' }}>
            <input
              type="checkbox"
              checked={useGst}
              onChange={(e) => setUseGst(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#c9a86c' }}
            />
            <span>Add GST details for business travel (Optional)</span>
          </label>

          {useGst && (
            <div className="bp-form-grid" style={{ marginTop: '1.25rem' }}>
              <TextField
                label="GST Number"
                type="text"
                placeholder="27AABCU9603R1ZX"
                value={gstDetails.gstNo}
                onChange={(e) => setGstDetails({ ...gstDetails, gstNo: e.target.value })}
                required={useGst}
              />
              <TextField
                label="Company Name"
                type="text"
                placeholder="Enter company name"
                value={gstDetails.companyName}
                onChange={(e) => setGstDetails({ ...gstDetails, companyName: e.target.value })}
                required={useGst}
              />
            </div>
          )}
        </div>
      </form>

      <div className="bp-step-nav">
        <button className="bp-btn-secondary" onClick={() => setCurrentStep(1)}>
          <ArrowLeft size={18} /> Back
        </button>
        <button
          className="bp-btn-primary"
          disabled={!guestData.firstName || !guestData.lastName || !guestData.email || !guestData.phone}
          onClick={() => setCurrentStep(3)}
        >
          Continue to Payment <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );

  // ─── STEP 3: PAYMENT ───
  const renderPayment = () => (
    <div className="bp-form-area">
      <div className="bp-section-head">
        <h2>Payment</h2>
        <p>Complete your payment to confirm the reservation.</p>
      </div>

      {/* Total Amount Banner */}
      <div className="bp-payment-amount-banner">
        <div className="bp-payment-amount-left">
          <span className="bp-payment-amount-label">Total Amount</span>
          <span className="bp-payment-amount-breakdown">
            {selectedRoom?.name} • {calculateTotalNights()} Night{calculateTotalNights() !== 1 ? 's' : ''} • {bookingData.guests} Guest{bookingData.guests > 1 ? 's' : ''}
          </span>
        </div>
        <div className="bp-payment-amount-right">
          <span className="bp-payment-amount-value">₹{(calculateTotalPrice() + calculateTaxes()).toLocaleString()}</span>
          <span className="bp-payment-amount-tax">incl. ₹{calculateTaxes().toLocaleString()} taxes</span>
        </div>
      </div>

      {/* Payment Layout */}
      <div className="bp-payment-layout">
        {/* Payment Methods Sidebar */}
        <div className="bp-payment-sidebar">
          <button
            className={`bp-payment-sidebar-btn ${selectedPayment === 'upi_qr' ? 'active' : ''}`}
            onClick={() => setSelectedPayment('upi_qr')}
          >
            <span className="bp-tab-icon">📱</span>
            UPI Options
          </button>
          <button
            className={`bp-payment-sidebar-btn ${selectedPayment === 'credit_card' ? 'active' : ''}`}
            onClick={() => setSelectedPayment('credit_card')}
          >
            <span className="bp-tab-icon">💳</span>
            Credit/Debit Card
          </button>
          <button
            className={`bp-payment-sidebar-btn ${selectedPayment === 'net_banking' ? 'active' : ''}`}
            onClick={() => setSelectedPayment('net_banking')}
          >
            <span className="bp-tab-icon">🏦</span>
            Net Banking
          </button>
          <button
            className={`bp-payment-sidebar-btn ${selectedPayment === 'pay_at_hotel' ? 'active' : ''}`}
            onClick={() => setSelectedPayment('pay_at_hotel')}
          >
            <span className="bp-tab-icon">🏨</span>
            Pay at Hotel
          </button>
        </div>

        {/* Payment Content */}
        <div className="bp-payment-content">
          {selectedPayment === 'upi_qr' && (
            <div className="bp-qr-section">
              <div className="bp-qr-card">
                <div className="bp-qr-header">
                  <div className="bp-qr-amount-badge">
                    <span className="bp-qr-amount-label">Amount to Pay</span>
                    <span className="bp-qr-amount-value">₹{(calculateTotalPrice() + calculateTaxes()).toLocaleString()}</span>
                  </div>
                </div>

                <div className="bp-qr-image-wrap">
                  <QRCodeSVG
                    value={`upi://pay?pa=mohaksidgonda21-1@okaxis&pn=Hotel Deccan Pavilion&am=${(calculateTotalPrice() + calculateTaxes()).toFixed(2)}&cu=INR&tn=Booking Payment - ${selectedRoom?.name || 'Room'}`}
                    size={180}
                    bgColor="#ffffff"
                    fgColor="#1a1a2e"
                    level="H"
                    includeMargin={true}
                  />
                </div>

                <div className="bp-qr-apps">
                  <span style={{ fontSize: '0.75rem', color: '#666' }}>Pay using any UPI app</span>
                  <div className="bp-qr-app-icons">
                    <span>Google Pay</span>
                    <span>•</span>
                    <span>PhonePe</span>
                    <span>•</span>
                    <span>Paytm</span>
                    <span>•</span>
                    <span>BHIM</span>
                  </div>
                </div>

                <div className="bp-qr-upi-id">
                  <span className="bp-qr-upi-label">UPI ID</span>
                  <span className="bp-qr-upi-value">mohaksidgonda21-1@okaxis</span>
                </div>
              </div>

              <div className="bp-txn-confirm">
                <TextField
                  label="UPI Transaction / Reference ID"
                  type="text"
                  placeholder="e.g. 426913823456"
                  value={upiTransactionId}
                  onChange={(e) => setUpiTransactionId(e.target.value)}
                />
                <label className="bp-checkbox-wrap" style={{ display: 'flex', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={paymentConfirmed}
                    onChange={(e) => setPaymentConfirmed(e.target.checked)}
                    style={{ accentColor: '#c9a86c', marginTop: '3px' }}
                  />
                  <span>I confirm that I have completed the UPI payment of <strong>₹{(calculateTotalPrice() + calculateTaxes()).toLocaleString()}</strong></span>
                </label>
              </div>
            </div>
          )}

          {selectedPayment === 'credit_card' && (
            <div className="bp-card-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="bp-payment-content-header">
                <h3>Enter Card Details</h3>
                <span className="bp-payment-content-amount">₹{(calculateTotalPrice() + calculateTaxes()).toLocaleString()}</span>
              </div>
              <TextField
                label="Card Number"
                type="text"
                placeholder="XXXX XXXX XXXX XXXX"
                value={cardData.cardNumber}
                onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
              />
              <TextField
                label="Name on Card"
                type="text"
                placeholder="Enter Card Number"
                value={cardData.name}
                onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
              />
              <div className="bp-form-grid">
                <TextField
                  label="Expiry (MM/YY)"
                  type="text"
                  placeholder="MM/YY"
                  value={cardData.expiry}
                  onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                />
                <TextField
                  label="CVV"
                  type="password"
                  placeholder="123"
                  value={cardData.cvv}
                  onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>🔒 Secure 256-bit SSL encrypted connection.</p>
            </div>
          )}

          {selectedPayment === 'net_banking' && (
            <div className="bp-netbanking-section">
              <div className="bp-payment-content-header">
                <h3>Select your Bank</h3>
                <span className="bp-payment-content-amount">₹{(calculateTotalPrice() + calculateTaxes()).toLocaleString()}</span>
              </div>
              <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>You will be redirected to your bank's website to complete the payment of <strong style={{ color: '#c9a86c' }}>₹{(calculateTotalPrice() + calculateTaxes()).toLocaleString()}</strong></p>
              <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Popular Banks</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank'].map(bank => (
                  <div
                    key={bank}
                    className={`bp-bank-option ${selectedBank === bank ? 'selected' : ''}`}
                    onClick={() => setSelectedBank(bank)}
                  >
                    {bank}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Other Banks</h4>
                <CustomSelect
                  value={selectedBank}
                  onChange={(val) => setSelectedBank(val)}
                  placeholder="Select from all other banks"
                  options={[
                    { value: '', label: 'Select from all other banks' },
                    { value: 'Kotak Mahindra Bank', label: 'Kotak Mahindra Bank' },
                    { value: 'Bank of Baroda', label: 'Bank of Baroda' },
                    { value: 'Punjab National Bank', label: 'Punjab National Bank' },
                    { value: 'Yes Bank', label: 'Yes Bank' },
                    { value: 'IndusInd Bank', label: 'IndusInd Bank' }
                  ]}
                />
              </div>
            </div>
          )}

          {selectedPayment === 'pay_at_hotel' && (
            <div className="bp-pay-hotel-section">
              <div className="bp-pay-hotel-icon">🏨</div>
              <h3>Pay at Hotel</h3>
              <p>Pay <strong style={{ color: '#c9a86c' }}>₹{(calculateTotalPrice() + calculateTaxes()).toLocaleString()}</strong> at the time of check-in at the front desk. We accept UPI, cash, and cards.</p>
              <div className="bp-pay-hotel-note">
                <Shield size={16} />
                <span>Your room will be held for 24 hours. Please ensure timely check-in to avoid cancellation.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && <div className="bp-error">{error}</div>}

      <div className="bp-step-nav">
        <button className="bp-btn-secondary" onClick={() => setCurrentStep(2)}>
          <ArrowLeft size={18} /> Back
        </button>
        <button
          className="bp-btn-primary bp-btn-pay"
          disabled={
            loading ||
            (selectedPayment === 'upi_qr' && (!upiTransactionId || !paymentConfirmed)) ||
            (selectedPayment === 'credit_card' && (!cardData.cardNumber || !cardData.cvv)) ||
            (selectedPayment === 'net_banking' && !selectedBank)
          }
          onClick={handleBookingSubmit}
        >
          {loading ? (
            <><span className="bp-spinner" /> Processing...</>
          ) : selectedPayment === 'pay_at_hotel' ? (
            <><Check size={16} /> Confirm Booking — ₹{(calculateTotalPrice() + calculateTaxes()).toLocaleString()}</>
          ) : (
            <><Shield size={16} /> Pay ₹{(calculateTotalPrice() + calculateTaxes()).toLocaleString()}</>
          )}
        </button>
      </div>
    </div>
  );

  // ─── STEP 4: CONFIRMATION ───
  const renderConfirmation = () => (
    <div className="bp-form-area bp-confirmation-area">
      <div className="bp-confirm-hero">
        <div className="bp-confirm-icon-wrap">
          <CircleCheck size={56} />
        </div>
        <h2>Booking Confirmed!</h2>
        <p className="bp-confirm-subtitle">
          Your reservation has been successfully placed. A confirmation email has been sent to <strong>{guestData.email}</strong>.
        </p>
      </div>

      <div className="bp-confirm-card">
        <div className="bp-confirm-card-header">
          <h3>Reservation Details</h3>
          <span className="bp-booking-id">#{bookingResult?.id?.slice(0, 8)}</span>
        </div>
        <div className="bp-confirm-grid">
          <div className="bp-confirm-item">
            <Bed size={16} />
            <div>
              <span className="bp-confirm-label">Room</span>
              <span className="bp-confirm-value">{selectedRoom?.name}</span>
            </div>
          </div>
          <div className="bp-confirm-item">
            <Calendar size={16} />
            <div>
              <span className="bp-confirm-label">Check-in</span>
              <span className="bp-confirm-value">{formatDisplayDate(bookingData.checkIn)}</span>
            </div>
          </div>
          <div className="bp-confirm-item">
            <Calendar size={16} />
            <div>
              <span className="bp-confirm-label">Check-out</span>
              <span className="bp-confirm-value">{formatDisplayDate(bookingData.checkOut)}</span>
            </div>
          </div>
          <div className="bp-confirm-item">
            <Users size={16} />
            <div>
              <span className="bp-confirm-label">Guests</span>
              <span className="bp-confirm-value">{bookingData.guests}</span>
            </div>
          </div>
        </div>
        <div className="bp-confirm-total">
          <span>Total Paid</span>
          <span>₹{(calculateTotalPrice() + calculateTaxes()).toLocaleString()}</span>
        </div>
      </div>

      <button className="bp-btn-primary bp-btn-full" onClick={() => navigate('/')}>
        Back to Home
      </button>
    </div>
  );

  return (
    <div className="bp-page">
      {/* Hero Banner */}
      <div className="bp-hero" style={{ backgroundImage: `url(${heroHotel})` }}>
        <div className="bp-hero-overlay" />
        <div className="bp-hero-content">
          <button className="bp-back-link" onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> Deccan Pavilion
          </button>
          <h1>Book Your Stay</h1>
          <p>Experience luxury & comfort at Deccan Pavilion, Pune</p>
        </div>
      </div>

      {/* Progress */}
      <div className="bp-progress-wrap">
        {renderProgressBar()}
      </div>

      {/* Main Content */}
      <div className="bp-main">
        <div className="bp-layout">
          {/* Left: Form Steps */}
          <div className="bp-left">
            {loading && currentStep === 1 && (
              <div className="bp-loading">
                <span className="bp-spinner" />
                <span>Finding the best rooms for you...</span>
              </div>
            )}
            {currentStep === 1 && renderRoomSelection()}
            {currentStep === 2 && renderGuestDetails()}
            {currentStep === 3 && renderPayment()}
            {currentStep === 4 && renderConfirmation()}
          </div>

          {/* Right: Sticky Sidebar (hidden on confirmation) */}
          {currentStep < 4 && renderSidebar()}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;

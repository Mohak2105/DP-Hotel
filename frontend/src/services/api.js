const API_BASE_URL = 'http://localhost:5001/api';

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// Auth API
export const authAPI = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  getProfile: () => apiRequest('/auth/profile'),
  
  updateProfile: (userData) => apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
};

// Rooms API
export const roomsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiRequest(`/rooms${params ? `?${params}` : ''}`);
  },
  
  getById: (id) => apiRequest(`/rooms/${id}`),
  
  getAvailable: (checkIn, checkOut, type = '') => {
    const params = new URLSearchParams({ checkIn, checkOut, type }).toString();
    return apiRequest(`/rooms/available?${params}`);
  },
  
  getTypes: () => apiRequest('/rooms/types'),
};

// Bookings API
export const bookingsAPI = {
  create: (bookingData) => apiRequest('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  }),
  
  getMyBookings: () => apiRequest('/bookings/my-bookings'),
  
  getById: (id) => apiRequest(`/bookings/${id}`),
  
  cancel: (id) => apiRequest(`/bookings/${id}/cancel`, {
    method: 'POST',
  }),
};

// Payments API
export const paymentsAPI = {
  getMethods: () => apiRequest('/payments/methods'),
  
  initiate: (paymentData) => apiRequest('/payments/initiate', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  }),
  
  process: (paymentId, paymentDetails) => apiRequest(`/payments/process/${paymentId}`, {
    method: 'POST',
    body: JSON.stringify(paymentDetails),
  }),
  
  getMyPayments: () => apiRequest('/payments/my-payments'),
  
  getByBooking: (bookingId) => apiRequest(`/payments/booking/${bookingId}`),
};

// Contact API
export const contactAPI = {
  submit: (messageData) => apiRequest('/contact', {
    method: 'POST',
    body: JSON.stringify(messageData),
  }),
};

// Events API
export const eventsAPI = {
  create: (eventData) => apiRequest('/events', {
    method: 'POST',
    body: JSON.stringify(eventData),
  }),
  
  getMyEvents: () => apiRequest('/events/my-events'),
  
  getTypes: () => apiRequest('/events/types'),
};

export default {
  auth: authAPI,
  rooms: roomsAPI,
  bookings: bookingsAPI,
  payments: paymentsAPI,
  contact: contactAPI,
  events: eventsAPI,
};

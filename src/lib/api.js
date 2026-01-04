import { supabase, isSupabaseConfigured } from './supabase';

// API Base URL - use backend Express server
// In development, Vite proxy handles /api routes, so we use relative URLs
// In production, use VITE_API_URL if set, otherwise use relative URLs
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // In development (localhost), always use relative URLs to use Vite proxy
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || 
                        hostname === '127.0.0.1' ||
                        hostname.includes('localhost') ||
                        hostname.includes('127.0.0.1');
    
    if (isLocalhost) {
      // Force relative URLs in development to use Vite proxy
      console.log('[API] Development mode detected, using relative URLs for Vite proxy');
      return '';
    }
  }
  
  // In production, use VITE_API_URL if set
  if (envUrl) {
    // Remove trailing slash to avoid double slashes
    const cleanUrl = envUrl.replace(/\/+$/, '');
    console.log('[API] Using production API URL:', cleanUrl);
    return cleanUrl;
  }
  
  // Default to relative URLs
  console.log('[API] No API URL set, using relative URLs');
  return '';
};

const API_BASE_URL = getApiBaseUrl();

// Helper function to call backend API
const apiCall = async (endpoint, options = {}) => {
  try {
    // Ensure endpoint starts with / and base URL doesn't end with /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = API_BASE_URL ? `${API_BASE_URL}${cleanEndpoint}` : cleanEndpoint;
    
    // Debug logging in development
    if (typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      console.log('[API] Calling:', url, 'from', window.location.origin);
    }
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Check if response has content
    const contentType = response.headers.get('content-type');
    const hasJsonContent = contentType && contentType.includes('application/json');
    
    // Get response text first to check if it's empty
    const text = await response.text();
    
    // If response is empty, handle gracefully
    if (!text || text.trim() === '') {
      if (!response.ok) {
        return { 
          data: null, 
          error: { 
            message: `Server returned ${response.status} ${response.statusText} with no content`,
            status: response.status 
          } 
        };
      }
      return { data: null, error: { message: 'Empty response from server' } };
    }

    // Try to parse as JSON if content type suggests JSON or if we expect JSON
    let result;
    if (hasJsonContent || text.trim().startsWith('{') || text.trim().startsWith('[')) {
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error(`Failed to parse JSON response from ${endpoint}:`, parseError);
        return { 
          data: null, 
          error: { 
            message: 'Invalid JSON response from server',
            details: text.substring(0, 100)
          } 
        };
      }
    } else {
      // Not JSON - might be HTML error page or plain text
      return { 
        data: null, 
        error: { 
          message: response.ok 
            ? 'Unexpected response format from server' 
            : `Server error: ${response.status} ${response.statusText}`,
          details: text.substring(0, 200)
        } 
      };
    }
    
    if (!response.ok) {
      return { data: null, error: result.error || result || { message: `Request failed with status ${response.status}` } };
    }

    return { data: result.data || result, error: null };
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    
    // Check if it's a network error
    if (error.message.includes('fetch')) {
      return { 
        data: null, 
        error: { 
          message: 'Network error: Could not connect to server. Make sure the backend server is running.',
          details: error.message
        } 
      };
    }
    
    return { data: null, error: { message: error.message } };
  }
};

// Tours API
export const getTours = async () => {
  // Try backend API first
  const backendResult = await apiCall('/api/tours');
  if (backendResult.data && backendResult.data.length > 0) {
    return backendResult;
  }

  // Fallback to Supabase
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .eq('active', true)
      .order('name');
    if (data) return { data, error };
  }

  // Final fallback to local data
  const { tours } = await import('../data');
  return { data: tours, error: null };
};

export const getTour = async (id) => {
  if (!isSupabaseConfigured()) {
    const { tours } = await import('../data');
    return { data: tours.find(t => t.id === id), error: null };
  }

  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .eq('id', id)
    .eq('active', true)
    .single();

  return { data, error };
};

// Guides API (using backend Express routes)
export const getAvailableGuides = async (date) => {
  // Try backend API first
  const backendResult = await apiCall(`/api/guides/available?date=${date}`);
  if (backendResult.data) {
    return backendResult;
  }

  // Fallback to Supabase (drivers)
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.rpc('get_available_drivers', {
      p_date: date,
      p_group_size: 1, // Default group size
    });
    if (data) return { data, error };
  }

  // Final fallback to local data
  const { drivers } = await import('../data');
  return { data: drivers, error: null };
};

// Drivers API
// Note: getAvailableDrivers is defined below in the Supabase section (line 841)
// This old version has been removed to avoid duplicate declaration

export const getDrivers = async () => {
  if (!isSupabaseConfigured()) {
    const { drivers } = await import('../data');
    return { data: drivers, error: null };
  }

  const { data, error } = await supabase
    .from('drivers')
    .select(`
      *,
      vehicles (*)
    `)
    .eq('active', true)
    .order('name');

  return { data, error };
};

// Bookings API
export const createBooking = async (bookingData) => {
  // Get auth token if member is logged in
  const token = localStorage.getItem('auth_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Transform bookingData to match backend API format
  const backendPayload = {
    tour_id: bookingData.tour_id || bookingData.tourId,
    guide_id: bookingData.guide_id || bookingData.guideId || bookingData.driver_id || bookingData.driverId,
    booking_date: bookingData.date || bookingData.booking_date,
    booking_time: bookingData.time || bookingData.booking_time || null,
    group_size: bookingData.group_size || bookingData.pax,
    customer_name: bookingData.customer_name || bookingData.customerName || `${bookingData.firstName || ''} ${bookingData.lastName || ''}`.trim(),
    customer_email: bookingData.customer_email || bookingData.customerEmail || bookingData.email,
    customer_phone: bookingData.customer_phone || bookingData.customerPhone || bookingData.phone,
    special_requests: bookingData.special_requests || bookingData.specialRequests,
    status: bookingData.status || 'reserved', // Pass status to backend
    user_id: bookingData.user_id || null, // Will be set by backend if member is logged in
  };

  // Use apiCall with auth header if token exists
  const url = API_BASE_URL ? `${API_BASE_URL}/api/bookings` : '/api/bookings';
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(backendPayload),
    });

    const result = await response.json();
    
    if (!response.ok) {
      return { data: null, error: result };
    }

    return { data: result.data || result, error: null };
  } catch (error) {
    console.error(`API call failed for /api/bookings:`, error);
    
    // Fallback to Supabase if backend fails
    if (isSupabaseConfigured()) {
      const { data, error: supabaseError } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();
      if (data) return { data, error: null };
      return { data: null, error: supabaseError };
    }

    // Final fallback: store in localStorage
    const bookings = JSON.parse(localStorage.getItem('unicab_bookings') || '[]');
    const newBooking = {
      id: Date.now().toString(),
      ...bookingData,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    bookings.push(newBooking);
    localStorage.setItem('unicab_bookings', JSON.stringify(bookings));
    return { data: newBooking, error: null };
  }
};

export const getBookings = async (filters = {}) => {
  if (!isSupabaseConfigured()) {
    const bookings = JSON.parse(localStorage.getItem('unicab_bookings') || '[]');
    return { data: bookings, error: null };
  }

  let query = supabase
    .from('bookings')
    .select(`
      *,
      tours (*),
      drivers (*)
    `)
    .order('date', { ascending: true });

  if (filters.driver_id) {
    query = query.eq('driver_id', filters.driver_id);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.date_from) {
    query = query.gte('date', filters.date_from);
  }

  if (filters.date_to) {
    query = query.lte('date', filters.date_to);
  }

  const { data, error } = await query;

  return { data, error };
};

export const updateBooking = async (bookingId, updates) => {
  if (!isSupabaseConfigured()) {
    const bookings = JSON.parse(localStorage.getItem('unicab_bookings') || '[]');
    const index = bookings.findIndex(b => b.id === bookingId);
    if (index !== -1) {
      bookings[index] = { ...bookings[index], ...updates };
      localStorage.setItem('unicab_bookings', JSON.stringify(bookings));
      return { data: bookings[index], error: null };
    }
    return { data: null, error: { message: 'Booking not found' } };
  }

  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', bookingId)
    .select()
    .single();

  return { data, error };
};

// Driver Availability API
// Note: getDriverAvailability is defined below in the Supabase section (line 711)
// This old version has been removed to avoid duplicate declaration

export const blockDriverDate = async (driverId, date, reason = '') => {
  if (!isSupabaseConfigured()) {
    return { data: { id: Date.now(), driver_id: driverId, date, reason }, error: null };
  }

  const { data, error } = await supabase
    .from('driver_availability')
    .insert({
      driver_id: driverId,
      date,
      reason,
    })
    .select()
    .single();

  return { data, error };
};

export const unblockDriverDate = async (availabilityId) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: null };
  }

  const { error } = await supabase
    .from('driver_availability')
    .delete()
    .eq('id', availabilityId);

  return { data: null, error };
};

// Reviews API
export const createReview = async (reviewData) => {
  if (!isSupabaseConfigured()) {
    const reviews = JSON.parse(localStorage.getItem('unicab_reviews') || '[]');
    const newReview = {
      id: Date.now().toString(),
      ...reviewData,
      approved: false,
      created_at: new Date().toISOString(),
    };
    reviews.push(newReview);
    localStorage.setItem('unicab_reviews', JSON.stringify(reviews));
    return { data: newReview, error: null };
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert(reviewData)
    .select()
    .single();

  return { data, error };
};

export const getReviews = async (filters = {}) => {
  if (!isSupabaseConfigured()) {
    const reviews = JSON.parse(localStorage.getItem('unicab_reviews') || '[]');
    return { data: reviews.filter(r => r.approved !== false), error: null };
  }

  let query = supabase
    .from('reviews')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false });

  if (filters.tour_id) {
    query = query.eq('tour_id', filters.tour_id);
  }

  if (filters.driver_id) {
    query = query.eq('driver_id', filters.driver_id);
  }

  const { data, error } = await query;

  return { data, error };
};

// Calculate price based on group size
export const calculateTourPrice = (tour, groupSize) => {
  if (!tour || !tour.pricing) return 0;

  const pricing = tour.pricing;
  
  if (groupSize === 1) return pricing[1] || 0;
  if (groupSize === 2) return pricing[2] || 0;
  if (groupSize === 3) return pricing[3] || 0;
  if (groupSize === 4) return pricing[4] || 0;
  if (groupSize >= 5 && groupSize <= 6) return pricing['5-6'] || 0;
  if (groupSize >= 7 && groupSize <= 10) return pricing['7-10'] || 0;
  if (groupSize >= 11 && groupSize <= 14) return pricing['11-14'] || 0;
  if (groupSize >= 15 && groupSize <= 18) return pricing['15-18'] || 0;
  if (groupSize >= 19 && groupSize <= 22) return pricing['19-22'] || 0;
  
  return pricing['19-22'] || 0;
};

// Payments API (stub for Stripe integration)
export const createPaymentSession = async (bookingId, amount, currency = 'zar') => {
  return apiCall('/api/payments/create-session', {
    method: 'POST',
    body: JSON.stringify({ booking_id: bookingId, amount, currency }),
  });
};

// Authentication API
export const login = async (email, password) => {
  return apiCall('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

// Driver API (requires authentication token)
const driverApiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('auth_token');
  return apiCall(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const getDriverUnavailability = async () => {
  return driverApiCall('/api/driver/unavailability');
};

// Note: blockDriverDate and unblockDriverDate are already defined above (lines 257, 275)
// These duplicate definitions are removed to fix the build error

// Admin API (requires authentication token)
const adminApiCall = async (endpoint, options = {}) => {
  // Try to get Supabase session token first
  let token = null;
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      token = session.access_token;
    }
  } catch (error) {
    console.warn('Could not get Supabase session:', error);
  }
  
  // Fallback to localStorage token (for legacy JWT support)
  if (!token) {
    token = localStorage.getItem('auth_token');
  }
  
  if (!token) {
    return {
      data: null,
      error: {
        message: 'Authentication required. Please log in.',
        status: 401
      }
    };
  }
  
  return apiCall(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const getAdminBookings = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  return adminApiCall(`/api/admin/bookings${queryParams ? `?${queryParams}` : ''}`);
};

export const updateBookingStatus = async (bookingId, status) => {
  return adminApiCall(`/api/admin/bookings/${bookingId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

export const getAdminDrivers = async () => {
  return adminApiCall('/api/admin/drivers');
};

// Create driver record - calls backend API which handles both new and existing users
export const createDriver = async (driverData) => {
  return adminApiCall('/api/admin/drivers', {
    method: 'POST',
    body: JSON.stringify(driverData),
  });
};

export const updateDriverStatus = async (driverId, active) => {
  return adminApiCall(`/api/admin/drivers/${driverId}`, {
    method: 'PATCH',
    body: JSON.stringify({ active }),
  });
};

export const getDriverUnavailabilityAdmin = async (driverId) => {
  return adminApiCall(`/api/admin/drivers/${driverId}/unavailability`);
};

export const blockDriverDateAdmin = async (driverId, date, reason = '') => {
  return adminApiCall(`/api/admin/drivers/${driverId}/unavailability`, {
    method: 'POST',
    body: JSON.stringify({ date, reason }),
  });
};

export const unblockDriverDateAdmin = async (driverId, date) => {
  return adminApiCall(`/api/admin/drivers/${driverId}/unavailability/${date}`, {
    method: 'DELETE',
  });
};

// ============================================================
// BOOKINGS API (Customer, Driver, Admin)
// ============================================================

// Customer: Create booking
export const createBookingSupabase = async (bookingData) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: bookingData.user_id || null, // Will be set from auth if logged in
        tour_id: bookingData.tour_id,
        driver_id: bookingData.driver_id,
        booking_date: bookingData.booking_date || bookingData.date,
        group_size: bookingData.group_size || 1,
        status: 'pending',
        customer_name: bookingData.customer_name,
        customer_email: bookingData.customer_email,
        customer_phone: bookingData.customer_phone || null,
        special_requests: bookingData.special_requests || null,
        price_per_person: bookingData.price_per_person || 0,
        total_price: bookingData.total_price || 0
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Customer: Get own bookings
export const getCustomerBookings = async () => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        tour:tours(*),
        driver:drivers(*)
      `)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .order('booking_date', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Driver: Get assigned bookings
export const getDriverBookings = async () => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }

  try {
    // First get driver_id from drivers table
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return { data: null, error: { message: 'Not authenticated' } };
    }

    const { data: driverData } = await supabase
      .from('drivers')
      .select('id')
      .eq('user_id', userData.user.id)
      .single();

    if (!driverData) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        tour:tours(*),
        customer:profiles!bookings_user_id_fkey(id, email, full_name)
      `)
      .eq('driver_id', driverData.id)
      .order('booking_date', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Driver: Update booking status
export const updateBookingStatusDriver = async (bookingId, status) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Admin: Get all bookings
export const getAdminBookingsSupabase = async (filters = {}) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }

  try {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        tour:tours(*),
        driver:drivers(*),
        customer:profiles!bookings_user_id_fkey(id, email, full_name)
      `);

    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.date_from) {
      query = query.gte('booking_date', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('booking_date', filters.date_to);
    }
    if (filters.driver_id) {
      query = query.eq('driver_id', filters.driver_id);
    }

    const { data, error } = await query.order('booking_date', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Admin: Assign driver to booking
export const assignDriverToBooking = async (bookingId, driverId) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ driver_id: driverId })
      .eq('id', bookingId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Admin: Update booking status
export const updateBookingStatusAdmin = async (bookingId, status) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// ============================================================
// DRIVER AVAILABILITY API
// ============================================================

// Driver: Get own availability
export const getDriverAvailability = async (startDate, endDate) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }

  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return { data: null, error: { message: 'Not authenticated' } };
    }

    const { data: driverData } = await supabase
      .from('drivers')
      .select('id')
      .eq('user_id', userData.user.id)
      .single();

    if (!driverData) {
      return { data: [], error: null };
    }

    let query = supabase
      .from('driver_availability')
      .select('*')
      .eq('driver_id', driverData.id);

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query.order('date', { ascending: true });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Driver: Set availability for a date
export const setDriverAvailability = async (date, available, reason = null) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }

  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return { data: null, error: { message: 'Not authenticated' } };
    }

    const { data: driverData } = await supabase
      .from('drivers')
      .select('id')
      .eq('user_id', userData.user.id)
      .single();

    if (!driverData) {
      return { data: null, error: { message: 'Driver record not found' } };
    }

    const { data, error } = await supabase
      .from('driver_availability')
      .upsert({
        driver_id: driverData.id,
        date,
        available,
        reason
      }, {
        onConflict: 'driver_id,date'
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Admin: Get all driver availability
export const getAdminDriverAvailability = async (driverId = null, startDate = null, endDate = null) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }

  try {
    let query = supabase
      .from('driver_availability')
      .select(`
        *,
        driver:drivers(id, name, email)
      `);

    if (driverId) {
      query = query.eq('driver_id', driverId);
    }
    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query.order('date', { ascending: true });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Admin: Override driver availability
export const overrideDriverAvailability = async (driverId, date, available, reason = null) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }

  try {
    const { data, error } = await supabase
      .from('driver_availability')
      .upsert({
        driver_id: driverId,
        date,
        available,
        reason
      }, {
        onConflict: 'driver_id,date'
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Get available drivers for a date
// Accepts optional groupSize parameter for backward compatibility (not currently used)
export const getAvailableDrivers = async (date, groupSize = null) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }

  try {
    // Use the helper function from database
    const { data, error } = await supabase.rpc('get_available_drivers', {
      check_date: date
    });

    return { data, error };
  } catch (error) {
    // Fallback: manual query if RPC doesn't work
    try {
      const { data: drivers, error: driversError } = await supabase
        .from('drivers')
        .select('*')
        .eq('active', true);

      if (driversError) {
        return { data: null, error: driversError };
      }

      // Filter drivers who are available
      const availableDrivers = [];
      for (const driver of drivers || []) {
        // Check if driver has booking on this date
        const { data: booking } = await supabase
          .from('bookings')
          .select('id')
          .eq('driver_id', driver.id)
          .eq('booking_date', date)
          .in('status', ['pending', 'confirmed'])
          .single();

        if (booking) continue;

        // Check availability
        const { data: availability } = await supabase
          .from('driver_availability')
          .select('available')
          .eq('driver_id', driver.id)
          .eq('date', date)
          .single();

        const isAvailable = availability ? availability.available : true;
        if (isAvailable) {
          availableDrivers.push(driver);
        }
      }

      return { data: availableDrivers, error: null };
    } catch (fallbackError) {
      return { data: null, error: fallbackError };
    }
  }
};

// Member API (requires authentication token)
const memberApiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('auth_token');
  return apiCall(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
};

export const getMemberBookings = async () => {
  return memberApiCall('/api/member/bookings');
};

// Registration API (public)
export const register = async (userData) => {
  return apiCall('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

// Reviews API - New review tables
export const getTourReviews = async (tourId) => {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null };
  }
  const { data, error } = await supabase
    .from('tour_reviews')
    .select('*')
    .eq('tour_id', tourId)
    .eq('approved', true)
    .order('created_at', { ascending: false });
  
  // Note: We can't directly query auth.users from client
  // User info will be handled in the display component
  
  return { data, error };
};

export const getDriverReviews = async (driverId) => {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null };
  }
  const { data, error } = await supabase
    .from('driver_reviews')
    .select('*')
    .eq('driver_id', driverId)
    .eq('approved', true)
    .order('created_at', { ascending: false });
  
  // Note: We can't directly query auth.users from client
  // User info will be handled in the display component
  
  return { data, error };
};

export const getTourReviewStats = async (tourId) => {
  if (!isSupabaseConfigured()) {
    return { data: { average: 0, count: 0 }, error: null };
  }
  const { data, error } = await supabase
    .from('tour_reviews')
    .select('rating')
    .eq('tour_id', tourId)
    .eq('approved', true);
  
  if (error) return { data: { average: 0, count: 0 }, error };
  
  const count = data?.length || 0;
  const average = count > 0 
    ? data.reduce((sum, r) => sum + r.rating, 0) / count 
    : 0;
  
  return { data: { average, count }, error: null };
};

export const getDriverReviewStats = async (driverId) => {
  if (!isSupabaseConfigured()) {
    return { data: { average: 0, count: 0 }, error: null };
  }
  const { data, error } = await supabase
    .from('driver_reviews')
    .select('rating')
    .eq('driver_id', driverId)
    .eq('approved', true);
  
  if (error) return { data: { average: 0, count: 0 }, error };
  
  const count = data?.length || 0;
  const average = count > 0 
    ? data.reduce((sum, r) => sum + r.rating, 0) / count 
    : 0;
  
  return { data: { average, count }, error: null };
};

// Admin Review Moderation API
export const getPendingReviews = async (filterType = null) => {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null };
  }
  
  const { user } = await supabase.auth.getUser();
  if (!user) {
    return { data: [], error: { message: 'Not authenticated' } };
  }

  let query = supabase
    .from('tour_reviews')
    .select('*, tours(name), bookings(id, customer_name, customer_email, date)')
    .eq('approved', false)
    .order('created_at', { ascending: false });

  const { data: tourReviews, error: tourError } = await query;

  let driverQuery = supabase
    .from('driver_reviews')
    .select('*, drivers(name), bookings(id, customer_name, customer_email, date)')
    .eq('approved', false)
    .order('created_at', { ascending: false });

  const { data: driverReviews, error: driverError } = await driverQuery;

  if (tourError || driverError) {
    return { data: [], error: tourError || driverError };
  }

  const allReviews = [
    ...(tourReviews || []).map(r => ({ ...r, review_type: 'tour' })),
    ...(driverReviews || []).map(r => ({ ...r, review_type: 'driver' }))
  ];

  // Filter by type if specified
  const filtered = filterType 
    ? allReviews.filter(r => r.review_type === filterType)
    : allReviews;

  return { data: filtered, error: null };
};

export const approveReview = async (reviewId, reviewType) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }
  
  const table = reviewType === 'tour' ? 'tour_reviews' : 'driver_reviews';
  const { data, error } = await supabase
    .from(table)
    .update({ approved: true })
    .eq('id', reviewId)
    .select()
    .single();
  
  return { data, error };
};

export const rejectReview = async (reviewId, reviewType) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: { message: 'Supabase not configured' } };
  }
  
  const table = reviewType === 'tour' ? 'tour_reviews' : 'driver_reviews';
  const { data, error } = await supabase
    .from(table)
    .delete()
    .eq('id', reviewId);
  
  return { data, error };
};






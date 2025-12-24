import { supabase, isSupabaseConfigured } from './supabase';

// Tours API
export const getTours = async () => {
  if (!isSupabaseConfigured()) {
    // Fallback to local data
    const { tours } = await import('../data');
    return { data: tours, error: null };
  }

  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .eq('active', true)
    .order('name');

  return { data, error };
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

// Drivers API
export const getAvailableDrivers = async (date, groupSize) => {
  if (!isSupabaseConfigured()) {
    // Fallback to local data
    const { drivers } = await import('../data');
    return { data: drivers, error: null };
  }

  const { data, error } = await supabase.rpc('get_available_drivers', {
    p_date: date,
    p_group_size: groupSize,
  });

  return { data, error };
};

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
  if (!isSupabaseConfigured()) {
    // Fallback: store in localStorage
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

  const { data, error } = await supabase
    .from('bookings')
    .insert(bookingData)
    .select()
    .single();

  return { data, error };
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
export const getDriverAvailability = async (driverId) => {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('driver_availability')
    .select('*')
    .eq('driver_id', driverId)
    .order('date', { ascending: true });

  return { data, error };
};

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




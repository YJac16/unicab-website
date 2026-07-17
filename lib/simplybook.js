// SimplyBook.me API Service Wrapper
// Server-side only - never expose credentials to frontend
// Handles authentication and API calls to SimplyBook.me

/**
 * SimplyBook API Client
 * Provides methods to interact with SimplyBook.me API
 * All methods return { data, error } format for consistency
 */
class SimplyBookService {
  constructor() {
    // Load environment variables
    this.apiKey = process.env.SIMPLYBOOK_API_KEY;
    this.companyLogin = process.env.SIMPLYBOOK_COMPANY_LOGIN;
    this.companyName = process.env.SIMPLYBOOK_COMPANY_NAME;
    this.baseUrl = process.env.SIMPLYBOOK_BASE_URL || 'https://user-api.simplybook.me';

    // Validate required configuration
    if (!this.apiKey || !this.companyLogin) {
      console.warn('⚠️  SimplyBook credentials not configured. Set SIMPLYBOOK_API_KEY and SIMPLYBOOK_COMPANY_LOGIN in environment variables.');
    }

    // Cache for authentication token
    this.token = null;
    this.tokenExpiry = null;
  }

  /**
   * Authenticate with SimplyBook API and get access token
   * Tokens are cached to avoid unnecessary API calls
   * @returns {Promise<{data: string|null, error: object|null}>}
   */
  async authenticate() {
    // Return cached token if still valid
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return { data: this.token, error: null };
    }

    if (!this.apiKey || !this.companyLogin) {
      return {
        data: null,
        error: {
          message: 'SimplyBook credentials not configured',
          code: 'CONFIG_ERROR'
        }
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyLogin: this.companyLogin,
          apiKey: this.apiKey
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          data: null,
          error: {
            message: `Authentication failed: ${response.status} ${response.statusText}`,
            details: errorText,
            code: 'AUTH_ERROR'
          }
        };
      }

      const result = await response.json();
      
      if (result.token) {
        // Cache token for 1 hour (tokens typically expire after 2 hours)
        this.token = result.token;
        this.tokenExpiry = Date.now() + (60 * 60 * 1000); // 1 hour
        
        return { data: this.token, error: null };
      }

      return {
        data: null,
        error: {
          message: 'No token received from SimplyBook API',
          code: 'AUTH_ERROR'
        }
      };
    } catch (error) {
      console.error('SimplyBook authentication error:', error);
      return {
        data: null,
        error: {
          message: error.message || 'Failed to authenticate with SimplyBook',
          code: 'NETWORK_ERROR'
        }
      };
    }
  }

  /**
   * Make authenticated API request to SimplyBook
   * Automatically handles authentication token
   * @param {string} endpoint - API endpoint (e.g., '/admin/bookings')
   * @param {object} options - Fetch options (method, body, etc.)
   * @returns {Promise<{data: any, error: object|null}>}
   */
  async apiRequest(endpoint, options = {}) {
    // Authenticate first
    const { data: token, error: authError } = await this.authenticate();
    
    if (authError || !token) {
      return { data: null, error: authError };
    }

    // Ensure endpoint starts with /
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${cleanEndpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Company-Login': this.companyLogin,
          'X-Token': token,
          ...options.headers
        }
      });

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      let data = null;
      if (isJson) {
        const text = await response.text();
        if (text) {
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            return {
              data: null,
              error: {
                message: 'Invalid JSON response from SimplyBook API',
                code: 'PARSE_ERROR'
              }
            };
          }
        }
      }

      if (!response.ok) {
        return {
          data: null,
          error: {
            message: data?.message || `API request failed: ${response.status} ${response.statusText}`,
            status: response.status,
            code: 'API_ERROR'
          }
        };
      }

      return { data, error: null };
    } catch (error) {
      console.error('SimplyBook API request error:', error);
      return {
        data: null,
        error: {
          message: error.message || 'Failed to communicate with SimplyBook API',
          code: 'NETWORK_ERROR'
        }
      };
    }
  }

  /**
   * Get list of services (tours/transfers)
   * @returns {Promise<{data: array, error: object|null}>}
   */
  async getServices() {
    return this.apiRequest('/admin/services');
  }

  /**
   * Get list of providers (drivers/guides)
   * @returns {Promise<{data: array, error: object|null}>}
   */
  async getProviders() {
    return this.apiRequest('/admin/units');
  }

  /**
   * Get availability for a service and date
   * @param {string} serviceId - Service ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} unitId - Optional provider/unit ID
   * @returns {Promise<{data: array, error: object|null}>}
   */
  async getAvailability(serviceId, date, unitId = null) {
    const params = new URLSearchParams({
      service: serviceId,
      date: date
    });
    
    if (unitId) {
      params.append('unit', unitId);
    }

    return this.apiRequest(`/admin/available?${params.toString()}`);
  }

  /**
   * Create a new booking
   * @param {object} bookingData - Booking details
   * @param {string} bookingData.serviceId - Service ID
   * @param {string} bookingData.date - Date in YYYY-MM-DD format
   * @param {string} bookingData.time - Time in HH:MM format
   * @param {string} bookingData.unitId - Provider/unit ID (optional)
   * @param {string} bookingData.clientName - Client name
   * @param {string} bookingData.clientEmail - Client email
   * @param {string} bookingData.clientPhone - Client phone (optional)
   * @param {object} bookingData.customFields - Custom fields (optional)
   * @returns {Promise<{data: object, error: object|null}>}
   */
  async createBooking(bookingData) {
    const {
      serviceId,
      date,
      time,
      unitId,
      clientName,
      clientEmail,
      clientPhone,
      customFields = {}
    } = bookingData;

    // Validate required fields
    if (!serviceId || !date || !time || !clientName || !clientEmail) {
      return {
        data: null,
        error: {
          message: 'Missing required booking fields: serviceId, date, time, clientName, clientEmail',
          code: 'VALIDATION_ERROR'
        }
      };
    }

    const payload = {
      service_id: serviceId,
      date: date,
      time: time,
      client: {
        name: clientName,
        email: clientEmail,
        phone: clientPhone || ''
      },
      ...customFields
    };

    if (unitId) {
      payload.unit_id = unitId;
    }

    return this.apiRequest('/admin/bookings', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Get booking details by ID
   * @param {string} bookingId - SimplyBook booking ID
   * @returns {Promise<{data: object, error: object|null}>}
   */
  async getBooking(bookingId) {
    if (!bookingId) {
      return {
        data: null,
        error: {
          message: 'Booking ID is required',
          code: 'VALIDATION_ERROR'
        }
      };
    }

    return this.apiRequest(`/admin/bookings/${bookingId}`);
  }

  /**
   * Cancel a booking
   * @param {string} bookingId - SimplyBook booking ID
   * @param {string} reason - Cancellation reason (optional)
   * @returns {Promise<{data: object, error: object|null}>}
   */
  async cancelBooking(bookingId, reason = '') {
    if (!bookingId) {
      return {
        data: null,
        error: {
          message: 'Booking ID is required',
          code: 'VALIDATION_ERROR'
        }
      };
    }

    return this.apiRequest(`/admin/bookings/${bookingId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  /**
   * Get bookings with filters
   * @param {object} filters - Filter options
   * @param {string} filters.dateFrom - Start date (YYYY-MM-DD)
   * @param {string} filters.dateTo - End date (YYYY-MM-DD)
   * @param {string} filters.status - Booking status
   * @param {string} filters.clientEmail - Client email
   * @returns {Promise<{data: array, error: object|null}>}
   */
  async getBookings(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.dateFrom) params.append('date_from', filters.dateFrom);
    if (filters.dateTo) params.append('date_to', filters.dateTo);
    if (filters.status) params.append('status', filters.status);
    if (filters.clientEmail) params.append('client_email', filters.clientEmail);

    const queryString = params.toString();
    const endpoint = queryString ? `/admin/bookings?${queryString}` : '/admin/bookings';

    return this.apiRequest(endpoint);
  }

  /**
   * Verify booking exists and is completed
   * Used for review validation
   * @param {string} bookingId - SimplyBook booking ID
   * @param {string} clientEmail - Client email to verify ownership
   * @returns {Promise<{data: {exists: boolean, completed: boolean, booking: object|null}, error: object|null}>}
   */
  async verifyBookingForReview(bookingId, clientEmail) {
    if (!bookingId || !clientEmail) {
      return {
        data: null,
        error: {
          message: 'Booking ID and client email are required',
          code: 'VALIDATION_ERROR'
        }
      };
    }

    const { data: booking, error } = await this.getBooking(bookingId);

    if (error) {
      return { data: null, error };
    }

    if (!booking) {
      return {
        data: {
          exists: false,
          completed: false,
          booking: null
        },
        error: null
      };
    }

    // Verify email matches
    const bookingEmail = booking.client?.email || booking.email || '';
    const emailMatches = bookingEmail.toLowerCase() === clientEmail.toLowerCase();

    // Check if booking is completed
    // SimplyBook statuses: 'confirmed', 'completed', 'cancelled', etc.
    const isCompleted = booking.status === 'completed' || booking.status === 'confirmed';

    return {
      data: {
        exists: true,
        completed: isCompleted && emailMatches,
        booking: emailMatches ? booking : null
      },
      error: null
    };
  }

  /**
   * Get reviews for a service or provider
   * @param {object} filters - Filter options
   * @param {string} filters.serviceId - Service ID (optional)
   * @param {string} filters.unitId - Provider/unit ID (optional)
   * @param {string} filters.bookingId - Booking ID (optional)
   * @returns {Promise<{data: array, error: object|null}>}
   */
  async getReviews(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.serviceId) params.append('service_id', filters.serviceId);
    if (filters.unitId) params.append('unit_id', filters.unitId);
    if (filters.bookingId) params.append('booking_id', filters.bookingId);

    const queryString = params.toString();
    const endpoint = queryString ? `/admin/reviews?${queryString}` : '/admin/reviews';

    return this.apiRequest(endpoint);
  }

  /**
   * Submit a review for a booking
   * @param {object} reviewData - Review details
   * @param {string} reviewData.bookingId - SimplyBook booking ID
   * @param {string} reviewData.clientEmail - Client email (for verification)
   * @param {number} reviewData.rating - Rating (1-5)
   * @param {string} reviewData.comment - Review comment
   * @param {string} reviewData.serviceId - Service ID (optional)
   * @param {string} reviewData.unitId - Provider/unit ID (optional)
   * @returns {Promise<{data: object, error: object|null}>}
   */
  async submitReview(reviewData) {
    const {
      bookingId,
      clientEmail,
      rating,
      comment,
      serviceId,
      unitId
    } = reviewData;

    // Validate required fields
    if (!bookingId || !clientEmail || !rating || !comment) {
      return {
        data: null,
        error: {
          message: 'Missing required review fields: bookingId, clientEmail, rating, comment',
          code: 'VALIDATION_ERROR'
        }
      };
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return {
        data: null,
        error: {
          message: 'Rating must be between 1 and 5',
          code: 'VALIDATION_ERROR'
        }
      };
    }

    // Verify booking exists and is completed before allowing review
    const { data: verification, error: verifyError } = await this.verifyBookingForReview(bookingId, clientEmail);
    
    if (verifyError) {
      return { data: null, error: verifyError };
    }

    if (!verification.exists) {
      return {
        data: null,
        error: {
          message: 'Booking not found',
          code: 'BOOKING_NOT_FOUND'
        }
      };
    }

    if (!verification.completed) {
      return {
        data: null,
        error: {
          message: 'Reviews can only be submitted for completed bookings',
          code: 'BOOKING_NOT_COMPLETED'
        }
      };
    }

    // Check if review already exists for this booking
    const { data: existingReviews, error: existingError } = await this.getReviews({ bookingId });
    
    if (!existingError && existingReviews && existingReviews.length > 0) {
      return {
        data: null,
        error: {
          message: 'A review already exists for this booking',
          code: 'DUPLICATE_REVIEW'
        }
      };
    }

    // Submit review to SimplyBook
    const payload = {
      booking_id: bookingId,
      rating: rating,
      comment: comment.trim()
    };

    if (serviceId) payload.service_id = serviceId;
    if (unitId) payload.unit_id = unitId;

    return this.apiRequest('/admin/reviews', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
}

// Export singleton instance
module.exports = new SimplyBookService();


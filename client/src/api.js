import axios from 'axios';

// Create a custom axios instance
const api = axios.create({
  baseURL: 'http://localhost:3000', // Replace with your backend URL
});

// ---------------------------------------------------
// 1. REQUEST INTERCEPTOR
// Automatically attach the accessToken to every request
// ---------------------------------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------
// 2. RESPONSE INTERCEPTOR
// Catch 401 errors, refresh token, and retry the request
// ---------------------------------------------------
api.interceptors.response.use(
  (response) => {
    // If the request succeeds, just return it normally
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 (Unauthorized) and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Set a flag to prevent infinite refresh loops

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
            throw new Error("No refresh token available");
        }

        // 1. Call your backend refresh route
        const refreshResponse = await axios.post('http://localhost:3000/api/refresh', {
          refreshToken: refreshToken,
        });

        // 2. Extract the new tokens (adjust this based on your backend response structure!)
        const newAccessToken = refreshResponse.data.data.accessToken;
        const newRefreshToken = refreshResponse.data.data.accessToken;
        
        // 3. Save the new token to localStorage
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // 4. Update the failed original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // 5. Retry the original request ("Create Poll")!
        return api(originalRequest);
        
      } catch (refreshError) {
        // If the refresh token is ALSO expired or invalid, log the user out
        console.error('Session expired. Logging out...');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Redirect to login page
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }

    // For all other errors (400, 404, 500), just throw the error normally
    return Promise.reject(error);
  }
);

export default api;
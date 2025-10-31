// // src/services/api.js
// const BASE_URL = 'https://68daac4623ebc87faa30ec78.mockapi.io/api/vish';

// export const issuesAPI = {
//   // Get all issues
//   getIssues: async () => {
//     const response = await fetch(`${BASE_URL}/issues`);
//     return response.json();
//   },

//   // Get single issue
//   getIssue: async (id) => {
//     const response = await fetch(`${BASE_URL}/issues/${id}`);
//     return response.json();
//   },

//   // Create new issue
//   createIssue: async (issueData) => {
//     const response = await fetch(`${BASE_URL}/issues`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(issueData),
//     });
//     return response.json();
//   },

//   // Update issue (e.g. voting or status change)
//   updateIssue: async (id, updates) => {
//     const response = await fetch(`${BASE_URL}/issues/${id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(updates),
//     });
//     return response.json();
//   },
// };

// export const usersAPI = {
//   // Get all users
//   getUsers: async () => {
//     const response = await fetch(`${BASE_URL}/users`);
//     return response.json();
//   },

//   // Get single user
//   getUser: async (id) => {
//     const response = await fetch(`${BASE_URL}/users/${id}`);
//     return response.json();
//   },

//   // Create new user
//   createUser: async (userData) => {
//     const response = await fetch(`${BASE_URL}/users`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(userData),
//     });
//     return response.json();
//   },

//   // Update user
//   updateUser: async (id, updates) => {
//     const response = await fetch(`${BASE_URL}/users/${id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(updates),
//     });
//     return response.json();
//   },

//   // Delete user
//   deleteUser: async (id) => {
//     const response = await fetch(`${BASE_URL}/users/${id}`, {
//       method: 'DELETE',
//     });
//     return response.json();
//   },

//   findUserByEmail: async (email) => {
//     try {
//       // Get all users and filter manually (more reliable)
//       const response = await fetch(`${BASE_URL}/users`);
//       const allUsers = await response.json();
//       console.log("All users:", allUsers);
      
//       const filtered = allUsers.filter(u => u.email?.toLowerCase() === email.toLowerCase());
//       console.log("Filtered users:", filtered);
      
//       return filtered;
//     } catch (error) {
//       console.error("Error finding user:", error);
//       return [];
//     }
//   }
// };




// src/services/api.js - Updated to work with MongoDB backend
const BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// ============= AUTHENTICATION API =============
export const authAPI = {
  // Sign up new user
  signup: async (name, email, password) => {
    const response = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await handleResponse(response);
    
    // Store token in localStorage
    if (data.data.token) {
      localStorage.setItem('authToken', data.data.token);
    }
    
    return data.data.user;
  },

  // Login user
  login: async (email, password) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(response);
    
    // Store token in localStorage
    if (data.data.token) {
      localStorage.setItem('authToken', data.data.token);
    }
    
    return data.data.user;
  },

  // Verify token and get current user
  verifyToken: async () => {
    const response = await fetch(`${BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return data.data.user;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
  }
};

// ============= ISSUES API =============
export const issuesAPI = {
  // Get all issues with optional filters
  getIssues: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.limit) queryParams.append('limit', filters.limit);
    if (filters.page) queryParams.append('page', filters.page);
    
    const url = `${BASE_URL}/issues${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return data.data;
  },

  // Get single issue
  getIssue: async (id) => {
    const response = await fetch(`${BASE_URL}/issues/${id}`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return data.data;
  },

  // Create new issue
  createIssue: async (issueData) => {
    const response = await fetch(`${BASE_URL}/issues`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(issueData),
    });
    const data = await handleResponse(response);
    return data.data;
  },

  // Update issue
  updateIssue: async (id, updates) => {
    const response = await fetch(`${BASE_URL}/issues/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const data = await handleResponse(response);
    return data.data;
  },

  // Delete issue
  deleteIssue: async (id) => {
    const response = await fetch(`${BASE_URL}/issues/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return data;
  },

  // Toggle upvote on issue
  toggleUpvote: async (id) => {
    const response = await fetch(`${BASE_URL}/issues/${id}/upvote`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return data.data;
  },

  // Toggle downvote on issue
  toggleDownvote: async (id) => {
    const response = await fetch(`${BASE_URL}/issues/${id}/downvote`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return data.data;
  },

  // Add comment to issue
  addComment: async (id, text) => {
    const response = await fetch(`${BASE_URL}/issues/${id}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text }),
    });
    const data = await handleResponse(response);
    return data.data;
  },

  // Delete comment from issue
  deleteComment: async (issueId, commentId) => {
    const response = await fetch(`${BASE_URL}/issues/${issueId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return data;
  },

  // Get issue statistics
  getStats: async () => {
    const response = await fetch(`${BASE_URL}/issues/stats/summary`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return data.data;
  }
};

// ============= USERS API =============
export const usersAPI = {
  // Get all users (admin only)
  getUsers: async () => {
    const response = await fetch(`${BASE_URL}/users`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return data.data;
  },

  // Get single user
  getUser: async (id) => {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return data.data;
  },

  // Update user
  updateUser: async (id, updates) => {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const data = await handleResponse(response);
    return data.data;
  },

  // Delete user (admin only)
  deleteUser: async (id) => {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    return data;
  },

  // Find user by email
  findUserByEmail: async (email) => {
    try {
      const response = await fetch(`${BASE_URL}/users/email/${email}`, {
        headers: getAuthHeaders(),
      });
      const data = await handleResponse(response);
      return data.data;
    } catch (error) {
      // Return null if user not found instead of throwing
      if (error.message === 'User not found') {
        return null;
      }
      throw error;
    }
  }
};

// ============= HEALTH CHECK =============
export const healthAPI = {
  check: async () => {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await handleResponse(response);
    return data;
  }
};

// Export default object with all APIs
export default {
  auth: authAPI,
  issues: issuesAPI,
  users: usersAPI,
  health: healthAPI
};
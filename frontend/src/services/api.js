// src/services/api.js
const BASE_URL = 'https://68daac4623ebc87faa30ec78.mockapi.io/api/vish';

export const issuesAPI = {
  // Get all issues
  getIssues: async () => {
    const response = await fetch(`${BASE_URL}/issues`);
    return response.json();
  },

  // Get single issue
  getIssue: async (id) => {
    const response = await fetch(`${BASE_URL}/issues/${id}`);
    return response.json();
  },

  // Create new issue
  createIssue: async (issueData) => {
    const response = await fetch(`${BASE_URL}/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issueData),
    });
    return response.json();
  },

  // Update issue (e.g. voting or status change)
  updateIssue: async (id, updates) => {
    const response = await fetch(`${BASE_URL}/issues/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return response.json();
  },
};

export const usersAPI = {
  // Get all users
  getUsers: async () => {
    const response = await fetch(`${BASE_URL}/users`);
    return response.json();
  },

  // Get single user
  getUser: async (id) => {
    const response = await fetch(`${BASE_URL}/users/${id}`);
    return response.json();
  },

  // Create new user
  createUser: async (userData) => {
    const response = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  // Update user
  updateUser: async (id, updates) => {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return response.json();
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  findUserByEmail: async (email) => {
    try {
      // Get all users and filter manually (more reliable)
      const response = await fetch(`${BASE_URL}/users`);
      const allUsers = await response.json();
      console.log("All users:", allUsers);
      
      const filtered = allUsers.filter(u => u.email?.toLowerCase() === email.toLowerCase());
      console.log("Filtered users:", filtered);
      
      return filtered;
    } catch (error) {
      console.error("Error finding user:", error);
      return [];
    }
  }
};

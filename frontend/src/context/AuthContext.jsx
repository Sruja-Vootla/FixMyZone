// import { createContext, useContext, useState, useEffect } from "react";
// import { usersAPI } from "../services/api";

// const AuthContext = createContext();

// export const useAuth = () => useContext(AuthContext);

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Load user from memory on mount
//   useEffect(() => {
//     setLoading(false);
//   }, []);

//   // Signup with MockAPI
//   const signup = async (name, email, password) => {
//     try {
//       console.log("Starting signup for:", email);

//       // Check if user exists
//       const existingUsers = await usersAPI.findUserByEmail(email);
//       console.log("Existing users:", existingUsers);

//       if (existingUsers && existingUsers.length > 0) {
//         throw new Error("User already exists with this email");
//       }

//       // Determine role based on email
//       const isAdmin = email.trim().toLowerCase().includes('admin');

//       // Create user in MockAPI
//       const newUser = await usersAPI.createUser({
//         name: name.trim(),
//         email: email.trim().toLowerCase(),
//         password: password,
//         createdAt: new Date().toISOString(),
//         reportedIssues: [],
//         votedIssues: [],
//         role: isAdmin ? 'admin' : 'user'
//       });

//       console.log("User created:", newUser);

//       // Set user without password
//       const { password: _, ...userWithoutPassword } = newUser;
//       setUser(userWithoutPassword);

//       return userWithoutPassword;
//     } catch (error) {
//       console.error("Signup error:", error);
//       throw error;
//     }
//   };

//   // Login with MockAPI
//   const login = async (email, password) => {
//     try {
//       console.log("Attempting login for:", email);

//       // Normalize email
//       const normalizedEmail = email.trim().toLowerCase();

//       // Find user by email
//       const users = await usersAPI.findUserByEmail(normalizedEmail);
//       console.log("Found users:", users);

//       if (!users || users.length === 0) {
//         throw new Error("Invalid email or password");
//       }

//       const existingUser = users[0];
//       console.log("User found:", existingUser);

//       // Check password
//       if (existingUser.password !== password) {
//         throw new Error("Invalid email or password");
//       }

//       // Set user without password
//       const { password: _, ...userWithoutPassword } = existingUser;
//       setUser(userWithoutPassword);

//       console.log("Login successful:", userWithoutPassword);
//       return userWithoutPassword;
//     } catch (error) {
//       console.error("Login error:", error);
//       throw error;
//     }
//   };

//   // Logout
//   const logout = () => {
//     setUser(null);
//   };

//   // Update user profile
//   const updateUser = async (updates) => {
//     if (!user) {
//       throw new Error("No user logged in");
//     }

//     try {
//       const updatedUser = await usersAPI.updateUser(user.id, updates);
//       const { password: _, ...userWithoutPassword } = updatedUser;
//       setUser(userWithoutPassword);
//       return userWithoutPassword;
//     } catch (error) {
//       console.error("Update user error:", error);
//       throw error;
//     }
//   };

//   const value = {
//     user,
//     loading,
//     signup,
//     login,
//     logout,
//     updateUser,
//     isAuthenticated: !!user
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// src/context/AuthContext.jsx - Updated for MongoDB backend
import { createContext, useContext, useState, useEffect } from "react";
import { authAPI, usersAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("authToken");

      if (token) {
        try {
          const userData = await authAPI.verifyToken();
          setUser(userData);
        } catch (error) {
          console.error("Token verification failed:", error);
          localStorage.removeItem("authToken");
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // Signup with MongoDB backend
  // const signup = async (name, email, password) => {
  //   try {
  //     console.log("Starting signup for:", email);

  //     const newUser = await authAPI.signup(name, email, password);
  //     console.log("User created:", newUser);

  //     setUser(newUser);
  //     return newUser;
  //   } catch (error) {
  //     console.error("Signup error:", error);
  //     throw error;
  //   }
  // };

  // // Login with MongoDB backend
  // const login = async (email, password) => {
  //   try {
  //     console.log("Attempting login for:", email);

  //     const userData = await authAPI.login(email, password);
  //     console.log("Login successful:", userData);

  //     setUser(userData);
  //     return userData;
  //   } catch (error) {
  //     console.error("Login error:", error);
  //     throw error;
  //   }
  // };

  // In AuthContext.jsx - Update the signup function
  const signup = async (name, email, password) => {
    try {
      console.log("Starting signup for:", email);

      const newUser = await authAPI.signup(name, email, password);
      console.log("User created:", newUser);

      // Ensure we have the _id field
      const userWithId = {
        ...newUser,
        id: newUser._id || newUser.id, // Fallback for compatibility
      };

      setUser(userWithId);
      return userWithId;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  // Update the login function similarly
  const login = async (email, password) => {
    try {
      console.log("Attempting login for:", email);

      const userData = await authAPI.login(email, password);
      console.log("Login successful:", userData);

      // Ensure we have the _id field
      const userWithId = {
        ...userData,
        id: userData._id || userData.id, // Fallback for compatibility
      };

      setUser(userWithId);
      return userWithId;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Logout
  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  // Update user profile
  const updateUser = async (updates) => {
    if (!user) {
      throw new Error("No user logged in");
    }

    try {
      const updatedUser = await usersAPI.updateUser(
        user.id || user._id,
        updates
      );
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("Update user error:", error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

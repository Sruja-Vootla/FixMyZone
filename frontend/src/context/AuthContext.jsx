import { createContext, useContext, useState, useEffect } from "react";

// Create context
const AuthContext = createContext();

// Hook
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Save user to localStorage on change
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Signup
  const signup = async (name, email, password) => {
    // Mock backend: store users in localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    // Check if email exists
    if (users.find((u) => u.email === email)) {
      throw new Error("User already exists with this email");
    }

    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    setUser({ name, email }); // don't expose password
  };

  // Login
  const login = async (email, password) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const existingUser = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!existingUser) {
      throw new Error("Invalid credentials");
    }

    setUser({ name: existingUser.name, email: existingUser.email });
  };

  // Logout
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

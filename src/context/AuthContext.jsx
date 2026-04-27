import { createContext, useContext, useState, useCallback } from 'react';
import { mockUsers } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('cms_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((email, password) => {
    const found = mockUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) return { success: false, error: 'Invalid email or password.' };
    const { password: _pw, ...safeUser } = found;
    setUser(safeUser);
    localStorage.setItem('cms_user', JSON.stringify(safeUser));
    return { success: true, user: safeUser };
  }, []);

  const register = useCallback((data) => {
    const exists = mockUsers.find(
      (u) => u.email.toLowerCase() === data.email.toLowerCase()
    );
    if (exists) return { success: false, error: 'Email already registered.' };
    const newUser = {
      id: mockUsers.length + 1,
      name: data.name,
      email: data.email,
      role: data.role,
      avatar: data.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
      bio: '',
      joinDate: new Date().toISOString().split('T')[0],
      enrolledCourses: [],
    };
    mockUsers.push({ ...newUser, password: data.password });
    setUser(newUser);
    localStorage.setItem('cms_user', JSON.stringify(newUser));
    return { success: true, user: newUser };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('cms_user');
  }, []);

  const updateProfile = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('cms_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

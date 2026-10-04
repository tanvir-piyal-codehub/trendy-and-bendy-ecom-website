import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { db } from '../services/db';

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  loginAsCustomer: (name: string, email: string, phone: string) => void;
  logout: () => void;
  isAdmin: boolean;
  canManageOrders: boolean;
  canManageInventory: boolean;
  canManageContent: boolean;
  canManageSettings: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => db.getCurrentUser());

  useEffect(() => {
    db.setCurrentUser(currentUser);
  }, [currentUser]);

  const switchRole = (role: UserRole) => {
    const users = db.getUsers();
    const matching = users.find(u => u.role === role);
    if (matching) {
      setCurrentUser(matching);
    } else {
      const newUser: User = {
        id: `usr-${role.toLowerCase()}-${Date.now()}`,
        name: `${role.replace('_', ' ')} Staff`,
        email: `${role.toLowerCase()}@trendybendy.com`,
        role,
        createdAt: new Date().toISOString()
      };
      setCurrentUser(newUser);
    }
  };

  const loginAsCustomer = (name: string, email: string, phone: string) => {
    const customerUser: User = {
      id: `usr-cust-${Date.now()}`,
      name,
      email,
      phone,
      role: 'CUSTOMER',
      createdAt: new Date().toISOString()
    };
    setCurrentUser(customerUser);
  };

  const logout = () => {
    switchRole('CUSTOMER');
  };

  const currentRole = currentUser?.role || 'CUSTOMER';
  const isSuperAdmin = currentRole === 'SUPER_ADMIN';
  const isAdmin = isSuperAdmin || currentRole === 'ADMIN';

  const canManageOrders = isSuperAdmin || isAdmin || currentRole === 'ORDER_MANAGER' || currentRole === 'CUSTOMER_SUPPORT';
  const canManageInventory = isSuperAdmin || isAdmin || currentRole === 'INVENTORY_MANAGER' || currentRole === 'ORDER_MANAGER';
  const canManageContent = isSuperAdmin || isAdmin || currentRole === 'CONTENT_MANAGER';
  const canManageSettings = isSuperAdmin;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        switchRole,
        loginAsCustomer,
        logout,
        isAdmin,
        canManageOrders,
        canManageInventory,
        canManageContent,
        canManageSettings
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

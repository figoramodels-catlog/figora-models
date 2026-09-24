import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState } from
'react';
import type { Role, User } from '../types';

interface AuthContextValue {
  user: Omit<User, 'password'> | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => {error?: string;};
  register: (
  fullName: string,
  email: string,
  password: string)
  => {error?: string;};
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USERS_KEY = 'figora.users';
const SESSION_KEY = 'figora.session';

const seedUsers: User[] = [
{
  id: 'u-admin',
  fullName: 'Figora Admin',
  email: 'admin@figora.com',
  password: 'admin123',
  role: 'admin'
},
{
  id: 'u-demo',
  fullName: 'Nadeesha Perera',
  email: 'customer@figora.com',
  password: 'customer123',
  role: 'customer'
}];


function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {

    /* storage unavailable */}
}

function strip(user: User): Omit<User, 'password'> {
  const { password, ...rest } = user;
  return rest;
}

export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const [users, setUsers] = useState<User[]>(() => read(USERS_KEY, seedUsers));
  const [userId, setUserId] = useState<string | null>(() =>
  read<string | null>(SESSION_KEY, null)
  );

  useEffect(() => write(USERS_KEY, users), [users]);
  useEffect(() => write(SESSION_KEY, userId), [userId]);

  const user = useMemo(() => {
    const found = users.find((candidate) => candidate.id === userId);
    return found ? strip(found) : null;
  }, [users, userId]);

  const signIn = useCallback(
    (email: string, password: string) => {
      const found = users.find(
        (candidate) =>
        candidate.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (!found) return { error: 'No account found for this email.' };
      if (found.password !== password) return { error: 'Incorrect password.' };
      setUserId(found.id);
      return {};
    },
    [users]
  );

  const register = useCallback(
    (fullName: string, email: string, password: string) => {
      const normalized = email.trim().toLowerCase();
      if (users.some((candidate) => candidate.email.toLowerCase() === normalized)) {
        return { error: 'An account with this email already exists.' };
      }
      const role: Role = 'customer';
      const newUser: User = {
        id: `u-${Date.now()}`,
        fullName: fullName.trim(),
        email: normalized,
        password,
        role
      };
      setUsers((current) => [...current, newUser]);
      setUserId(newUser.id);
      return {};
    },
    [users]
  );

  const signOut = useCallback(() => setUserId(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        signIn,
        register,
        signOut
      }}>
      
      {children}
    </AuthContext.Provider>);

}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
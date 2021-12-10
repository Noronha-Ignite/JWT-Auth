import Router from 'next/router';
import { createContext, useContext, useEffect, useState } from 'react';
import { setCookie, parseCookies, destroyCookie } from 'nookies';

import { signOut } from '../services/api';
import { api } from '../services/apiClient';

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextProps = {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  user: User | null;
  isAuthenticated: boolean;
};

type SignInResponse = {
  permissions: string[];
  roles: string[];
  token: string;
  refreshToken: string;
  email: string;
};

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

const AuthContext = createContext({} as AuthContextProps);

export const AuthContextWrapper: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const isAuthenticated = !!user;

  useEffect(() => {
    const { '@jwtauth.token': token } = parseCookies();

    if (token) {
      api.get<SignInResponse>('/me').then(({ data: { email, permissions, roles } }) => {
        setUser({
          email,
          permissions,
          roles,
        });
      }).catch(() => {
        signOut();
      });
    }
  }, []);

  const signIn = async ({ email, password }: SignInCredentials) => {
    try {
      const {
        data: { token, refreshToken, permissions, roles },
      } = await api.post<SignInResponse>('sessions', {
        email,
        password,
      });

      setCookie(undefined, '@jwtauth.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
      setCookie(undefined, '@jwtauth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });

      setUser({
        email,
        permissions,
        roles,
      });

      // @ts-ignore: Unreachable code error
      api.defaults.headers['Authorization'] = `Bearer ${ token }`

      Router.push('/dashboard');
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

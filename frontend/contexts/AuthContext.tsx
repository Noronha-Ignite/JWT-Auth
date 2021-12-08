import { createContext, FormEvent, useContext, useState } from 'react';

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextProps = {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext({} as AuthContextProps);

export const AuthContextWrapper: React.FC = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const signIn = async ({ email, password }: SignInCredentials) => {
    console.log({ email, password });
    setIsAuthenticated(true);
  };

  return <AuthContext.Provider value={{ signIn, isAuthenticated }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

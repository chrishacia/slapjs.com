import React, {
    createContext,
    useCallback,
    useContext,
    useState,
    useEffect,
    ReactNode,
    FC
} from 'react';
import { env } from '../config/env';
import logger from '../utils/logger';
import { useAuth } from '../context/AuthContext';
import { User, UserContextProps } from '../types/UserContext.types';

export const UserContext = createContext<UserContextProps>({} as UserContextProps);

export const useUser = (): UserContextProps => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: FC<UserProviderProps> = ({ children }) => {
  const { isAuthenticated, userId, accessToken } = useAuth();
    const TOTAL_MINUTES = 300000;

  const [user, setUser] = useState<User>({
    userId: 0,
    name: '',
    profile_img: '',
    postalCode: '',
    totalMessages: 0,
    unreadMessages: 0,
  });

  const fetchCounts = useCallback(() => {
    fetch(`${env.api_url}/me/${userId}/msg-count`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch unread messages');
        }
        return response.json();
      })
      .then(res => {
        setUser(prevUser => ({
          ...prevUser,
          totalMessages: res.data.totalMessages,
          unreadMessages: res.data.unreadMessages === null ? 0 : res.data.unreadMessages,
        }));
      })
      .catch(error => {
        logger.log('Failed to fetch unread messages:', error);
      });
  }, [userId]);

  useEffect(() => {
    if (isAuthenticated) {
      fetch(`${env.api_url}/me/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch user details');
          }
          return response.json();
        })
        .then(res => {
          setUser({
            userId: res.data.user_id,
            name: res.data.name,
            profile_img: res.data.profile_img,
            postalCode: res.data.postalCode,
            totalMessages: res.data.totalMessages,
            unreadMessages: res.data.unreadMessages === null ? 0 : res.data.unreadMessages,
          });
        })
        .catch(error => {
          logger.log('Failed to fetch user details:', error);
        });
    }
  }, [accessToken, isAuthenticated, userId]);

  useEffect(() => {
    if (!isAuthenticated) {
      setUser({
        userId: 0,
        name: '',
        profile_img: '',
        postalCode: '',
        totalMessages: 0,
        unreadMessages: 0,
      });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchCounts();
    }, TOTAL_MINUTES);

    return () => clearInterval(interval);
  }, [fetchCounts, userId]);

  return (
    <UserContext.Provider value={{ user, setUser, fetchCounts }}>
      {children}
    </UserContext.Provider>
  );
};

export interface User {
    userId: number;
    name: string;
    profile_img: string;
    postalCode: string;
    totalMessages: number;
    unreadMessages: number;
  }

  export interface UserContextProps {
    user: User;
    setUser: React.Dispatch<React.SetStateAction<User>>;
    fetchCounts: () => void;
  }

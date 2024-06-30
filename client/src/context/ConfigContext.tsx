import React, { ReactNode, Context, createContext, FC } from 'react';

interface ConfigContextProps {
  // Define the shape of your config object here
    [key: string]: unknown;
}

export const ConfigContext: Context<ConfigContextProps | undefined> = createContext<ConfigContextProps | undefined>(undefined);

interface ConfigProviderProps {
  children: ReactNode;
  config: ConfigContextProps;
}

export const ConfigProvider: FC<ConfigProviderProps> = ({ children, config }) => {
  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
};

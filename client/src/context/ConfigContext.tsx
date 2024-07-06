import React, { ReactNode, Context, createContext, FC } from 'react';
// import { env } from '../config/env';

export interface ConfigContextProps {
    debug: boolean;
    environment: string;
    base_url: string;
    api_url: string;
    img_url: string;
    discord_server_id: string;
    discord_channel_id: string;
}

export const ConfigContext: Context<ConfigContextProps> = createContext<ConfigContextProps>({} as ConfigContextProps);

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

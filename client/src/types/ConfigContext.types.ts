export interface ConfigProviderProps {
    children: React.ReactNode;
    config: Config;
}

export interface Config {
    apiUrl: string;
    [key: string]: unknown;
}

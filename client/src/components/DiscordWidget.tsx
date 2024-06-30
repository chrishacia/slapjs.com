import React from 'react';
import config from '../config';

export interface DiscordWidgetProps {
    serverId?: string;
    channelId?: string;
    width?: string;
    height?: string;
    theme?: 'light' | 'dark';
}

export const DiscordWidget: React.FC<DiscordWidgetProps> = ({
    serverId = config.discord_server_id,
    channelId = config.discord_channel_id,
    width = '550',
    height = '500',
    theme = 'light'
}) => {
    return (
        <iframe
            src={`https://discord.com/widget?id=${serverId}&channelId=${channelId}&theme=${theme}`}
            width={width}
            height={height}
            style={{ border: 'none', backgroundColor: 'transparent' }}
            title="Discord Widget"
        ></iframe>
    );
};

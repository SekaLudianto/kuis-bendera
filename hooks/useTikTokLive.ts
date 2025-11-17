
import { useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ConnectionStatus, ChatMessage, GiftNotification, TikTokGiftEvent } from '../types';

// The backend server is expected to run on localhost:8081
const TIKTOK_LIVE_BACKEND_URL = 'https://tiktok-server-production-e573.up.railway.app';

// Define the shape of the chat data coming from the backend
interface TikTokChatEvent {
  uniqueId: string;
  nickname: string;
  comment: string;
  profilePictureUrl: string;
  msgId: string;
}

export const useTikTokLive = (
    onMessage: (message: ChatMessage) => void,
    onGift: (gift: Omit<GiftNotification, 'id'>) => void
) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const socket = useRef<Socket | null>(null);

  const connect = useCallback((username: string) => {
    if (socket.current?.connected) {
      socket.current.disconnect();
    }

    setConnectionStatus('connecting');
    setError(null);

    // Establish connection to the backend server
    socket.current = io(TIKTOK_LIVE_BACKEND_URL);

    // Event: Successfully connected to the backend WebSocket server
    socket.current.on('connect', () => {
      console.log('Connected to backend server, setting uniqueId...');
      socket.current?.emit('setUniqueId', username, {});
    });

    // Event: Backend confirms connection to TikTok Live
    socket.current.on('tiktokConnected', (state) => {
      console.log('Successfully connected to TikTok Live:', state);
      setConnectionStatus('connected');
    });

    // Event: Backend reports disconnection from TikTok Live
    socket.current.on('tiktokDisconnected', (reason: string) => {
      console.error('Disconnected from TikTok Live:', reason);
      setError(reason);
      setConnectionStatus('error');
      socket.current?.disconnect();
    });

    // Event: A new chat message is received
    socket.current.on('chat', (data: TikTokChatEvent) => {
      // Map the backend data to our internal ChatMessage type
      const message: ChatMessage = {
        id: data.msgId,
        nickname: data.nickname,
        comment: data.comment,
        profilePictureUrl: data.profilePictureUrl,
        isWinner: false, // This will be determined by the game logic
      };
      onMessage(message);
    });

    // Event: A new gift is received
    socket.current.on('gift', (data: TikTokGiftEvent) => {
        const gift: Omit<GiftNotification, 'id'> = {
            nickname: data.nickname,
            profilePictureUrl: data.profilePictureUrl,
            giftName: data.giftName,
            giftCount: data.giftCount,
        };
        onGift(gift);
    });

    // Event: Stream has ended
    socket.current.on('streamEnd', () => {
        console.log('The Live stream has ended.');
        setError('Siaran langsung telah berakhir.');
        setConnectionStatus('disconnected');
        socket.current?.disconnect();
    });

    // Event: Error connecting to the backend server
    socket.current.on('connect_error', (err) => {
      console.error('Failed to connect to backend server:', err);
      setError('Gagal terhubung ke server backend. Pastikan server berjalan.');
      setConnectionStatus('error');
    });
    
    // Event: Disconnected from backend server
    socket.current.on('disconnect', () => {
        if(connectionStatus !== 'error') {
            setConnectionStatus('disconnected');
        }
    });

  }, [onMessage, onGift, connectionStatus]);

  const disconnect = useCallback(() => {
    socket.current?.disconnect();
    socket.current = null;
    setConnectionStatus('idle');
  }, []);

  return { connectionStatus, connect, disconnect, error };
};

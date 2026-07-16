import { tokenStorage } from '../../services/api/tokenStorage';
import type { Notification } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
const WS_URL = `${API_BASE_URL.replace(/^http/, 'ws')}/ws`;

export function connectNotificationSocket(onNotification: (value: Notification) => void) {
  const accessToken = tokenStorage.getAccessToken();
  if (!accessToken) {
    return () => undefined;
  }

  let active = true;
  let socket: WebSocket | null = null;
  let reconnectTimer: number | null = null;

  const connect = () => {
    if (!active || !tokenStorage.getAccessToken()) {
      return;
    }

    socket = new WebSocket(WS_URL);
    socket.addEventListener('open', () => {
      const token = tokenStorage.getAccessToken();
      if (!token) return;
      socket?.send(
        `CONNECT\naccept-version:1.2\nheart-beat:0,0\nAuthorization:Bearer ${token}\n\n\0`,
      );
    });
    socket.addEventListener('message', (event) => {
      for (const rawFrame of String(event.data).split('\0')) {
        const frame = rawFrame.trimStart();
        if (!frame) continue;
        const separator = frame.indexOf('\n\n');
        const command = frame.slice(0, frame.indexOf('\n')).trim();
        if (command === 'CONNECTED') {
          socket?.send(
            'SUBSCRIBE\nid:notifications\ndestination:/user/queue/notifications\nack:auto\n\n\0',
          );
        } else if (command === 'MESSAGE' && separator >= 0) {
          try {
            onNotification(JSON.parse(frame.slice(separator + 2)) as Notification);
          } catch {
            // Ignore malformed broker messages and keep the live connection open.
          }
        }
      }
    });
    socket.addEventListener('close', () => {
      if (active) {
        reconnectTimer = window.setTimeout(connect, 5000);
      }
    });
  };

  connect();
  return () => {
    active = false;
    if (reconnectTimer !== null) {
      window.clearTimeout(reconnectTimer);
    }
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send('DISCONNECT\nreceipt:close\n\n\0');
    }
    socket?.close();
  };
}

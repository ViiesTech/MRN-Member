import { io } from 'socket.io-client';
import { SOCKET_URL } from '../redux/constants/apiEndpoints';

export const SOCKET_EVENTS = Object.freeze({
  CONNECT: 'connect',
  DISPLAY_TYPING: 'display_typing',
  HIDE_TYPING: 'hide_typing',
  INBOX: 'inbox',
  MARK_READ: 'mark_read',
  MESSAGES_SEEN: 'messages_seen',
  NEW_MESSAGE: 'new_message',
  STOP_TYPING: 'stop_typing',
  TYPING: 'typing',
  USER_STATUS: 'user_status',
});

class SocketService {
  socket = null;
  token = null;

  connect(token) {
    if (!token) {
      return null;
    }

    if (this.socket && this.token === token) {
      if (!this.socket.connected) {
        this.socket.connect();
      }
      return this.socket;
    }

    this.disconnect();
    this.token = token;
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token: `Bearer ${token}` },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 15000,
    });

    if (__DEV__) {
      this.socket.on('connect', () => {
        console.log('[Chat Socket] Connected:', this.socket?.id);
      });
      this.socket.on('connect_error', error => {
        console.log('[Chat Socket] Connection error:', error.message);
      });
      this.socket.on('disconnect', reason => {
        console.log('[Chat Socket] Disconnected:', reason);
      });
    }

    return this.socket;
  }

  getSocket() {
    return this.socket;
  }

  on(event, listener) {
    this.socket?.on(event, listener);
  }

  off(event, listener) {
    this.socket?.off(event, listener);
  }

  emit(event, payload) {
    if (this.socket) {
      this.socket.emit(event, payload);
      return true;
    }

    return false;
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }

    this.socket = null;
    this.token = null;
  }
}

export const socketService = new SocketService();

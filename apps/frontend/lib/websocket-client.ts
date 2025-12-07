type WebSocketEventType = 
  | 'session.started'
  | 'session.ended'
  | 'browser.screenshot'
  | 'browser.click'
  | 'browser.input'
  | 'browser.navigation'
  | 'test.started'
  | 'test.completed'
  | 'test.failed';

interface WebSocketMessage {
  type: WebSocketEventType;
  sessionId: string;
  timestamp: string;
  data: unknown;
}

interface WebSocketClientOptions {
  url?: string;
  mockMode?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

type EventListener = (message: WebSocketMessage) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private mockMode: boolean;
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private listeners: Map<WebSocketEventType | '*', Set<EventListener>> = new Map();
  private isConnecting = false;
  private mockInterval: NodeJS.Timeout | null = null;

  constructor(options: WebSocketClientOptions = {}) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const wsUrl = apiUrl.replace(/^http/, 'ws');
    
    this.url = options.url || `${wsUrl}/sessions/ws`;
    this.mockMode = options.mockMode ?? (process.env.NEXT_PUBLIC_MOCK_MODE === 'true');
    this.reconnectInterval = options.reconnectInterval || 5000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    if (this.mockMode) {
      this.startMockWebSocket();
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('session.started', { status: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnecting = false;
        this.ws = null;
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    const delay = this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts);
    this.reconnectAttempts++;

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  send(message: Partial<WebSocketMessage>): void {
    if (this.mockMode) {
      console.log('📤 Mock WebSocket send:', message);
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  on(eventType: WebSocketEventType | '*', listener: EventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);
  }

  off(eventType: WebSocketEventType | '*', listener: EventListener): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    // Call type-specific listeners
    const typeListeners = this.listeners.get(message.type);
    if (typeListeners) {
      typeListeners.forEach((listener) => listener(message));
    }

    // Call wildcard listeners
    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach((listener) => listener(message));
    }
  }

  private emit(type: WebSocketEventType, data: unknown): void {
    const message: WebSocketMessage = {
      type,
      sessionId: 'mock-session',
      timestamp: new Date().toISOString(),
      data,
    };
    this.handleMessage(message);
  }

  // Mock WebSocket for demo mode
  private startMockWebSocket(): void {
    console.log('🎭 Starting mock WebSocket');
    this.emit('session.started', { status: 'connected', mode: 'mock' });

    // Simulate periodic events
    this.mockInterval = setInterval(() => {
      const events: Array<{ type: WebSocketEventType; data: unknown }> = [
        {
          type: 'browser.screenshot',
          data: {
            url: 'https://example.com',
            timestamp: Date.now(),
            thumbnail: '/placeholder.svg?height=200&width=300',
          },
        },
        {
          type: 'browser.click',
          data: {
            selector: 'button.submit',
            coordinates: { x: 120, y: 450 },
          },
        },
        {
          type: 'browser.input',
          data: {
            selector: 'input[name="email"]',
            value: 'test@example.com',
          },
        },
        {
          type: 'test.started',
          data: {
            testId: 'test-' + Math.random().toString(36).substr(2, 9),
            testName: 'Login flow validation',
          },
        },
      ];

      const randomEvent = events[Math.floor(Math.random() * events.length)];
      this.emit(randomEvent.type, randomEvent.data);
    }, 5000);
  }

  isConnected(): boolean {
    return this.mockMode || this.ws?.readyState === WebSocket.OPEN;
  }

  getState(): 'connecting' | 'open' | 'closed' {
    if (this.mockMode) return 'open';
    if (this.isConnecting) return 'connecting';
    if (this.ws?.readyState === WebSocket.OPEN) return 'open';
    return 'closed';
  }
}

// Export singleton instance
let wsClient: WebSocketClient | null = null;

export function getWebSocketClient(): WebSocketClient {
  if (!wsClient) {
    wsClient = new WebSocketClient();
  }
  return wsClient;
}

export default WebSocketClient;

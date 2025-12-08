"use client"

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000"
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === "true"

type WebSocketEventType = 
  | "session.started"
  | "session.updated"
  | "session.ended"
  | "test.started"
  | "test.completed"
  | "healing.detected"
  | "pipeline.updated"

interface WebSocketMessage {
  type: WebSocketEventType
  data: unknown
  timestamp: string
}

type MessageHandler = (message: WebSocketMessage) => void

export class WebSocketClient {
  private ws: WebSocket | null = null
  private handlers: Map<WebSocketEventType, Set<MessageHandler>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isIntentionallyClosed = false
  private mockInterval: NodeJS.Timeout | null = null

  constructor() {
    if (MOCK_MODE) {
      this.startMockMode()
    }
  }

  connect(sessionId?: string): void {
    if (MOCK_MODE) {
      console.log("[WebSocket] Mock mode - simulating connection")
      return
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log("[WebSocket] Already connected")
      return
    }

    this.isIntentionallyClosed = false
    const url = sessionId ? `${WS_URL}/ws?sessionId=${sessionId}` : `${WS_URL}/ws`

    try {
      this.ws = new WebSocket(url)

      this.ws.onopen = () => {
        console.log("[WebSocket] Connected")
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error("[WebSocket] Failed to parse message:", error)
        }
      }

      this.ws.onerror = (error) => {
        console.error("[WebSocket] Error:", error)
      }

      this.ws.onclose = () => {
        console.log("[WebSocket] Disconnected")
        if (!this.isIntentionallyClosed) {
          this.attemptReconnect()
        }
      }
    } catch (error) {
      console.error("[WebSocket] Connection failed:", error)
      this.attemptReconnect()
    }
  }

  disconnect(): void {
    this.isIntentionallyClosed = true
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    if (this.mockInterval) {
      clearInterval(this.mockInterval)
      this.mockInterval = null
    }
  }

  send(message: Partial<WebSocketMessage>): void {
    if (MOCK_MODE) {
      console.log("[WebSocket] Mock send:", message)
      return
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn("[WebSocket] Cannot send - not connected")
    }
  }

  on(eventType: WebSocketEventType, handler: MessageHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set())
    }
    this.handlers.get(eventType)!.add(handler)
  }

  off(eventType: WebSocketEventType, handler: MessageHandler): void {
    this.handlers.get(eventType)?.delete(handler)
  }

  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.handlers.get(message.type)
    if (handlers) {
      handlers.forEach((handler) => handler(message))
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[WebSocket] Max reconnect attempts reached")
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`)
    
    setTimeout(() => {
      if (!this.isIntentionallyClosed) {
        this.connect()
      }
    }, delay)
  }

  private startMockMode(): void {
    console.log("[WebSocket] Starting mock mode")
    
    // Simulate periodic WebSocket events
    this.mockInterval = setInterval(() => {
      const mockEvents: WebSocketMessage[] = [
        {
          type: "test.completed",
          data: {
            testId: `test-${Math.floor(Math.random() * 1000)}`,
            status: Math.random() > 0.8 ? "failed" : "passed",
            duration: Math.floor(Math.random() * 5000) + 500,
          },
          timestamp: new Date().toISOString(),
        },
        {
          type: "healing.detected",
          data: {
            testId: `test-${Math.floor(Math.random() * 1000)}`,
            selector: "#old-selector",
            suggestion: "[data-testid='new-selector']",
            confidence: 0.85 + Math.random() * 0.14,
          },
          timestamp: new Date().toISOString(),
        },
        {
          type: "pipeline.updated",
          data: {
            pipelineId: `pipeline-${Math.floor(Math.random() * 30) + 1}`,
            status: Math.random() > 0.5 ? "success" : "failure",
          },
          timestamp: new Date().toISOString(),
        },
      ]

      // Randomly emit a mock event
      if (Math.random() > 0.7) {
        const event = mockEvents[Math.floor(Math.random() * mockEvents.length)]
        this.handleMessage(event)
      }
    }, 5000) // Every 5 seconds
  }
}

// Singleton instance
let wsClientInstance: WebSocketClient | null = null

export function getWebSocketClient(): WebSocketClient {
  if (typeof window === "undefined") {
    // SSR - return a dummy client
    return {
      connect: () => {},
      disconnect: () => {},
      send: () => {},
      on: () => {},
      off: () => {},
    } as WebSocketClient
  }

  if (!wsClientInstance) {
    wsClientInstance = new WebSocketClient()
  }
  return wsClientInstance
}

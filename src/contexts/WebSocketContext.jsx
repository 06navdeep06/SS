import React, { createContext, useContext, useEffect, useState } from 'react'

const WebSocketContext = createContext()

export const useWebSocket = () => {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [stats, setStats] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    // Try to connect to WebSocket
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket('ws://localhost:8000/ws')
        
        ws.onopen = () => {
          console.log('WebSocket connected')
          setIsConnected(true)
          setSocket(ws)
        }
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            handleWebSocketMessage(data)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }
        
        ws.onclose = () => {
          console.log('WebSocket disconnected')
          setIsConnected(false)
          setSocket(null)
          
          // Attempt to reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000)
        }
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          setIsConnected(false)
        }
        
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error)
        // Retry connection after 5 seconds
        setTimeout(connectWebSocket, 5000)
      }
    }

    connectWebSocket()

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.close()
      }
    }
  }, [])

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'stats_update':
        setStats(data.payload)
        break
      case 'new_screenshot':
        setRecentActivity(prev => [data.payload, ...prev.slice(0, 9)])
        break
      case 'activity_update':
        setRecentActivity(prev => [data.payload, ...prev.slice(0, 9)])
        break
      default:
        console.log('Unknown WebSocket message type:', data.type)
    }
  }

  const sendMessage = (message) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message))
    }
  }

  const value = {
    socket,
    isConnected,
    stats,
    recentActivity,
    sendMessage
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}
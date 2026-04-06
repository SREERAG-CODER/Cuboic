import { io } from 'socket.io-client'
import { SOCKET_BASE } from './apiClient'

const socket = io(SOCKET_BASE, {
  autoConnect: false,
  reconnection: true,
})

export const connectSocket = async () => {
  if (window.ipcRenderer) {
    const auth = await window.ipcRenderer.invoke('auth:get-token')
    if (auth?.token) {
      socket.auth = { token: auth.token, outletId: auth.outletId }
      socket.connect()
    }
  }
}

export const disconnectSocket = () => {
  socket.disconnect()
}

export default socket

import { io } from "socket.io-client";

let socket;

export function initSocket(token) {
  if (!socket) {
    socket = io("http://localhost:5000", {
      auth: { token }
    });
  }
  return socket;
}

export function getSocket() {
  return socket;
}

# 🧠 Real-Time Multiplayer Math Match Game

A fun and educational real-time memory matching game where players compete to match math equations with their correct answers. Built with **React**, **Node.js**, and **Socket.IO**, this game allows two players to join a room and challenge each other in solving math-based memory cards.

---

### 👥 Created By

- **Anuj Tanwar**
- **Sachin Panwar**

---

## 🚀 Features

- 🧠 Memory game with a twist: **match math expressions with their correct answers**
- 🔗 Real-time gameplay using **Socket.IO**
- 🧑‍🤝‍🧑 Supports **two players** per room
- 🛡️ Handles player disconnects and room cleanup
- 🕹️ Game restart without rejoining
- ⏳ Countdown timer before the game starts
- 🎯 Score tracking and winner display at game end

---

## 🧩 Game Rules

1. Players join a unique room (created or shared via room ID).
2. Each card shows either a math **equation** (like `3 + 4`) or an **answer** (like `7`).
3. Players take turns flipping two cards.
4. If a player matches an equation with its correct answer, they score a point and continue.
5. If not, the turn passes to the next player.
6. The game ends when all pairs are matched. Highest score wins!

---

## 🏗️ Project Structure

##  backend server treats each browser tab (or window) as a separate client because:

   ))Each tab establishes a unique WebSocket connection to the server.

   )) Socket.IO assigns a unique socket.id to every connection.

   ))You are identifying players only by socket.id, not by IP address, browser fingerprint, or any kind of session/cookie.

      So even though it's the same machine, from the server's point of view:

Tab A: socket.id = abc123

Tab B: socket.id = xyz456
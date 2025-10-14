# 🥊 Punch Perfect Web — Project Planning Document

## Overview
**Punch Perfect Web** is the next evolution of the original **Punch Perfect** prototype — a computer vision–based boxing game originally developed in Python using OpenCV, Mediapipe, and Pygame.  
The goal of this new version is to transform the concept into a **polished, full-stack web application** built primarily with **JavaScript**, **WebGL**, and **WebRTC**, making it fully playable in the browser with no local installation required.

---

## 🎯 Project Goals

- **Modernize the tech stack:** Move from Python/OpenCV to JavaScript-based frameworks (e.g., TensorFlow.js, MediaPipe.js).
- **Improve accessibility:** Enable play directly in the browser with webcam-based hand tracking.
- **Enhance visuals:** Develop an interactive, animated, and responsive UI with smooth motion and sound design.
- **Add backend features:** Track scores, player progress, and fitness data.
- **Expand gameplay:** Introduce multiple modes (Targets, Reaction, Multiplayer, Training Mode).
- **Polish for deployment:** Make the game ready for public hosting and user accounts.

---

## 🧠 System Architecture

### Frontend
**Stack:**
- **React** (UI framework)
- **TensorFlow.js / MediaPipe.js** (pose and hand tracking)
- **Three.js / Pixi.js** (for interactive visuals, optional)
- **Tailwind CSS** (styling)
- **Howler.js** (sound effects)
- **Framer Motion** (animations)

**Responsibilities:**
- Access webcam feed
- Run pose detection in real-time
- Map hand movement to game interactions
- Display score, timers, and feedback
- Manage different game modes and difficulty

---

### Backend
**Stack:**
- **Node.js + Express** (API)
- **MongoDB** (player data and scores)
- **WebSockets (Socket.io)** (real-time multiplayer)
- **JWT Authentication** (secure login)

**Responsibilities:**
- Store and fetch user profiles, scores, and fitness metrics
- Handle multiplayer room management and synchronization
- Manage workout/session history

---

### Deployment
**Stack:**
- **Frontend:** Vercel or Netlify  
- **Backend:** Render / Railway / AWS  
- **Database:** MongoDB Atlas  
- **CI/CD:** GitHub Actions  

---

## 🕹️ Planned Game Modes

| Mode | Description | Features |
|------|--------------|-----------|
| 🎯 **Targets Mode** | Punch left/right color-coded targets before time runs out | Randomized target spawns, hit feedback, accuracy % |
| ⚡ **Reaction Mode** | React as quickly as possible when the punch indicator appears | Reaction time measurement, high score tracking |
| 👥 **Fruit Ninja Mode** | Instead of cutting fruits in fruit ninja, we will punch/chop them

---

## 🎨 Visual & UX Design

**Goals:**
- Sleek, responsive UI inspired by modern fitness and boxing apps
- Dynamic background visuals that react to punches
- Minimal latency in video and hit detection
- Animated feedback (flash, vibration, particles on hit)

**Pages:**
1. **Home Page:** Game intro + “Start Game” button
2. **Mode Select Page:** Choose between game modes
3. **Game Page:** Live webcam feed, overlays, score HUD
4. **Results Page:** Stats, replay, and share options
5. **Profile Page:** View history, settings, and achievements

---

## 🔧 Technical Tasks (Milestones)

### Phase 1 — Core Conversion (Weeks 1–2)
- [ ] Setup React + Vite project
- [ ] Integrate webcam access with `navigator.mediaDevices.getUserMedia()`
- [ ] Implement basic pose detection using `MediaPipe.js`
- [ ] Detect punch motion (velocity threshold on hand keypoints)
- [ ] Basic game canvas with hit detection and sound

### Phase 2 — Gameplay Logic (Weeks 3–4)
- [ ] Add Targets and Reaction modes
- [ ] Visual feedback and score system
- [ ] Timer and session management
- [ ] UI components with Tailwind

### Phase 3 — New Fruit Ninja Mode (Weeks 5–6)
- [ ] Create fruits and bombs
- [ ] Karate Chop action to slice multiple fruits together
- [ ] Track Highscores

### Phase 4 — Backend Integration (Weeks 7–8)
- [ ] Build Express API and MongoDB schema
- [ ] Connect frontend to backend via REST
- [ ] Store and display player history
- [ ] Implement JWT authentication

### Phase 4 — Polish (Weeks 9–10)
- [ ] Add animation polish (Framer Motion)
- [ ] Optimize performance and camera latency
- [ ] Final UI/UX design and responsive layout

---

## 🧩 Optional Future Add-ons

- AI coach feedback (using ML models to assess punch form)
- Fitness tracker integration (e.g., Fitbit, Apple Health)
- Global leaderboard and social sharing
- Workout customization (intensity, duration)
- Voice feedback or commentary

---

## 📚 References

- [MediaPipe.js documentation](https://developers.google.com/mediapipe/solutions/vision/pose/web)
- [TensorFlow.js Models](https://www.tensorflow.org/js/models)
- [Socket.io Realtime Guide](https://socket.io/get-started/chat)
- [Vercel Deployment Docs](https://vercel.com/docs)
- [Three.js Fundamentals](https://threejs.org/docs/index.html)

---

## 👥 Contributors

| Name | Role | Notes |
|------|------|-------|
| Aaron Xu | Founder / Lead Developer | Created original Python version |
| Brian Yin | Founder / Lead Developer | Created original Python version |
| Rudransh Srivastava | Founder / Lead Developer | Created original Python version |
| Future collaborators | Frontend / Backend Developers | To be added as project grows |

---

## 🗺️ Roadmap Summary

| Stage | Focus | Status |
|--------|--------|--------|
| Prototype | Original Python version | ✅ Complete |
| Web MVP | JS frontend (single-player) | 🔄 In Progress |
| Backend API | Score + profile storage | ⏳ Planned |
| Full Release | Deployment + polish | ⏳ Future |

---

**Last Updated:** October 2025  
**Maintained by:** [@AaronXu07](https://github.com/AaronXu07)

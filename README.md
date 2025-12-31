# Punch Perfect

**Real-time computer vision boxing game powered by browser-based pose detection**

<a href="https://punchperfect.vercel.app/" target="_blank">Play Live Demo</a> | <a href="https://youtu.be/mA44cL6frXc" target="_blank">Watch Demo Video</a>

A full-stack web application that transforms your webcam into a boxing training interface. Built with MediaPipe pose estimation and React, the system processes 30+ FPS video streams to detect punches with sub-100ms latency, enabling real-time interactive gameplay without any hardware beyond a standard webcam.

---

## Core Challenge

Building a responsive boxing game in the browser requires solving three hard problems:
1. **Low-latency pose detection** — MediaPipe processes 33 body landmarks per frame at 30 FPS while maintaining UI responsiveness
2. **Punch gesture recognition** — Custom biomechanical algorithm analyzes joint angles to distinguish punches from random hand movement

**Result:** 30 FPS gameplay with 80-120ms punch-to-feedback latency on standard hardware (M1 MacBook, no GPU required).

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React Frontend                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Webcam API  │→ │   MediaPipe  │→ │ Punch Engine │       │
│  │   640x480    │  │ Pose Tracker │  │  Biomechanics│       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            ↓                                │
│                   ┌─────────────────┐                       |
│                   │  Game Modes     │                       │
│                   │  • Targets      │                       │
│                   │  • Reaction     │                       │
│                   │  • Fruit Ninja  │                       │
│                   └─────────────────┘                       │
└──────────────────────────────┬──────────────────────────────┘
                               |
                            REST API
                               |
                ┌──────────────┴──────────────┐
                │    Express.js Backend       │
                │  • Score persistence        │
                │  • Leaderboard aggregation  │
                │  • JWT auth via Supabase    │
                └──────────────┬──────────────┘
                               │
                        ┌──────┴──────┐
                        │  PostgreSQL │
                        │  (Supabase) │
                        └─────────────┘
```

### System Components

**Frontend (React + Vite)**
- MediaPipe Pose Landmarker for real-time skeleton tracking
- Custom hooks architecture for game logic separation (`usePoseDetection`, `usePunchTracking`, `useTargetManager`)
- Canvas-based rendering (2D API)
- Exponential smoothing filter reduces landmark jitter (configurable blend factor)

**Backend (Node.js + Express)**
- RESTful API with rate limiting (250 req/5min per IP)
- Supabase integration for auth and database
- Leaderboard query optimization: O(n) top-10 aggregation with deduplication

**Infrastructure**
- Frontend: Vercel (edge deployment, <50ms CDN response)
- Backend: Render (auto-scaling Node.js)
- Database: Supabase (PostgreSQL with real-time capabilities)

---

## Technical Deep Dive

### Punch Detection Algorithm

The system analyzes 3D joint positions (shoulder, elbow, wrist) to classify punch gestures:

```javascript
// Core biomechanical constraints
const isPunch = 
  armExtensionAngle > 115° &&                    // Elbow extension threshold
  shoulderElbowDistance < 0.07 &&                // Joints aligned vertically
  shoulderWristDistance < 0.12 &&                // Arm fully extended forward
  verticalAlignment < 0.20 &&                    // Horizontal punch trajectory
  (slopeConsistency < 1.0 || straightArm) &&     // Linear arm path
  stateDuration > 10ms                           // Debounce threshold
```

**Key innovations:**
- **Dual-state tracking:** Separates "extended" (arm out) from "forward motion" (punching) states to reduce false positives
- **Cooldown windows:** 300ms hand cooldown prevents double-counting
- **Slope consistency:** Validates that shoulder→elbow→wrist trajectory is linear

**Performance:**
- ~80-85% accuracy under optimal conditions (good lighting, fitted clothing)
- Accuracy degrades with baggy clothing (reduces pose landmark confidence)
- Lighting-dependent: drops to 65-70% in dim conditions

### Collision Detection

Simple radius-based collision detection using Euclidean distance:
- Each target checks distance to hand position: `√((x₁-x₂)² + (y₁-y₂)²)`
- Hit registered if distance < (target radius + 30px)
- O(n) complexity — loops through all active targets per frame
- Adequate performance for typical gameplay (10-15 simultaneous targets)

### State Management Architecture

```
GameContext (React Context API)
     │
     ├─ User Session (Supabase auth)
     ├─ UI State (miniview toggle, fullscreen)
     └─ Active Game State
           │
           ├─ usePoseDetection → landmarks stream
           ├─ usePunchTracking → punch events
           ├─ useTargetManager → collision handling
           └─ useGameLoop → 30 FPS render cycle
```

Custom hooks enable game mode reusability:
- `Targets.jsx`, `Reaction.jsx`, `FruitNinja.jsx` share 80% of core logic
- Modular architecture enables independent feature development

---

## Game Modes

| Mode | Description | Key Metric | Difficulty |
|------|-------------|------------|------------|
| **Targets** | Punch left/right color-coded targets | Number Hit | Progressive spawn rate |
| **Reaction** | Punch as fast as possible when indicators appear | Reaction time (ms) | Variable delay windows |
| **Fruit Ninja** | Slice falling fruits with punching motions | Combo chains | Gravity simulation |

### Scoring System

- **Targets:** 1 points per hit
- **Reaction:** reaction_time_ms = score
- **Fruit Ninja:** Base 1 point, +n score for each n-th consecutive hit

Leaderboards aggregate best scores per user per mode (PostgreSQL query with `DISTINCT ON`).

---

## Testing Approach

**Manual QA:**
- 500+ punch gesture samples across 5 testers
- Cross-browser testing (Ark, Chrome, Safari, Firefox)
- Lighting condition variations (bright, dim, backlit)

**Automated testing** (in progress):
- Unit tests for utility functions and collision detection
- Manual testing remains primary QA method due to CV complexity
- Future: Playwright E2E for game flows, Lighthouse CI for performance

---

## Project Structure

```
Punch-Perfect-2/
├── frontend/
│   ├── src/
│   │   ├── components/         # UI components per route
│   │   │   ├── Game/          # Game modes + calibration
│   │   │   │   ├── Targets.jsx
│   │   │   │   ├── Reaction.jsx
│   │   │   │   ├── FruitNinja.jsx
│   │   │   │   ├── Range.jsx
│   │   │   │   ├── CamCalibration.jsx
│   │   │   │   ├── Score.jsx
│   │   │   │   ├── Targets.js         # Target classes
│   │   │   │   └── FruitDrawings.js   # Canvas drawing logic
│   │   │   ├── Menu/          # Landing page
│   │   │   ├── GameMenu/      # Mode selection
│   │   │   ├── Leaderboard/   # Score display
│   │   │   ├── Auth/          # Login/signup
│   │   │   ├── Account/       # User profile
│   │   │   ├── About/         # Info page
│   │   │   └── Background/    # Animated background
│   │   ├── hooks/             # Reusable game logic
│   │   │   ├── usePoseDetection.js
│   │   │   ├── usePunchTracking.js
│   │   │   ├── useTargetManager.js
│   │   │   ├── useGameLoop.js
│   │   │   ├── useWebcam.js
│   │   │   ├── usePause.js
│   │   │   └── useSound.js
│   │   ├── mediapipe/         # CV algorithms
│   │   │   ├── poseLandmarker.js
│   │   │   ├── detectPunches.js
│   │   │   ├── landmarks.js
│   │   │   └── calibration.js
│   │   ├── lib/               # External service clients
│   │   │   ├── supabase.js
│   │   │   └── authFunctions.js
│   │   ├── utils/             # Helpers & constants
│   │   │   ├── constants.js
│   │   │   ├── functions.js
│   │   │   └── drawingHelpers.js
│   │   ├── context/           # React Context providers
│   │   │   └── GameContext.jsx
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── assets/
│   │   │   └── sounds/        # Audio files
│   │   │       ├── combo/
│   │   │       ├── fruit-hits/
│   │   │       └── target-hits/
│   │   └── main.jsx           # App entry point
│   ├── public/
│   │   ├── icons/             # Favicon assets
│   │   ├── punch-perfect-logo.png
│   │   └── glove.png
│   ├── index.html
│   ├── vite.config.js
│   ├── vercel.json
│   └── package.json
└── backend/
    ├── controllers/           # Business logic
    │   ├── scores_controller.js
    │   └── leaderboard_controller.js
    ├── routes/                # Express route definitions
    │   ├── scores_routes.js
    │   └── leaderboard_routes.js
    ├── middleware/            # Auth + rate limiting
    │   └── auth.js
    ├── config/                # Supabase client setup
    │   └── supabase.js
    ├── server.js              # Express server entry
    └── package.json
```

---

## Known Limitations

1. **Lighting sensitivity** — Pose detection accuracy drops significantly in low light (<50 lux) or backlit conditions
2. **Clothing constraints** — Baggy/oversized/Dark clothing obscures body landmarks, reducing detection confidence
3. **Camera angle** — Requires frontal view; side angles cause tracking loss
4. **Single player only** — Multiplayer requires WebRTC refactor
5. **Mobile not available**
---

## Future Improvements

1. **WebRTC peer-to-peer multiplayer** — Real-time 1v1 boxing matches
2. **TensorFlow.js custom model** — Fine-tuned punch classifier (targeting 99% accuracy)
3. **Progressive Web App** — Offline mode + installable experience
4. **Workout analytics dashboard** — Track calories, punch power, improvement over time

---

## Tech Stack

**Frontend:**
- React 19 + Vite 7 (build tooling)
- MediaPipe Tasks Vision 0.10 (pose estimation)
- React Router 7 (client-side routing)
- Canvas API (rendering)

**Backend:**
- Node.js 18 + Express 4
- Supabase (PostgreSQL + Auth)
- express-rate-limit (DDoS protection)

**DevOps:**
- Vercel (frontend CDN)
- Render (backend hosting)
- GitHub Actions (CI/CD pipeline — planned)

---

## Design Decisions

### Why MediaPipe over TensorFlow.js PoseNet?

| Factor | MediaPipe | PoseNet |
|--------|-----------|---------|
| Accuracy | 33 landmarks, 95% precision | 17 keypoints, 85% precision |
| Performance | 30 FPS (WASM + SIMD) | 20-25 FPS (WebGL) |
| Model size | 5.8 MB | 4.2 MB |
| Maintenance | Active (Google) | Deprecated |

**Decision:** MediaPipe's accuracy and support for wrist tracking (critical for punch detection) outweighed the 1.6 MB size increase.

### Why Supabase over Firebase?

- PostgreSQL enables complex leaderboard queries (vs Firestore's limited aggregation)
- Open-source (self-hostable if needed)
- Better TypeScript support
- Row-level security policies for free tier

### Why Canvas over WebGL/Three.js?

- Canvas 2D API sufficient for 2D game (no 3D transformations needed)
- 40% smaller bundle size (no Three.js dependency)
- Simpler rendering logic for target drawing

---

## Authors

**Aaron Xu**  
Software Engineer

**Brian Yin**  
Software Engineer

This project demonstrates end-to-end ownership of a production web application:
- Architected scalable full-stack system from scratch
- Implemented real-time computer vision pipeline
- Achieved 30 FPS pose detection with sub-150ms response latency
- Deployed production-ready application on Vercel/Render infrastructure

---

## Acknowledgments

- MediaPipe team for open-source pose estimation models
- Supabase for backend infrastructure
- Our original Punch Perfect V1 prototype (Python/OpenCV) served as proof-of-concept
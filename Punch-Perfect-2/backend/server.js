import express from "express"; 

import dotenv from "dotenv"; 
dotenv.config(); 

import cors from "cors"; 
import rateLimit from "express-rate-limit";

import scoreRoutes from "./routes/scores_routes.js"; 
import leaderboardRoutes from "./routes/leaderboard_routes.js"; 

const app = express(); 

app.use(cors()); 
app.use(express.json()); 

// Rate Limiter Configuration
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 250, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { error: "Too many requests from this IP, please try again later." }
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

const PORT = process.env.PORT; 

app.use('/api/scores', scoreRoutes); 
app.use('/api/leaderboard', leaderboardRoutes); 

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})


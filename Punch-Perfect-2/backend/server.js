import express from "express"; 

import dotenv from "dotenv"; 
dotenv.config(); 

import cors from "cors"; 

import scoreRoutes from "./routes/scores_routes.js"; 
import leaderboardRoutes from "./routes/leaderboard_routes.js"; 

const app = express(); 

app.use(cors()); 
app.use(express.json()); 

const PORT = process.env.PORT; 

app.use('/api/scores', scoreRoutes); 
app.use('/api/leaderboard', leaderboardRoutes); 

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})


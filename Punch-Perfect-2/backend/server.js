import express from "express"; 

import dotenv from "dotenv"; 
dotenv.config(); 

import cors from "cors"; 

import supabase from "./config/supabase.js"; 
import scoreRoutes from "./routes/scores.js"; 

const app = express(); 

app.use(cors()); 
app.use(express.json()); 

const PORT = process.env.PORT; 

app.use('/api/scores', scoreRoutes); 

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})


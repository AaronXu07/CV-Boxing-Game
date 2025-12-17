import express from "express"; 

import dotenv from "dotenv"; 
dotenv.config(); 

import cors from "cors"; 



import supabase from "./config/supabase.js"; 

const app = express(); 

app.use(cors()); 
app.use(express.json()); 

const PORT = process.env.PORT; 

app.get("/test", async (req, res) => {
    try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*"); 

        if (error) {
            return res.status(500).json({ error:error.message }); 
        }

        res.json({profiles: data}); 
    } catch (error) {
        res.status(500).json({ error: "Something went wrong"}); 
    }
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})


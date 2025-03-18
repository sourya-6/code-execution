const express = require("express");
const bodyParser = require("body-parser");
const redisClient = require("./redisClient");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(bodyParser.json());

app.post("/execute", async (req, res) => {
    const { code, language } = req.body;
    if (!code || !language) {
        return res.status(400).json({ error: "Code and language required" });
    }

    const jobId = uuidv4();
    await redisClient.rpush("jobQueue", JSON.stringify({ jobId, code, language }));
    
    res.json({ message: "Job received", jobId });
});

app.listen(5000, () => console.log("Server running on port 5000"));

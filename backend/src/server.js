const express = require("express");
const bodyParser = require("body-parser");
const redisClient = require("./redisClient");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(bodyParser.json());

// Submit Code for Execution
app.post("/execute", async (req, res) => {
    const { code, language } = req.body;
    if (!code || !language) {
        return res.status(400).json({ error: "Code and language required" });
    }

    const jobId = uuidv4();
    await redisClient.rPush("jobQueue", JSON.stringify({ jobId, code, language }));

    
    res.json({ message: "Job received", jobId });
});

// Get Execution Result
app.get("/result/:jobId", async (req, res) => {
    const { jobId } = req.params;
    
    const result = await redisClient.get(`jobResults:${jobId}`);
    console.log(result);
    console.log('hey')
    if (!result) {
        return res.json({ status: "Processing" });
    }
    
    res.json({ status: "Completed", output: result });
});

app.listen(5000, () => console.log("Server running on port 5000"));

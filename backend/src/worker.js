const redisClient = require("./redisClient");
const { executeCode } = require("./executeCode");

async function processQueue() {
    while (true) {
        const job = await redisClient.lpop("jobQueue");
        if (job) {
            const { jobId, code, language } = JSON.parse(job);
            console.log(`Executing Job: ${jobId}`);
            const result = await executeCode(code, language);
            console.log(`Job ${jobId} Output:`, result);
        }
    }const redisClient = require("./redisClient");
    const { exec } = require("child_process");
    
    async function processJobs() {
        while (true) {
            const jobData = await redisClient.lpop("jobQueue");
            if (!jobData) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
            }
    
            const { jobId, code, language } = JSON.parse(jobData);
            console.log(`Executing job ${jobId}`);
    
            let command;
            if (language === "python") command = `python3 -c "${code}"`;
            else if (language === "javascript") command = `node -e "${code}"`;
            else {
                await redisClient.set(`jobResults:${jobId}`, "Error: Unsupported language");
                continue;
            }
    
            exec(command, async (err, stdout, stderr) => {
                if (err) {
                    await redisClient.set(`jobResults:${jobId}`, `Error: ${stderr}`);
                } else {
                    await redisClient.set(`jobResults:${jobId}`, stdout);
                }
            });
        }
    }
    
    processJobs();
    
}

processQueue();

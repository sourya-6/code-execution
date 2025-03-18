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
    }
}

processQueue();

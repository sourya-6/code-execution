const redisClient = require("./redisClient");
const { exec } = require("child_process");

async function processJobs() {
    while (true) {
        // Fetch job from Redis queue
        const jobData = await redisClient.lPop("jobQueue");
        
        if (!jobData) {
            // If no job, wait for a second and check again
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
            console.log(`Job ${jobId} completed!`);
        });
    }
}

processJobs();

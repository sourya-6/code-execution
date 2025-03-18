const redisClient = require("./redisClient");
const { exec } = require("child_process");

async function processJobs() {
  while (true) {
    try {
      console.log("Checking for jobs in queue...");
      const jobData = await redisClient.lPop("jobQueue");

      if (!jobData) {
        console.log("No jobs found. Waiting...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      const { jobId, code, language } = JSON.parse(jobData);
      console.log(`🚀 Executing job: ${jobId} with language: ${language}`);

      let command;
      if (language === "python") command = `python3 -c "${code}"`;
      else if (language === "javascript") command = `node -e "${code}"`;
      else {
        console.log(`❌ Unsupported language: ${language}`);
        await redisClient.set(
          `jobResults:${jobId}`,
          "Error: Unsupported language"
        );
        continue;
      }

      exec(command, async (err, stdout, stderr) => {
        if (err) {
          console.error(`❌ Error in job ${jobId}:`, stderr);
          await redisClient.set(`jobResults:${jobId}`, `Error: ${stderr}`);
        } else {
          console.log(`✅ Job ${jobId} completed! Output:`, stdout);
          await redisClient.set(`jobResults:${jobId}`, stdout);
        }
      });
    } catch (error) {
      console.error("🔥 Unexpected error:", error);
    }
  }
}

processJobs();

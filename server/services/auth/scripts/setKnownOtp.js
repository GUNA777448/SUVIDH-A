const { redisClient } = require("../src/config/redis");
const { hashOtp } = require("../src/utils/otp");

async function run() {
  const email = "gurunadharao5718@gmail.com";
  const otp = "654321";

  const hash = hashOtp(email, otp);
  await redisClient.connect();
  await redisClient.setEx(`otp:${email}`, 300, hash);
  console.log("Set known OTP hash for test user");
}

run()
  .catch((error) => {
    console.error("Failed to set known OTP:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
  });

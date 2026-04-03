function rootHandler(req, res) {
  return res.json({
    service: "auth",
    status: "running",
    message: "SUVIDHA auth service is running",
  });
}

function healthHandler(req, res) {
  const dbStatus = req.app.locals.dbConnected ? "connected" : "disconnected";
  const redisStatus = req.app.locals.redisConnected
    ? "connected"
    : "disconnected";

  return res.json({
    service: "auth",
    status:
      dbStatus === "connected" && redisStatus === "connected"
        ? "healthy"
        : "degraded",
    dependencies: {
      postgres: dbStatus,
      redis: redisStatus,
    },
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  rootHandler,
  healthHandler,
};

/**
 * Global error handling middleware for REST APIs.
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[API Error] ${req.method} ${req.path}:`, err.message);

  const statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  const code =
    err.message?.includes("not found") ||
    err.message?.includes("Not found")
      ? 404
      : err.message?.includes("required") ||
          err.message?.includes("already") ||
          err.message?.includes("expired")
        ? 400
        : statusCode;

  res.status(code).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;

/**
 * Global error handler middleware
 * Catches all errors and returns a consistent JSON response format
 * Must be added as the last middleware in the application
 */
export function errorHandler(err, req, res, next) {
  // Log error to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error occurred:', err);
    console.error('Stack trace:', err.stack);
  }

  // Determine status code
  let statusCode = err.statusCode || err.status || 500;

  // Handle specific error types
  let errorMessage = err.message || 'An unexpected error occurred';

  // Validation errors (from express-validator or custom validation)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorMessage = err.message || 'Validation failed';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorMessage = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 403;
    errorMessage = 'Authentication token has expired';
  }

  // MongoDB/Database errors (if applicable in future)
  if (err.name === 'MongoError' || err.name === 'CastError') {
    statusCode = 400;
    errorMessage = 'Database operation failed';
  }

  // Syntax errors (malformed JSON)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    errorMessage = 'Invalid JSON format in request body';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: errorMessage,
    statusCode: statusCode,
    // Include stack trace only in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

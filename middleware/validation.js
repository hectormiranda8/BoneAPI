/**
 * Validation middleware for user registration
 * Validates username, email, and password fields
 */
export function validateRegister(req, res, next) {
  const { username, email, password } = req.body;
  const errors = [];

  // Validate username
  if (!username) {
    errors.push('Username is required');
  } else if (typeof username !== 'string') {
    errors.push('Username must be a string');
  } else if (username.length < 3 || username.length > 20) {
    errors.push('Username must be between 3 and 20 characters');
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }

  // Validate email
  if (!email) {
    errors.push('Email is required');
  } else if (typeof email !== 'string') {
    errors.push('Email must be a string');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Email must be a valid email address');
  }

  // Validate password
  if (!password) {
    errors.push('Password is required');
  } else if (typeof password !== 'string') {
    errors.push('Password must be a string');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors.join(', '),
      statusCode: 400
    });
  }

  next();
}

/**
 * Validation middleware for user login
 * Validates that email/username and password are present
 */
export function validateLogin(req, res, next) {
  const { email, username, password } = req.body;
  const errors = [];

  // Require either email or username
  if (!email && !username) {
    errors.push('Email or username is required');
  }

  // Validate password
  if (!password) {
    errors.push('Password is required');
  } else if (typeof password !== 'string') {
    errors.push('Password must be a string');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors.join(', '),
      statusCode: 400
    });
  }

  next();
}

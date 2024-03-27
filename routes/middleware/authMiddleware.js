const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    console.log(`Access granted for user with ID: ${req.session.userId}`); // Logging access grant
    return next(); // User is authenticated, proceed to the next middleware/route handler
  } else {
    console.error('Access denied. User is not authenticated.'); // Logging access denial
    return res.status(401).send('You are not authenticated'); // User is not authenticated
  }
};

const isManager = (req, res, next) => {
  if (req.session.role === 'manager') {
    console.log(`Manager access confirmed for user ID: ${req.session.userId}`); // Logging manager access confirmation
    return next(); // User is authenticated as a manager, proceed to the next middleware/route handler
  } else {
    console.error('Access denied. User is not authorized as a manager.'); // Logging manager access denial
    return res.status(403).send('You are not authorized to access this page'); // User is not authorized as a manager
  }
};

module.exports = {
  isAuthenticated,
  isManager
};
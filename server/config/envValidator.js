const validateEnv = () => {
  const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'PORT'
  ];

  const missing = requiredVars.filter(envVar => !process.env[envVar]);

  if (missing.length > 0) {
    console.error('CRITICAL SERVER CONFIGURATION ERROR:');
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    console.error('Please configure these in your .env file before starting the server.');
    process.exit(1);
  }
};

module.exports = validateEnv;

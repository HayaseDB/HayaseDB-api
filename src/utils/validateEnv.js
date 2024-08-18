const requiredEnvVars = [
  'PORT',
  'MONGO_USERNAME',
  'MONGO_PASSWORD',
  'MONGO_DATABASE',
  'LOG_LEVEL',
  'JWT_SECRET'
  // 'JWT_EXPIRES_IN' is no longer mandatory
];

function validateEnv() {
  const missingVars = [];
  const invalidVars = [];

  requiredEnvVars.forEach((envVar) => {
      if (!process.env[envVar]) {
          missingVars.push(envVar);
      } else {
          switch (envVar) {
              case 'PORT':
                  if (isNaN(process.env[envVar])) {
                      invalidVars.push(`${envVar} should be a number`);
                  }
                  break;
              case 'LOG_LEVEL':
                  if (!['normal', 'debug', 'silent'].includes(process.env[envVar])) {
                      invalidVars.push(`${envVar} should be one of 'normal', 'debug', or 'silent'`);
                  }
                  break;
              case 'JWT_SECRET':
                  if (typeof process.env[envVar] !== 'string' || process.env[envVar].trim() === '') {
                      invalidVars.push(`${envVar} should be a non-empty string`);
                  }
                  break;
          }
      }
  });

  // Optional: Validate JWT_EXPIRES_IN if provided
  if (process.env.JWT_EXPIRES_IN !== undefined) {
      if (typeof process.env.JWT_EXPIRES_IN !== 'string' || process.env.JWT_EXPIRES_IN.trim() === '') {
          invalidVars.push(`JWT_EXPIRES_IN should be a non-empty string representing a valid duration (e.g., '1d', '2h') or should be omitted to disable expiration`);
      }
  }

  if (missingVars.length > 0) {
      console.error('Missing environment variables:', missingVars.join(', '));
      process.exit(1);
  }

  if (invalidVars.length > 0) {
      console.error('Invalid environment variables:', invalidVars.join(', '));
      process.exit(1);
  }
}

validateEnv();

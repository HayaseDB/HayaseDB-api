const requiredEnvVars = [
    'PORT',
    'MONGO_USERNAME',
    'MONGO_PASSWORD',
    'MONGO_DATABASE',
    'LOG_LEVEL'
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
        }
      }
    });
  
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
  
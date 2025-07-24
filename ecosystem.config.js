module.exports = {
  apps: [
    {
      name: 'trippat-backend',
      script: 'src/server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_file: '.env.production',
      env: {
        NODE_ENV: 'production',
        PORT: 5001,
        MONGODB_URI: 'mongodb+srv://aaldriaan:BubuT8gTHoSpep1f@trippatdb.q9rjvzi.mongodb.net/trippat?retryWrites=true&w=majority&appName=trippatDB',
        JWT_SECRET: 'trippat-super-secure-jwt-secret-production-2024',
        FRONTEND_URL: 'http://3.72.21.168:3000',
        ADMIN_URL: 'http://3.72.21.168:3001'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001,
        MONGODB_URI: 'mongodb+srv://aaldriaan:BubuT8gTHoSpep1f@trippatdb.q9rjvzi.mongodb.net/trippat?retryWrites=true&w=majority&appName=trippatDB',
        JWT_SECRET: 'trippat-super-secure-jwt-secret-production-2024',
        FRONTEND_URL: 'http://3.72.21.168:3000',
        ADMIN_URL: 'http://3.72.21.168:3001'
      }
    },
    {
      name: 'trippat-admin',
      script: 'npm',
      args: 'run dev',
      cwd: './trippat-admin',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        NEXT_PUBLIC_API_URL: 'http://3.72.21.168:5001/api',
        NEXT_PUBLIC_API_BASE_URL: 'http://3.72.21.168:5001'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        NEXT_PUBLIC_API_URL: 'http://3.72.21.168:5001/api',
        NEXT_PUBLIC_API_BASE_URL: 'http://3.72.21.168:5001'
      }
    },
    {
      name: 'trippat-customer',
      script: 'npm',
      args: 'run dev',
      cwd: './trippat-customer',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'http://3.72.21.168:5001/api',
        NEXT_PUBLIC_API_BASE_URL: 'http://3.72.21.168:5001'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'http://3.72.21.168:5001/api',
        NEXT_PUBLIC_API_BASE_URL: 'http://3.72.21.168:5001'
      }
    }
  ]
};
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  HOST: '0.0.0.0',
  MOBILE_IP: '192.168.1.63',
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-jwt-key-for-mobile-app-2026',
  JWT_EXPIRES_IN: '7d',
  NODE_ENV: process.env.NODE_ENV || 'development',
};

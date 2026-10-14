/**
 * Server Entry Point
 * Starts HTTP Server on specified PORT and HOST.
 */
const app = require('./src/app');
const { PORT, HOST, MOBILE_IP } = require('./src/config');

app.listen(PORT, HOST, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Backend Server running at: http://localhost:${PORT}`);
  console.log(`📱 Mobile Network Address:    http://${MOBILE_IP}:${PORT}`);
  console.log(`📡 Environment:               ${process.env.NODE_ENV || 'development'}`);
  console.log(`=======================================================`);
});

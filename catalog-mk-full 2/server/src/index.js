import { createApp } from './app.js';
import { config } from './config.js';
import { openDatabase } from './db.js';

const db = openDatabase();
const app = createApp(db);

const server = app.listen(config.port, () => {
  console.log(`✔ catalog.mk API на http://localhost:${config.port}`);
  console.log(`  База: ${config.dbPath}`);
});

function shutdown(signal) {
  console.log(`\n${signal} – се исклучува…`);
  server.close(() => {
    db.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

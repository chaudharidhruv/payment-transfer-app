// import express from 'express';
// import http from 'http';
// import cors from 'cors';
// import passport from 'passport';
// import session from 'express-session';
// import { Server } from 'socket.io';
// import fs from 'fs';
// import path from 'path';
// import dotenv from 'dotenv';
// import { fileURLToPath } from 'url';

// // New imports for cron + Supabase client
// import cron from 'node-cron';
// import { createClient } from '@supabase/supabase-js';

// // Define __filename and __dirname for ES module scope
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Load environment variables
// dotenv.config();

// // Initialize Supabase client
// const supabase = createClient(
//     process.env.SUPABASE_URL,
//     process.env.SUPABASE_ANON_KEY
// );

// // Initialize Express app
// const app = express();
// const server = http.createServer(app);

// // Setup Socket.io
// const io = new Server(server, {
//     cors: { origin: process.env.FRONTEND_URL, credentials: true },
// });

// // Middleware
// app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
// app.use(express.json());
// app.use(
//     session({ secret: process.env.JWT_SECRET, resave: false, saveUninitialized: false })
// );
// app.use(passport.initialize());
// app.use(passport.session());

// // Automatically load all API routes from src/api/
// const apiPath = path.join(__dirname, 'api');

// (async () => {
//     const files = fs.readdirSync(apiPath).filter((file) => file.endsWith('.js'));
//     for (const file of files) {
//         const routeName = file.replace('.js', '');
//         const route = `/api/${routeName}`;
//         try {
//             const modulePath = `./api/${file}`;
//             const handlerModule = await import(modulePath);
//             if (typeof handlerModule.default === 'function') {
//                 app.use(route, handlerModule.default);
//                 console.log(`Loaded API route: ${route}`);
//             } else {
//                 console.warn(`No default export found for ${route}`);
//             }
//         } catch (err) {
//             console.error(`Error loading ${file}:`, err);
//         }
//     }

//     // Initialize Passport configuration
//     await import('./config/passport.js');

//     // Setup WebSocket
//     import('./sockets/chatSocket.js').then((module) => {
//         module.default(io);
//     });

//     // Start the server
//     const PORT = process.env.PORT || 5000;
//     server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

//     // ─── Cron job: auto-complete pending transactions older than 48h ───
//     cron.schedule('0 * * * *', async () => {
//         try {
//             const cutoff = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
//             const { error } = await supabase
//                 .from('transactions')
//                 .update({ status: 'completed' })
//                 .lt('created_at', cutoff)
//                 .eq('status', 'pending');

//             if (error) {
//                 console.error('Error auto-completing transactions:', error);
//             } else {
//                 console.log(`Auto-completed pending transactions before ${cutoff}`);
//             }
//         } catch (err) {
//             console.error('Cron job failed:', err);
//         }
//     });
// })();
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath, pathToFileURL } from 'url';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// Needed because __dirname doesn't exist in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiDir = path.join(__dirname, 'api');

async function loadApiRoutes() {
  try {
    const files = await fs.readdir(apiDir);
    for (const file of files) {
      if (!file.endsWith('.js')) continue;

      const routePath = `/api/${file.replace('.js', '')}`;
      const filePath = path.join(apiDir, file);
      const fileUrl = pathToFileURL(filePath).href; // ✅ Converts C:\... to file:///C:/...

      try {
        const module = await import(fileUrl); // ✅ Must use .href here
        if (module?.default) {
          app.use(routePath, module.default);
          console.log(`Loaded API route: ${routePath}`);
        } else {
          console.warn(`Module ${file} has no default export`);
        }
      } catch (err) {
        console.error(`Failed to load ${file}:`, err);
      }
    }
  } catch (err) {
    console.error('Error reading API directory:', err);
  }
}

loadApiRoutes().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

// console.log('🚀 Starting Inventory Management System Server...');

const express = require("express");
// console.log('✅ Express loaded');

const cors = require("cors");
// console.log('✅ CORS loaded');

const http = require("http");
// console.log('✅ HTTP loaded');

const socketIo = require("socket.io");
// console.log('✅ Socket.IO loaded');

// Import routes
// console.log('📁 Loading routes...');
const customerRoute = require("./src/routes/customerRoute");
// console.log('✅ Customer route loaded');

const categoryRoute = require("./src/routes/categoryRoute");
// console.log('✅ Category route loaded');

const brandRoute = require("./src/routes/brandRoute");
// console.log('✅ Brand route loaded');

const productRoute = require("./src/routes/productRoute");
// console.log('✅ Product route loaded');

const SupplierRoute = require("./src/routes/SupplierRoute");
// console.log('✅ Supplier route loaded');

const PurchaseRoute = require("./src/routes/PurchaseRoute");
// console.log('✅ Purchase route loaded');

const PurchaseItem = require("./src/routes/PurchaseItemRoute");
// console.log('✅ Purchase Item route loaded');

const Sales = require("./src/routes/SaleRoute");
// console.log('✅ Sales route loaded');

const PaymentRoutes = require("./src/routes/PaymentRoute");
// console.log('✅ Payment route loaded');

const User = require("./src/routes/UserRoute");
// console.log('✅ User route loaded');

const Role = require("./src/routes/RoleRoute");
// console.log('✅ Role route loaded');

const notificationRoutes = require("./src/routes/notificationRoutes");
// console.log('✅ Notification routes loaded');

const reportRoutes = require("./src/routes/reportRoutes");
// console.log('✅ Report routes loaded');

const setupRoutes = require("./src/routes/SetupRoute");
// console.log('✅ Setup routes loaded');

const settingsRoutes = require("./src/routes/settingsRoute");
// console.log('✅ Settings routes loaded');

const dashboardRoute = require("./src/routes/dashboardRoute");
// console.log('✅ Dashboard route loaded');

const stockRoutes = require("./src/routes/stockRoutes");
// console.log('✅ Stock routes loaded');

const StaffRoutes = require("./src/routes/StaffRoute");
// console.log('✅ Staff routes loaded');

const db = require("./src/config/db");
const sequelize = db.sequelize;
const app = express();
const server = http.createServer(app);
const fs = require("fs");
const io = socketIo(server, {
  cors: {
    origin: "*",
    // methods: ["GET", "POST"],
    // origin: "*.railway.app",
    // credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: false,
  },
});
// console.log('✅ Server components created');

// Middleware
// console.log('⚙️  Setting up middleware...');
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// Make io accessible in routes
app.set("io", io);
// console.log('✅ Middleware configured');

// Routes
// console.log('🛣️  Setting up routes...');
app.use("/api", reportRoutes);
app.use("/api", dashboardRoute);
// console.log('✅ Report routes registered');
// console.log('✅ Dashboard routes registered');

notificationRoutes(app);
// console.log('✅ Notification routes registered');

setupRoutes(app);
// console.log('✅ Setup routes registered');

settingsRoutes(app);
// console.log('✅ Settings routes registered');

customerRoute(app);
// console.log('✅ Customer routes registered');

categoryRoute(app);
// console.log('✅ Category routes registered');

brandRoute(app);
// console.log('✅ Brand routes registered');

productRoute(app);
// console.log('✅ Product routes registered');

SupplierRoute(app);
// console.log('✅ Supplier routes registered');

PurchaseRoute(app);
// console.log('✅ Purchase routes registered');

PurchaseItem(app);
// console.log('✅ Purchase Item routes registered');

Sales(app);
// console.log('✅ Sales routes registered');

PaymentRoutes(app);
// console.log('✅ Payment routes registered');

User(app);
// console.log('✅ User routes registered');

Role(app);
// console.log('✅ Role routes registered');

stockRoutes(app);
// console.log('✅ Stock routes registered');

StaffRoutes(app);
// console.log('✅ Staff routes registered');

// console.log('✅ All routes configured');

// console.log('🔧 Defining database sync function...');
const syncDatabase = async () => {
  try {
    // console.log('Attempting database connection...');
    await sequelize.authenticate();
    // console.log('✅ Database connection established successfully.');

    // IMPORTANT: Don't use alter:true in production as it can cause data loss
    // Use migrations instead for schema changes
    // await sequelize.sync({ alter: true });

    // Only sync without altering existing tables
    await sequelize.sync({ alter: false });
    // console.log("✅ Database synchronized.");
  } catch (error) {
    const errorMsg = error.message || error.toString();
    const errorCode = error.code || error.parent?.code || "UNKNOWN";

    // console.error('❌ Unable to sync database:', errorMsg);
    // console.error('   Error Code:', errorCode);

    // Connection errors - don't try force sync (it will fail with same error)
    const isConnectionError =
      errorCode === "ECONNREFUSED" ||
      errorCode === "ETIMEDOUT" ||
      errorCode === "ENOTFOUND";

    if (errorCode === "ECONNREFUSED") {
    } else if (
      errorCode === "ER_ACCESS_DENIED_ERROR" ||
      errorCode === "ER_BAD_DB_ERROR"
    ) {
    } else {
      // console.warn('⚠️  Warning: Database connection failed.');
    }

    // console.warn('⚠️  Server will continue running, but database operations will fail.');

    if (process.env.NODE_ENV !== "production" && !isConnectionError) {
      console.log("   Trying with force sync...");
      try {
        await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true });
        await sequelize.sync({ force: true });
        await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { raw: true });
        // console.log('✅ Database synchronized with force.');
      } catch (forceError) {
        const forceErrorMsg = forceError.message || forceError.toString();
        // console.error('❌ Force sync failed:', forceErrorMsg);
      }
    } else if (isConnectionError) {
      // console.log('   ⏭️  Skipping force sync (connection error - MySQL not running)');
    }

    return false;
  }
  return true;
};

console.log("🚀 Starting server...");
const PORT = process.env.PORT || 3001;

// Import stock level checker
const stockLevelChecker = require("./src/jobs/stockLevelChecker");
const expirationChecker = require("./src/jobs/expirationChecker");

console.log(`📡 Attempting to listen on port ${PORT}...`);
server
  .listen(PORT, function () {
    console.log(`✅ Server is running on http://localhost:${PORT}`);

    syncDatabase()
      .then((success) => {
        if (success) {
          // Start stock level checker after successful database sync
          console.log("🔄 Starting stock level monitoring...");
          try {
            stockLevelChecker.start();
            console.log("✅ Stock level checker started successfully");
          } catch (error) {
            console.error("❌ Failed to start stock level checker:", error);
          }

          // Start expiration checker
          console.log("📅 Starting expiration monitoring...");
          try {
            expirationChecker.start();
            console.log("✅ Expiration checker started successfully");
          } catch (error) {
            console.error("❌ Failed to start expiration checker:", error);
          }
        }
      })
      .catch((err) => {
        console.error("❌ Database sync error (non-fatal):", err.message);
      });
  })
  .on("error", (err) => {
    console.error("❌ Server startup error:", err.message);
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Error: Port ${PORT} is already in use.`);
      process.exit(1);
    } else {
      console.error("❌ Server error:", err.message);
      process.exit(1);
    }
  });

////

// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const http = require("http");
// const { Server } = require("socket.io");

// // Routes
// const customerRoute = require("./src/routes/customerRoute");
// const categoryRoute = require("./src/routes/categoryRoute");
// const brandRoute = require("./src/routes/brandRoute");
// const productRoute = require("./src/routes/productRoute");
// const SupplierRoute = require("./src/routes/SupplierRoute");
// const PurchaseRoute = require("./src/routes/PurchaseRoute");
// const PurchaseItem = require("./src/routes/PurchaseItemRoute");
// const Sales = require("./src/routes/SaleRoute");
// const PaymentRoutes = require("./src/routes/PaymentRoute");
// const User = require("./src/routes/UserRoute");
// const Role = require("./src/routes/RoleRoute");
// const notificationRoutes = require("./src/routes/notificationRoutes");
// const reportRoutes = require("./src/routes/reportRoutes");
// const setupRoutes = require("./src/routes/SetupRoute");
// const settingsRoutes = require("./src/routes/settingsRoute");
// const dashboardRoute = require("./src/routes/dashboardRoute");
// const stockRoutes = require("./src/routes/stockRoutes");
// const StaffRoutes = require("./src/routes/StaffRoute");

// // ✅ Load models + sequelize
// const db = require("./src/models");
// const sequelize = db.sequelize;

// // Jobs
// const stockLevelChecker = require("./src/jobs/stockLevelChecker");
// const expirationChecker = require("./src/jobs/expirationChecker");

// const app = express();
// const server = http.createServer(app);

// // ✅ Allowed origins from ENV
// const allowedOrigins = process.env.ALLOWED_ORIGINS
//   ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
//   : ["http://localhost:3000"];

// const corsOptions = {
//   origin: (origin, cb) => {
//     if (!origin) return cb(null, true); // Postman/curl/server-to-server
//     if (allowedOrigins.includes("*")) return cb(null, true);
//     if (allowedOrigins.includes(origin)) return cb(null, true);
//     return cb(new Error(`CORS blocked: ${origin}`));
//   },
//   credentials: false,
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
// };

// // ✅ CORS
// app.use(cors(corsOptions));

// // ✅ Preflight (IMPORTANT: use same options)
// app.options(/.*/, cors(corsOptions));

// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// // ✅ Socket.IO
// const io = new Server(server, {
//   cors: {
//     origin: allowedOrigins.includes("*") ? "*" : allowedOrigins,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     credentials: false,
//   },
//   transports: ["websocket", "polling"],
// });

// app.set("io", io);

// io.on("connection", (socket) => {
//   socket.on("disconnect", () => {});
// });

// // ✅ Health check
// app.get("/health", async (req, res) => {
//   try {
//     await sequelize.authenticate();
//     res.json({
//       status: "OK",
//       db: "connected",
//       env: process.env.NODE_ENV || "development",
//       time: new Date().toISOString(),
//     });
//   } catch (err) {
//     res.status(500).json({
//       status: "ERROR",
//       db: "disconnected",
//       error: err.message,
//       time: new Date().toISOString(),
//     });
//   }
// });

// // ✅ Routes
// app.use("/api", reportRoutes);
// app.use("/api", dashboardRoute);

// notificationRoutes(app);
// setupRoutes(app);
// settingsRoutes(app);

// customerRoute(app);
// categoryRoute(app);
// brandRoute(app);
// productRoute(app);
// SupplierRoute(app);
// PurchaseRoute(app);
// PurchaseItem(app);
// Sales(app);
// PaymentRoutes(app);
// User(app);
// Role(app);
// stockRoutes(app);
// StaffRoutes(app);

// // ✅ 404
// app.use((req, res) => {
//   res.status(404).json({
//     message: "Route not found",
//     path: req.path,
//     method: req.method,
//   });
// });

// // ✅ Error handler
// app.use((err, req, res, next) => {
//   res.status(500).json({
//     message: err.message || "Internal error",
//     ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
//   });
// });

// // ✅ DB sync (SAFE)
// const isProd = process.env.NODE_ENV === "production";
// async function syncDatabase() {
//   try {
//     await sequelize.authenticate();

//     await sequelize.authenticate();

//     // ✅ production: never alter
//     await sequelize.sync({ alter: !isProd });
//     if (process.env.NODE_ENV === "production") {
//       await sequelize.sync({ alter: false });
//     } else {
//       await sequelize.sync({ alter: true });
//     }

//     return true;
//   } catch (e) {
//     console.error("❌ DB sync/auth error:", e.message);
//     return false;
//   }
// }

// // ✅ Start server
// const PORT = process.env.PORT || 3001;

// server.listen(PORT, "0.0.0.0", async () => {
//   console.log(`✅ Server running on port ${PORT}`);

//   const ok = await syncDatabase();
//   if (!ok) {
//     console.warn(
//       "⚠️ Server running but DB not connected. Jobs will not start.",
//     );
//     return;
//   }

//   // ✅ Start jobs safely
//   try {
//     stockLevelChecker.start();
//     console.log("✅ Stock level checker started");
//   } catch (e) {
//     console.error("❌ Stock checker error:", e.message);
//   }

//   try {
//     expirationChecker.start();
//     console.log("✅ Expiration checker started");
//   } catch (e) {
//     console.error("❌ Expiration checker error:", e.message);
//   }
// });

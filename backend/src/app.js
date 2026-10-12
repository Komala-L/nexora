import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import connectionRoutes from "./routes/connection.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import messageRoutes from "./routes/message.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import securityRoutes from "./routes/security.routes.js";
import adminAuthRoutes from "./routes/admin/adminAuth.routes.js";
import adminUserRoutes from "./routes/admin/adminUser.routes.js";
import adminReportRoutes from "./routes/admin/adminReport.routes.js";
import adminSettingsRoutes from "./routes/admin/adminSettings.routes.js";
import { maintenanceMiddleware } from "./middleware/maintenance.middleware.js";

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(maintenanceMiddleware);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin/auth",adminAuthRoutes);
app.use("/api/v1/admin/users", adminUserRoutes);
app.use("/api/v1/admin/reports", adminReportRoutes);
app.use("/api/v1/admin/settings", adminSettingsRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/connections", connectionRoutes);
app.use("/api/v1/conversations", conversationRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/notifications",notificationRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/security", securityRoutes);
app.use(errorMiddleware);

export default app;
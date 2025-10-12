"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const tenant_service_1 = require("./services/tenant.service");
const tenant_routes_1 = require("./routes/tenant.routes");
const database_1 = require("@shifty/database");
const error_handler_1 = require("./middleware/error-handler");
const request_logger_1 = require("./middleware/request-logger");
class TenantManagerApp {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = parseInt(process.env.PORT || '3001', 10);
        this.dbManager = new database_1.DatabaseManager();
        this.tenantService = new tenant_service_1.TenantService(this.dbManager);
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    initializeMiddleware() {
        // Security middleware
        this.app.use((0, helmet_1.default)());
        this.app.use((0, cors_1.default)({
            origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
            credentials: true
        }));
        // Performance middleware
        this.app.use((0, compression_1.default)());
        // Rate limiting
        const limiter = (0, express_rate_limit_1.default)({
            windowMs: process.env.NODE_ENV === 'test' ? 1 * 60 * 1000 : 15 * 60 * 1000, // 1 min for test, 15 min for production
            max: process.env.NODE_ENV === 'test' ? 1000 : 100, // Much more permissive for testing
            message: 'Too many requests from this IP',
            skip: (req) => {
                // Exclude health checks from rate limiting
                return req.path === '/health' || req.path === '/api/v1/health';
            }
        });
        this.app.use(limiter);
        // Body parsing
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true }));
        // Request logging
        this.app.use(request_logger_1.requestLogger);
    }
    initializeRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                service: 'tenant-manager',
                timestamp: new Date().toISOString()
            });
        });
        // API routes
        this.app.use('/api/v1/tenants', (0, tenant_routes_1.tenantRoutes)(this.tenantService));
    }
    initializeErrorHandling() {
        this.app.use(error_handler_1.errorHandler);
    }
    async start() {
        try {
            // Initialize database connections
            await this.dbManager.initialize();
            // Start the server
            this.app.listen(this.port, () => {
                console.log(`🏢 Tenant Manager service running on port ${this.port}`);
                console.log(`📊 Health check: http://localhost:${this.port}/health`);
            });
        }
        catch (error) {
            console.error('Failed to start Tenant Manager service:', error);
            process.exit(1);
        }
    }
    async stop() {
        await this.dbManager.close();
        console.log('Tenant Manager service stopped');
    }
}
// Start the service
const app = new TenantManagerApp();
app.start();
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await app.stop();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await app.stop();
    process.exit(0);
});
exports.default = TenantManagerApp;
//# sourceMappingURL=index.js.map
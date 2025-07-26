const express = require('express');
const { checkConnection } = require('./config/db');
const authRoutes = require('./routes/authRouter');
const appointmentRoutes = require('./routes/appointmentRouter');
const staffRoutes = require('./routes/staffRoutes');
const serviceRoutes = require('./routes/serviceRouter');
const promotionsRoutes = require('./routes/promotionsRouter'); 
const invoiceRoutes = require('./routes/invoiceRouter');
const app = express();
const server = require('http').createServer(app);
const cors = require('cors');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/promotions', promotionsRoutes); // Assuming you have a promotionsRouter
app.use('/api/invoices', invoiceRoutes); // Add invoice routes
// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    try {
        await checkConnection();
    } catch (error) {
        console.error("Failed to initialize database:", error);
    }
});

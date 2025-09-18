const express = require('express');
const { checkConnection } = require('./config/db');
const authRoutes = require('./routes/authRouter');
const appointmentRoutes = require('./routes/appointmentRouter');
const staffRoutes = require('./routes/staffRoutes');
const serviceRoutes = require('./routes/serviceRouter');
const promotionsRoutes = require('./routes/promotionsRouter'); 
const invoiceRoutes = require('./routes/invoiceRouter');
const expenseRoutes = require('./routes/expenseRouter'); 
const feedbackRoutes = require('./routes/feedbackRouter'); 
const customerRoutes = require('./routes/customerRouter');  
const notificationRoutes = require('./routes/notificationRouter'); // Assuming you have a notificationRouter
const app = express();
const server = require('http').createServer(app);
const cors = require('cors');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));  // or higher if needed
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use((req, res, next) => {
  console.log('Incoming request size:', req.headers['content-length']);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/promotions', promotionsRoutes); // Assuming you have a promotionsRouter
app.use('/api/invoices', invoiceRoutes); // Add invoice routes
app.use('/api/expenses', expenseRoutes); // Add expense routes
app.use('/api/feedback', feedbackRoutes); // Add feedback routes
app.use('/api/customers', customerRoutes); // Add customer routes
app.use('/api/notifications', notificationRoutes); // Add notification routes
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

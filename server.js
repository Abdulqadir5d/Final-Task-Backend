require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const linkRoutes = require('./routes/linkRoutes');
const subscriberRoutes = require('./routes/subscriberRoutes');
const billingRoutes = require('./routes/billingRoutes');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

const PORT = process.env.PORT || 5000;

// Webhook route must be handled BEFORE global express.json()
app.use('/api/billing', billingRoutes);

// Request Parsing (for other routes)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/subscribers', subscriberRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Link-in-Bio SaaS API v1' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

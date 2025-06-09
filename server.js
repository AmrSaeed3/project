const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');
const session = require('express-session');
const fs = require('fs');
const passport = require('passport');
const cookieParser = require('cookie-parser');

const ApiError = require('./utils/apiError');
const globalError = require('./middleware/errorMiddleware');
const dbConection = require ('./config/database');

const { webhookStripe } = require('./services/orderService');

// Try loading from config.env first, then fall back to .env
if (fs.existsSync('config.env')) {
  dotenv.config({ path: 'config.env' });
  console.log('Loaded environment variables from config.env');
} else if (fs.existsSync('.env')) {
  dotenv.config();
  console.log('Loaded environment variables from .env');
} else {
  console.warn('No environment file found. Using system environment variables.');
}



// mount routes
const mountRoutes = require('./routes/index');


// db connection
dbConection();

// express app
const app = express();


app.use(cors());
app.options('*', cors()); // Enable pre-flight requests for all routes

// Enable compression for better performance
app.use(compression());

// middlewares
app.use(express.json());

app.use(cookieParser());

// checkout webhooks
app.post('/webhook-stripe', express.raw({ type: 'application/json' }), webhookStripe);

// Session middleware - MUST be before passport.initialize()
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Require social auth service to set up strategies
require('./services/auth/socialAuthService');

const NODE_ENV = process.env.NODE_ENV;
if (NODE_ENV === 'development'){
    app.use(morgan('dev'))
    console.log(`mode ${NODE_ENV}`)
}

// mount routes
mountRoutes(app);

// 404 handler
app.all('*', (req, res, next) => { 
    next(new ApiError(`Can't find this route: ${req.originalUrl}`, 404));
});

// global error handler
app.use(globalError);

// server
const PORT = process.env.PORT || 8000;
const HOST = '0.0.0.0'; // This is crucial for cloud platforms like Render

const server = app.listen(PORT, HOST, () => {
    console.log(`Server running on ${HOST}:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});

// handle rejections outside express
process.on('unhandledRejection', (err) => {
    console.log(`Unhandled Rejection: ${err.name} | ${err.message}`);
    server.close(() => {
        console.log('Shutting down...');
        process.exit(1);
    });
});

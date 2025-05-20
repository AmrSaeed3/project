const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const session = require('express-session');
const fs = require('fs');

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

// Now require passport after environment variables are loaded
const passport = require('./config/passport');

// Rest of your imports
const ApiError = require('./utils/apiError');
const globalError = require('./middleware/errorMiddleware');
const CategoryRoute = require("./routes/categoryRoute")
const SubCategoryRoute = require("./routes/subCategoryRoute")
const BrandRoute = require("./routes/brandRoute")
const ProductRoute = require("./routes/productRoute")
const UserRoute = require("./routes/userRoute")
const AuthRoute = require("./routes/authRoute")
const dbConection = require ('./config/database');


// db connection
dbConection();

// express app
const app = express();

// middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads')));

// Add debugging middleware to check environment variables
app.use((req, res, next) => {
  console.log('Environment variables check:');
  console.log('GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
  console.log('GOOGLE_CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET);
  console.log('FACEBOOK_APP_ID exists:', !!process.env.FACEBOOK_APP_ID);
  console.log('FACEBOOK_APP_SECRET exists:', !!process.env.FACEBOOK_APP_SECRET);
  next();
});

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

const NODE_ENV = process.env.NODE_ENV;
if ( NODE_ENV === 'development'){
    app.use (morgan('dev'))
    console.log(`mode ${NODE_ENV}`)
}

// mount routes
app.use('/api/v1/categories', CategoryRoute); 
app.use('/api/v1/subcategories', SubCategoryRoute);
app.use('/api/v1/brand', BrandRoute);
app.use('/api/v1/products', ProductRoute);
app.use('/api/v1/users', UserRoute);
app.use('/api/v1/auth', AuthRoute);
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

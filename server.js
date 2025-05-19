const path = require('path')

const express = require ('express');
const dotenv = require ('dotenv');
const morgan = require ('morgan');

dotenv.config({path:'config.env'});
const ApiError = require ('./utils/apiError');
const globalError = require ('./middleware/errorMiddleware');
const CategoryRoute = require("./routes/categoryRoute")
const SubCategoryRoute = require("./routes/subCategoryRoute")
const BrandRoute = require("./routes/brandRoute")
const ProductRoute = require("./routes/productRoute")
const UserRoute = require("./routes/userRoute")
const dbConection = require ('./config/database');


// db
dbConection();

// express app
const app = express();

// middlwares
app.use(express.json());
app.use(express.static(path.join(__dirname,'uploads')));

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

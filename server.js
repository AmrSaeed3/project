const express = require ('express');
const dotenv = require ('dotenv');
const morgan = require ('morgan');

dotenv.config({path:'config.env'});
const ApiError = require ('./utils/apiError');
const globalError = require ('./middleware/errorMiddleware');
const CategoryRoute = require("./routes/categoryRoute")
const SubCategoryRoute = require("./routes/subCategoryRoute")
const BrandRoute = require("./routes/brandRoute")
const dbConection = require ('./config/database');


// db
dbConection();

// express app
const app = express();

// middlwares
app.use(express.json())

const NODE_ENV = process.env.NODE_ENV;
if ( NODE_ENV === 'development'){
    app.use (morgan('dev'))
    console.log(`mode ${NODE_ENV}`)
}

// mount routes
app.use('/api/v1/categories', CategoryRoute); 
app.use('/api/v1/subcategories', SubCategoryRoute);
app.use('/api/v1/brand', BrandRoute);

// 404 handler
app.all('*', (req, res, next) => { 
    next(ApiError(`Can't find this route: ${req.originalUrl}`, 404));
});


// global error handler
app.use(globalError);


//server
const PORT = process.env.PORT || 8000;
const HOST = process.env.Host || 'localhost'; // استخدم المتغير من ملف config.env

app.listen(PORT, HOST, () => {
    console.log(`App is running on http://${HOST}:${PORT}`);
});





// handel rejections outside express

process.on('unhandledRejection', (err) => {
    console.log(`Unhandled Rejection: ${err.name} | ${err.message}`);
    server.close(() => {
        console.log('Shutting down...');
        process.exit(1);
    });
})

const globalError = (err, req, res, next) => { 
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    process.env.NODE_ENV === 'development' ? sendErrorDev(err, res) : sendErrorProd(err, res);
}


const  sendErrorDev = (err, res) =>{
    return res.status(400).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
        
} 


const sendErrorProd = (err, res) => {
    return res.status(400).json({
        status: err.status,
        message: err.message,
    });
}


module.exports = globalError;
const app = require('./app');
const connectDatabase = require('./config/database')

//handle uncaught exception

process.on('uncaughtException',err=>{
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to uncaught exception error');
    process.exit(1);
})

const dotenv = require('dotenv');
//setting up config file
//
dotenv.config({path: 'backend/config/config.env'})
//connect Database
connectDatabase();
const server = app.listen(process.env.PORT,()=>    {
    console.log(`server started on PORT : ${process.env.PORT} in ${process.env.NODE_ENV} mode`)
});

//handle unhandled Promise Rejection

// process.on('unhandledRejection',err =>{
//     console.log(`Error: ${err.message}`);
//     console.log('Shutting down the server due to unhandled promise rejection');

//     server.close(()=>{
//         process.exit(1);
//     })
// })

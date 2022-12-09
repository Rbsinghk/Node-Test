const express = require('express');
const app = express();
require('./config/db');
const path = require('path');
const port = process.env.PORT;

app.use(express.json({ limit: 100000000000 }));

// //Import Route
const regRouter = require('./Routes/registerRoute');

// //Route MiddleWare
app.use("/api", regRouter);

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error)
})
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
})

app.listen(port, () => {
    console.log(`The Port is Running at ${port}`);
})
const { connectToDb } = require('./db');
const express = require('express');
const productRoute = require('./routes/productRoutes');
const userRoute = require('./routes/userRoutes');
const app = express();

app.use(express.json());
app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:3000', 'http://10.10.5.189:3000'];
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

connectToDb((err) => {
    if (err) throw err;
    app.listen(8080, () => {
        console.log('listening at port 8080')
    });
})

app.get("/", (req, res) => {
    res.redirect("/techwise-api");
});

app.use('/techwise-api', productRoute);
app.use('/user', userRoute);
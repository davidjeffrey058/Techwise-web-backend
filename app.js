const { connectToDb } = require('./db');
const express = require('express');
const productRoute = require('./routes/productRoutes');
const userRoute = require('./routes/userRoutes');
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:3000', 'http://192.168.43.71:3000', 'https://techwise-5b269.web.app'];
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
// app.use(cors());

connectToDb((err) => {
    if (err) throw err;
    app.listen(port, () => {
        console.log('listening at port 8080')
    });
})

app.get("/", (req, res) => {
    res.redirect("/techwise-api");
});

app.use('/techwise-api', productRoute);
app.use('/user', userRoute);
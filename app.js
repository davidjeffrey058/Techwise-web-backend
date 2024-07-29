const { connectToDb } = require('./db');
const mongoose = require('mongoose');
require('dotenv').config();
const express = require('express');
const productRoute = require('./routes/productRoutes');
const userRoute = require('./routes/userRoutes');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 8000;

app.use(express.json());
// app.use((req, res, next) => {
//     const allowedOrigins = ['http://localhost:3000', 'http://192.168.43.71:3000', 'https://techwise-5b269.web.app'];
//     const origin = req.headers.origin;

//     if (allowedOrigins.includes(origin)) {
//         res.setHeader('Access-Control-Allow-Origin', origin);
//     }

//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     next();
// });
app.use(cors());


// connectToDb((err) => {
//     if (err) throw err;
//     app.listen(port, () => {
//         console.log('listening at port 8080')
//     });
// })

mongoose.connect(process.env.DB_URL).then(() => {
    app.listen(port, () => {
        console.log('listening at port ' + port)
    });
})
    .catch(error => {
        console.log(error.message)
    })

app.get("/", (req, res) => {
    res.redirect("/api/product");
});

app.use('/api/products', productRoute);
app.use('/api/users', userRoute);
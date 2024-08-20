const mongoose = require('mongoose');
require('dotenv').config();
const express = require('express');
const productRoute = require('./routes/productRoutes');
const userRoute = require('./routes/userRoutes');
const categoryRoute = require('./routes/categoryRoutes');
const addressRoute = require('./routes/addressRoute');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
    res.redirect('/home');
});

// Pages
app.get('/home', (req, res) => {
    res.redirect('/dashboard')
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard', { title: 'Dashboard' });
})

app.get('/products', (req, res) => {
    res.render('products', {title: "Products"});
})

app.get('/analytics', (req, res) => {
    res.render('analytics', {title: "Analytics"})
})

app.use('/api/users', userRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/products', productRoute);
app.use('/api/address', addressRoute);

app.use((req, res) => {
    res.status(404).render('404', { title: '404 Page Not Found' });
});

mongoose.connect(process.env.DB_URL).then(() => {
    app.listen(port, () => {
        console.log('listening at port ' + port)
    });
})
    .catch(error => {
        console.log(error.message)
    })


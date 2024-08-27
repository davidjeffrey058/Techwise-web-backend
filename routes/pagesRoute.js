const express = require('express');

const pagesRouter = express.Router();

pagesRouter.get('/home', (req, res) => {
    res.redirect('/dashboard');
})

pagesRouter.get('/dashboard', (req, res) => {
    res.render('dashboard', { title: 'Dashboard' });
});

pagesRouter.get('/products', (req, res) => {
    res.render('products', { title: 'Products' });
})

pagesRouter.get('/analytics', (req, res) => {
    res.render('analytics', { title: 'Analytics' });
})

module.exports = pagesRouter;

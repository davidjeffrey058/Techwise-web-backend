const express = require('express');

const pagesRouter = express.Router();

pagesRouter.get('/home', (req, res) => {
    res.render('home', { title: 'Home' });
});

pagesRouter.get('/admin', (req, res) => {
    res.render('admin', { title: 'Admin Home' });
})

module.exports = pagesRouter;

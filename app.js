const express = require("express");
const { ObjectId } = require("mongodb");
const MongoClient = require("mongodb").MongoClient;
const app = express();
const uri = "mongodb://localhost:27017/techwise";

app.use(express.json());
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:3000', 'http://10.206.35.143:3000'];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

MongoClient.connect(uri)
  .then((client) => {
    app.get("/", (req, res) => {
      res.redirect("/techwise-api");
    });

    // Get all the products from the database
    app.get("/techwise-api", (req, res) => {

      client.db().collection("products")
        .find()
        .toArray()
        .then((products) => {
          res.status(200).json(products);
        })
        .catch(() => {
          res.status(500).json({ error: "Unable to get data" });
        });
    });

    // Get a single product by id
    app.get('/techwise-api/:id', (req, res) => {
      client.db().collection('products')
        .findOne({ _id: req.params.id })
        .then(data => {
          res.status(200).json(data);
        })
        .catch(() => {
          res.status(500).json({ error: "Unable to get the data" });
        })
    })

    // Add a product to the database
    app.post("/techwise-api", (req, res) => [
      client
        .db().collection("products")
        .insertOne(req.body)
        .then((response) => {
          res.status(200).json(response);
        })
        .catch(() => {
          res.status(500).json({ error: "Unable to add data" });
        }),
    ]);

    // Get products by category
    app.get('/techwise-api/category/:category', (req, res) => {
      const category = req.params.category;
      client.db().collection('products')
        .find({ category: category })
        .toArray()
        .then(data => {
          res.status(200).json(data);
        })
        .catch(() => {
          res.status(500).json({ error: 'Can\'t get the data' });
        })
    })

    app.listen(8080);
  })
  .catch((err) => {
    throw err;
  });

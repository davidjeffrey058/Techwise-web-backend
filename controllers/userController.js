const { getDb } = require('../db');

const userWishlist = (req, res) => {
    getDb().collection('users')
        .findOne({ _id: req.params.id })
        .then((data) => {

            getDb().collection('products')
                .find({ _id: { $in: data.wishlist } })
                .toArray().then(data => {
                    res.status(200).json(data);
                }).catch(() => {
                    res.status(500).json({ error: "Unable to get the wishlist data" });
                })

        }).catch(() => {
            res.status(500).json({ error: "Unable to get the wishlist data" });
        })
}

// Get the all the cart products
const userCart = (req, res) => {
    getDb().collection('users')
        .findOne({ _id: req.params.id })
        .then((data) => {

            const list = [];
            data.cart.forEach(element => {
                list.push(element.id);
            });

            getDb().collection('products')
                .find({ _id: { $in: list } })
                .toArray().then(data => {
                    res.status(200).json(data);
                }).catch(() => {
                    res.status(500).json({ error: "Unable to get the wishlist data" });
                })

        }).catch(() => {
            res.status(500).json({ error: "Unable to get the wishlist data" });
        })
}

// Just a list of cart items
const listOfCart = (req, res) => {
    getDb().collection('users')
        .findOne({ _id: req.params.id })
        .then((data) => {
            res.status(200).json(data.cart)
        }).catch(() => {
            res.status(500).json({ error: "Can't get the cart data" });
        })
}

// Add an item to cart
const addOrRemoveFromCart = (req, res) => {
    console.log(req.body);
    if (req.body.added) {
        getDb().collection('users')
            .updateOne({ _id: req.params.id }, { $pull: { cart: { id: req.body.product } } })
            .then(data => {
                res.status(200).json({ isAdded: false });
            })
            .catch(() => {
                res.status(500).json({ error: 'Unable to remove to wishlist' })
            });
    } else {
        getDb().collection('users')
            .updateOne({ _id: req.params.id }, { $push: { cart: { id: req.body.product, order_quantity: 1 } } })
            .then(data => {
                res.status(200).json({ isAdded: true });
            })
            .catch(() => {
                res.status(500).json({ error: 'Unable to add to wishlist' })
            });
    }
}

const listOfWishlist = (req, res) => {
    getDb().collection('users')
        .findOne({ _id: req.params.id })
        .then((data) => {
            res.status(200).json(data.wishlist)
        }).catch(() => {
            res.status(500).json({ error: "Can't get the wishlist data" });
        })
}

// Add or remove a product from cart
const addOrRemoveWish = (req, res) => {
    if (req.body.added) {
        getDb().collection('users')
            .updateOne({ _id: req.params.id }, { $pull: { wishlist: req.body.product } })
            .then(data => {
                console.log(data)
                res.status(200).json({ isAdded: false });
            })
            .catch(() => {
                res.status(500).json({ error: 'Unable to remove to wishlist' })
            });
    } else {
        getDb().collection('users')
            .updateOne({ _id: req.params.id }, { $push: { wishlist: req.body.product } })
            .then(data => {
                console.log(data)
                res.status(200).json({ isAdded: true });
            })
            .catch(() => {
                res.status(500).json({ error: 'Unable to add to wishlist' })
            });
    }

}

module.exports = {
    wishlist: userWishlist,
    listOfWishlist,
    addOrRemoveWish,
    userCart,
    listOfCart,
    addOrRemoveFromCart
}
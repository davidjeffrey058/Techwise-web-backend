const { getDb } = require('../db');
// const userRef = getDb().collection('users')
const addUser = (req, res) => {
    const data = req.body;
    // res.status(200).json(req.body);
    getDb().collection('users')
        .findOne({ _id: req.params.id })
        .then(document => {
            if (document) {
                res.status(200).json({ exists: true });
            } else {
                getDb().collection('users')
                    .insertOne({
                        _id: data.uid,
                        wishlist: [],
                        name: data.name,
                        cart: [],
                        email: data.email
                    })
                    .then(() => res.status(200).json({ exists: false }));

            }
        })
        .catch(() => {
            res.status(500).json({ error: "Unable to connect" })
        })
}

// Increasing or decreasing the product order quantity
// const updateOrderQuantity = (req, res) => {
//     getDb().collection('users')
//         .updateOne({ _id: req.params.id })
// }

// Users whishlist products
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
        .then((listData) => {

            const list = [];
            listData.cart.forEach(element => {
                list.push(element.id);
            });

            getDb().collection('products')
                .find({ _id: { $in: list } })
                .toArray().then(data => {
                    const cartList = [];
                    data.forEach((value, index) => {
                        cartList.push({
                            name: value.name,
                            price: value.price,
                            image_urls: value.image_urls,
                            _id: value._id,
                            order_quantity: listData.cart[index].order_quantity,
                            quantity: value.quantity
                        })
                    })
                    // console.log(cartList);
                    res.status(200).json(cartList);
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
    addOrRemoveFromCart,
    addUser
}
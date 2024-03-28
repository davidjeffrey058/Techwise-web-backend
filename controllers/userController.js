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
                    res.status(500).json({ error: "Can't get the wishlist data" });
                })

        }).catch(() => {
            res.status(500).json({ error: "Can't get the wishlist data" });
        })
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

module.exports = {
    wishlist: userWishlist,
    listOfWishlist
}
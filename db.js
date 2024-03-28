const { MongoClient } = require("mongodb");
const uri = "mongodb://localhost:27017/techwise";

let dbConnection;

module.exports = {
    connectToDb: (cb) => {
        MongoClient.connect(uri)
            .then((client) => {
                dbConnection = client.db();
                return cb();
            })
            .catch((err) => {
                console.log(err);
                return cb(err);
            });
    },

    getDb: () => dbConnection,
}
const { MongoClient } = require("mongodb");
const uri = "mongodb://localhost:27017/techwise";
const onlineUri = "mongodb+srv://davidjeffrey:fucker200@cluster0.nmreu71.mongodb.net/techwise?retryWrites=true&w=majority&appName=Cluster0";

let dbConnection;

module.exports = {
    connectToDb: (cb) => {
        MongoClient.connect(onlineUri)
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
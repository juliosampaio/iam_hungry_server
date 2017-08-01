const { MongoClient } = require('mongodb');
const config          = require('./config');

module.exports = async () => {
    const db = await MongoClient.connect(config.database);

    db.collection('products').createIndex({name: 1}, {unique: true})
    
    return {        
        Businesses       : db.collection('businesses'),
        BusinessProducts : db.collection('business_products'),
        Products         : db.collection('products'),
        Users            : db.collection('users'),
    }
};
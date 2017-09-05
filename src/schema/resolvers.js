const bcrypt = require('bcrypt');
const config = require('../config');
const { ObjectID } = require('mongodb');

module.exports = {
    Query: {
        allBusinesses: async (root, data, { mongo: { Businesses } }) => {
            return await Businesses.find({}).toArray();
        },
        allUsers: async (root, data, { mongo: { Users } }) => {
            return await Users.find({}).toArray();
        },
        nearbyBusinesses: async (root, {lat, long, distance}, { mongo: {Businesses} }) => {
            const type        = 'Point';
            const coordinates = [lat, long];

            const response = await Businesses.find({
                location : {
                    $near : {
                        $geometry    : { type, coordinates },
                        $maxDistance : distance
                    }
                }
            });

            return response.toArray();
        }
    },
    Mutation: {
        addBusinessProduct: async (root, data, { mongo: { BusinessProducts } }) => {
            const newBusinessProduct = {
                businessId : ObjectID(data.businessId),
                productId  : ObjectID(data.productId),
            };
            const response = await BusinessProducts.insert(newBusinessProduct);
            return Object.assign({id: response.insertedIds[0]}, newBusinessProduct);
        },
        //user
        createUser: async (root, data, { mongo: { Users }, jwt }) => {
            const newUser  = {
                name     : data.name,
                email    : data.authProvider.email.email,
                password : bcrypt.hashSync(data.authProvider.email.password, 10),//TODO: use async version for this
            };
            const response = await Users.insert(newUser);
            const user     = Object.assign({ id: response.insertedIds[0] }, newUser);
            const token = jwt.sign(user, config.secret);
            return { token, user };
        },
        signinUser: async (root, data, { mongo: { Users }, jwt }) => {
            const user = await Users.findOne({ email: data.email.email });
            if (bcrypt.compareSync(data.email.password, user.password)) {//TODO: use async version for this
                const token = jwt.sign(user, config.secret);
                return { token, user };
            }
        },
        userExists: async (root, {email}, {mongo: {Users}}) => {
            const response = await Users.findOne({email});
            return response !== null;
        },
        //business
        createBusiness: async (root, data, { mongo: { Businesses }, user}) => {
            const newBusiness = {
                name: data.name,
                location: { type: 'Point', coordinates: data.coordinates.split(',').map(parseFloat)},
                rating: 0,
                createdById: user._id
            };
            const response = await Businesses.insert(newBusiness);
            return Object.assign({ id: response.insertedIds[0] }, newBusiness);
        },
        createProduct: async (root, data, {mongo: { Products }}) => {
            const newProduct = {
                name        : data.name,
                description : data.description
            }
            const response = await Products.insert(newProduct);
            return Object.assign({_id: response.insertedIds[0]}, newProduct);
        }
    },
    Business: {
        id: root => root._id || root.id,
        createdBy: async ({createdById}, data, {dataloaders: {userLoader}}) => {
            return await userLoader.load(createdById);
        },
        products: async ({_id}, data, {mongo: {BusinessProducts, Products}}) => {
            const response    = await BusinessProducts.find({businessId: _id}).toArray();
            const productsIds = response.map((p) => p.productId);
            return await Products.find({_id: {$in: productsIds}}).toArray();
        },
        coordinates: ({location}) => {
            return location.coordinates.join(',');
        }
    },
    BusinessProduct: {
        id: root => root._id || root.id,
        business: async ({businessId}, data, {mongo: {Businesses}}) => {
            return await Businesses.findOne({_id: businessId});
        },
        product: async ({productId}, data, {mongo: {Products}}) => {
            return await Products.findOne({_id: productId});
        }
    },
    Product: {
        id: root => root._id || root.id,
    },
    User: {
        id: root => root._id || root.id,
    },
}
const {makeExecutableSchema} = require('graphql-tools');
const resolvers              = require('./resolvers');

const typeDefs = `
    #-----types-----
    interface Entity {
        id: ID!
        name: String!
    }
    type User implements Entity {
        id: ID!
        name: String!
        email: String!
        password: String!
        businesses: [Business]
    }
    type Product implements Entity {
        id: ID!
        name: String!
        description: String!
    }
    type Business implements Entity {
        id: ID!
        name: String!
        coordinates: String!
        rating: Int!
        products: [Product]!
        createdBy: User!
    }
    type BusinessProduct {
        id: ID!
        business: Business!
        product: Product!
    }
    type SigninPayload {
        token: String
        user: User
    }
    #-----queries-----
    type Query {
        allBusinesses: [Business!]!
        allUsers: [User!]!
        nearbyBusinesses(lat: Float!, long: Float!, distance: Float!): [Business!]!
    }
    #-----mutations-----
    type Mutation {
        addBusinessProduct(businessId: ID!, productId: ID!): BusinessProduct!
        createBusiness(name: String!, coordinates: String): Business!
        createProduct(name: String!, description: String!): Product!
        createUser(name: String!, authProvider: AuthProviderSignupData!): SigninPayload!
        signinUser(email: AUTH_PROVIDER_EMAIL): SigninPayload!
        userExists(email: String!): Boolean!
    }
    #-----inputs-----
    input AuthProviderSignupData {
        email: AUTH_PROVIDER_EMAIL
    }
    input AUTH_PROVIDER_EMAIL {
        email: String!
        password: String!
    }
`;

module.exports = makeExecutableSchema({typeDefs, resolvers});

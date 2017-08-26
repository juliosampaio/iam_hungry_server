const { authenticate }                   = require('./authentication');
const bodyParser                         = require('body-parser');
const connectMongo                       = require('./mongo-connector');
const buildDataloaders                   = require('./dataloaders');
const express                            = require('express');
const jwt                                = require('jsonwebtoken');
const morgan                             = require('morgan');
const schema                             = require('./schema');
const { graphqlExpress, graphiqlExpress} = require('graphql-server-express');

const start = async () => {
    const mongo = await connectMongo();
    var app     = express();

    const buildOptions = async (req, res) => {
        const user = await authenticate(req, mongo.Users, jwt);
        return {
            context: { dataloaders: buildDataloaders(mongo), mongo, user, jwt},
            schema
        };
    };

    app.use("/graphql", function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
        if (req.method === 'OPTIONS') {
            res.sendStatus(200);
        } else {
            next();
        }
    });

    app.use('/graphql', bodyParser.json(), graphqlExpress(buildOptions));

    app.use('/graphiql', graphiqlExpress({
        endpointURL: '/graphql',
        passHeader : `'Authorization': 'bearer token-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTc0YmEzNDY3MDUyNTE0ZDA4MjU4YmUiLCJuYW1lIjoiTWFyZ2UgU2ltcHNvbiIsImVtYWlsIjoibWFyZ2Uuc2ltcHNvbkBnbWFpbC5jb21zIiwicGFzc3dvcmQiOiIkMmEkMTAkUmdwbmxyNE5BWS5GSzFFbUZSRUxuLjVtMUFNL3FGVVJjclVpQW1XbThhTmQ2M09QN1VWTHkiLCJpYXQiOjE1MDA4MjIyNjl9.L-jC3gVTDXnJq093PGhAsP-L4GVlAGlfTRyjvkrxut8'`,
    }));

    app.use(morgan('dev'));

    const PORT = 3000;

    app.listen(PORT, () => {
        console.log(`I'm hungry 😋 🍔  backend server started on port ${PORT}`);
    });
};

start();


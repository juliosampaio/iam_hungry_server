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
        passHeader : `'Authorization': 'bearer token-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OWEyZWY2YTE0YzRmNzAwMWNmYmViYWQiLCJuYW1lIjoiQXBwIEFkbWluIiwiZW1haWwiOiJpYW1odW5ncnlhZG1AZ21haWwuY29tIiwicGFzc3dvcmQiOiIkMmEkMTAkNXhIZkRuaHZoaVZ6amJ1ZVBPVlVIdUR5ZTlaSTV6Smk5OGNQUFg3a0lzZElJWWZPLmtkVmEiLCJpYXQiOjE1MDM4NTA1MDh9.MiHJj_0_DWxrHP4EuiatePA1MGz0q6Y2ndFCNzLlbxU'`,
    }));

    app.use(morgan('dev'));

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`I'm hungry 😋 🍔  backend server started on port ${PORT}`);
    });
};

start();


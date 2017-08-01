const HEADER_REGEX = /bearer token-(.*)$/;
const config       = require('./config'); 

module.exports.authenticate = async ({headers: {authorization}}, Users, jwt) => {    
    const token   = authorization && HEADER_REGEX.exec(authorization)[1];
    const email   = jwt.verify(token, config.secret).email;
    return token && await Users.findOne({email});
}
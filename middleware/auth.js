const jwt = require("jsonwebtoken");
const config = require("config");


module.exports = function(req,res,next) {
    // Get Token from header
    const token = req.header('x-auth-token');

    //check no token
    if(!token) {
        return res.status(401).json({msg:"No Token, autherization denied"});
    }

    //verify token
    try {
        const decoded = jwt.verify(token,config.get('jwtSecret'));
        req.user = decoded.user;
        next();

    } catch(ex) {
        res.status(401).status({msg:"Token is not valid"});
    }
}
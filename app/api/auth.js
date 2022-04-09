const jwt = require("jsonwebtoken");

let checkAuth = (req, res, next) => {
    let token = req.get('token');

    jwt.verify(token, process.env.API_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                status: "failed",
                error: err
            });
        }
        
        req.userData = decoded.userData;

        next();
    });
}

module.exports = { checkAuth };
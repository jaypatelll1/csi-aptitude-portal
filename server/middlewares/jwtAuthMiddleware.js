const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req, res, next)=>{
    const token = req.headers['authorization'];
    if(!token) return console.log("Token not found");
    try {
        const decoded= jwt.verify(token, process.env.JWT_SECRET);
        if(decoded){
            console.log("Verification successful!")
            res.send("Success!", 200);
        } else {
            res.send("Invalid Token!")
        }
        next()
    } catch (err) {
        console.error("Error!", err.message);
    }
};

module.exports = {jwtAuthMiddleware};

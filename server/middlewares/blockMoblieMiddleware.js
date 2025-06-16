// const blockMobileMiddleware = (req, res, next) => {
//     const userAgent = req.headers['user-agent'] || '';

//     // Define mobile keywords (Modify as per your requirements)
//     const mobileKeywords = ['Android', 'iPhone', 'iPad', 'iPod', 'Mobile'];

//     // Check if User-Agent contains any mobile keyword
//     if (mobileKeywords.some(keyword => userAgent.includes(keyword))) {
//         return res.status(403).json({ message: "Login from mobile devices is not allowed." });
//     }

//     next();
// };


// module.exports = {blockMobileMiddleware}

const useragent = require('express-useragent');

const blockMobileMiddleware = (req, res, next) => {
    const source = req.headers['user-agent'] || '';
    const ua = useragent.parse(source);

    if (ua.isMobile || ua.isTablet) {
        return res.status(403).json({ message: "Login from mobile devices is not allowed." });
    }

    next();
};

module.exports = {blockMobileMiddleware}

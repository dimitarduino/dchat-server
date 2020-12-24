require('dotenv').config();
const jwt = require("jsonwebtoken")

const auth = (req, res, next) => {
    const token = req.header('auth-token');

    if (!token) {
        return res.status(401).json({msg: 'Nema token, access denied'});
    }

    try {
        const decode = jwt.verify(token, process.env.SECRET);
        console.log('Dekodirano: ', decode);
        req.user = decode;

        console.log(req.user);
        next(); 
    } catch (err) {
        res.status(401).json({
            msg: "Nevaliden token"
        })
    }
}

module.exports = auth;
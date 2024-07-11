const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        console.log('Brak tokena, autoryzacja odmówiona');
        return res.status(401).json({ message: 'Brak tokena, autoryzacja odmówiona' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Nieprawidłowy token:', error.message);
        res.status(401).json({ message: 'Nieprawidłowy token' });
    }
};

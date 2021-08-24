const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.header('Authorization');
    // console.log('med');
    // console.log(token);
    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token

    try {
        jwt.verify(token, 'secret', (error, decoded) => {
            if (error) {
                return res.status(401).json({ msg: 'Token is not valid' });
            } else {
                req.user = decoded.user;
                // Validate Admin ID
                // console.log(req.user);

                if (req.user.id == '6060f4bb555ade2bcbf37030') {
                    // console.log('auth admin');
                    next();
                } else {
                    return res.status(401).json({ msg: 'Token is not valid' });
                }
            }
        });
    } catch (err) {
        console.error('something wrong with auth middleware');
        res.status(500).json({ msg: 'Server Error' });
    }
};

const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header('Authorization');
  // console.log('med');
  // console.log(token);
  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Verify token

  try {
    jwt.verify(token, "secret", (error, decoded) => {
      if (error) {
        return res.status(401).json({ msg: "Token is not valid" });
      } else {
        // console.log('In auth med decoded.id');
        // console.log(decoded);
        // req.user = decoded.user;
        req.user = decoded;
        next();
      }
    });
  } catch (err) {
    console.error("something wrong with auth middleware");
    res.status(500).json({ msg: "Server Error" });
  }
};

const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const decoded = jwt.verify(
      req.body.token,
      "238hlaksndcipja9wue9f8ujw9fu98wu20o"
    );
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Auth failed",
      verified: false,
    });
  }
};

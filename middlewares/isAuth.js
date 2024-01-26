const jwt = require("jsonwebtoken");

//env
const {
  parsed: { TOKEN_SECRET },
} = require("dotenv").config();

//This middleware is responable for check if the ecoming request has a valid JWT token
const isAuth = (req, res, next) => {
  //Get the token from the request headers
  const token = req.header("Authorization");

  //If no token was sent, return access denied
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    //Verify if the provided token is valid
    const decoded = jwt.verify(token, TOKEN_SECRET);

    //Store the extracted data on the request object
    req.user = decoded;

    //Go to the next middleware
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid Token" });
  }
};

module.exports = isAuth;

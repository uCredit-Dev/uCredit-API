require("dotenv").config();
const jwt = require("jsonwebtoken");

const createToken = (user) => {
  console.log("secret:", process.env.JWT_SECRET);
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      affiliation: user.affiliation,
    },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "30d",
    }
  );
};

const verifyToken = (token) => {
  return new Promise((resolve, _reject) => {
    jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] },
      (err, _decoded) => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      }
    );
  });
};

const decodeToken = (token) => {
  const decoded = jwt.decode(token);
  return decoded;
};

const auth = async (req, res, next) => {
  const { authorization } = req.headers;
  const [_, token] = authorization.trim().split(" ");
  const valid = await verifyToken(token);
  req.user = decodeToken(token);
  if (!valid) {
    return res.status(403).json({
      message: "You are not authorized to access this resource.",
    });
  }
  next();
};

module.exports = {
  createToken,
  verifyToken,
  decodeToken,
  auth,
};

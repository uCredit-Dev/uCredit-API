import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { UserDoc, User as Users } from "../model_ts/User";
import { forbiddenHandler } from "../routes_ts/helperMethods";
import dotenv from "dotenv";

dotenv.config();

const createToken = (user: UserDoc) => {
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

const verifyToken = (token: string) => {
  return new Promise((resolve, _reject) => {
    jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] },
      (err: any, _decoded: string) => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      }
    );
  });
};

const decodeToken = (token: string) => {
  const decoded = jwt.decode(token);
  return decoded;
};

const auth = async (req: Request & {user: UserDoc}, res: Response, next) => {
  const { authorization } = req.headers;
  if (authorization) {
    const [_, token] = authorization.trim().split(" ");
    const valid = await verifyToken(token);
    if (valid) {
      req.user = decodeToken(token);
      const user = await Users.findById(req.user._id);
      if (user && (!req.body.user_id || req.body.user_id === req.user._id)) {
        return next();
      }
    }
  }
  forbiddenHandler(res);
};

export { createToken, decodeToken, auth };

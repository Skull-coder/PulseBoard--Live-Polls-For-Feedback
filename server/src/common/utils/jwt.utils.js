import jwt from "jsonwebtoken";
import crypto from "crypto"

export const generateAccessToken = (user) => {
    return jwt.sign(
        {id: user._id},
        process.env.JWT_ACCESS_SECRET,
        {expiresIn: process.env.JWT_ACCESS_EXPIRES_IN}
    )
}


export const verifyAccessToken = (token) =>{
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET)
}


export const generateTokenPair = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  return { rawToken, hashedToken };
};

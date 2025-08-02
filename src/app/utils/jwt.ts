import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

// generate jwt token
export const generateToken = (
  paylad: JwtPayload,
  secret: string,
  expiresIn: string
) => {
  const accessToken = jwt.sign(paylad, secret, { expiresIn } as SignOptions);

  return accessToken;
};

// verify jwt token
export const verifyToken = (token: string, secret: string) => {
  const verifiedToken = jwt.verify(token, secret);

  return verifiedToken;
};

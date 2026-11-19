import type { RequestHandler } from "express";
import { currentUser } from "../middleware/auth.js";
import { login, loginWithGoogle, signToken } from "../services/auth.service.js";
import { toUserDto } from "../services/user-dto.js";
import { sendSuccess } from "../utils/response.js";
import type { GoogleLoginBody, LoginBody } from "../validators/auth.validators.js";

export const postLogin: RequestHandler = async (req, res) => {
  const { email, password } = req.body as LoginBody;
  const user = await login(email, password);
  sendSuccess(res, { token: signToken(user.id as string), user: toUserDto(user) });
};

// Same answer as POST /login, so the client handles both the same way.
export const postGoogleLogin: RequestHandler = async (req, res) => {
  const { credential } = req.body as GoogleLoginBody;
  const user = await loginWithGoogle(credential);
  sendSuccess(res, { token: signToken(user.id as string), user: toUserDto(user) });
};

export const getMe: RequestHandler = (req, res) => {
  sendSuccess(res, toUserDto(currentUser(req)));
};

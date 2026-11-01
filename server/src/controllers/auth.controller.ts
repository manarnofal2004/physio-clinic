import type { RequestHandler } from "express";
import { currentUser } from "../middleware/auth.js";
import { login, signToken } from "../services/auth.service.js";
import { toUserDto } from "../services/user-dto.js";
import { sendSuccess } from "../utils/response.js";
import type { LoginBody } from "../validators/auth.validators.js";

export const postLogin: RequestHandler = async (req, res) => {
  const { email, password } = req.body as LoginBody;
  const user = await login(email, password);
  sendSuccess(res, { token: signToken(user.id as string), user: toUserDto(user) });
};

export const getMe: RequestHandler = (req, res) => {
  sendSuccess(res, toUserDto(currentUser(req)));
};

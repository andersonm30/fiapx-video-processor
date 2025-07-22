import { authenticateJWT } from "../authMiddleware";
import jwt from "jsonwebtoken";
import { mock } from "jest-mock-extended";
import { Request, Response, NextFunction } from "express";

const validToken = jwt.sign({ id: 1, username: "usuario1" }, "aj6I4zJ4jxT1Vsk8q3!q8*2%T91m4G5n7w1B9Xk2tR6sE0V1", { expiresIn: "1h" });

describe("Middleware authenticateJWT", () => {
  it("Deve validar um token JWT válido", () => {
    const req = mock<Request>();
    req.headers.authorization = `Bearer ${validToken}`;
    const res = mock<Response>();
    const next = jest.fn();

    authenticateJWT(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("Deve retornar erro para token inválido", () => {
    const req = mock<Request>();
    req.headers.authorization = "Bearer invalidToken";
    const res = mock<Response>();
    res.status.mockReturnValue(res);
    const next = jest.fn();

    authenticateJWT(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token inválido" });
  });
});

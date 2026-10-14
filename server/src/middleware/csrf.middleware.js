import { verifyCsrfToken } from "../utils/csrf.js";

// Check that the request came from our configured frontend
export function requireTrustedOrigin(req, res, next) {
  const allowedOrigin = process.env.FRONTEND_URL;
  const requestOrigin = req.get("Origin");

  if (!allowedOrigin || requestOrigin !== allowedOrigin) {
    return res.status(403).json({
      message: "Untrusted request origin.",
    });
  }

  next();
}

// Check the CSRF cookie against the request header
export function verifyCsrf(req, res, next) {
  const cookieToken = req.cookies?.csrfToken;
  const headerToken = req.get("X-CSRF-Token");

  if (
    typeof cookieToken !== "string" ||
    typeof headerToken !== "string" ||
    cookieToken !== headerToken ||
    !verifyCsrfToken(headerToken)
  ) {
    return res.status(403).json({
      message: "Invalid or missing CSRF token.",
    });
  }

  next();
}

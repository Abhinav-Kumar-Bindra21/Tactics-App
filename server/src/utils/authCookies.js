const isProduction = process.env.NODE_ENV === "production";

// Cookie containing the JWT used to authenticate requests
export const accessCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
  maxAge: 15 * 60 * 1000, // 15 minutes
};

// Cookie used for CSRF protection
export const csrfCookieOptions = {
  httpOnly: false,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
  maxAge: 15 * 60 * 1000, // 15 minutes
};

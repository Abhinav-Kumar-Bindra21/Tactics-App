import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// Create a signature using the private CSRF secret
function sign(value) {
  const secret = process.env.CSRF_SECRET;

  if (!secret) {
    throw new Error("CSRF_SECRET is not configured.");
  }

  return createHmac("sha256", secret).update(value).digest("hex");
}

// Generate a signed CSRF token
export function createCsrfToken() {
  const nonce = randomBytes(32).toString("hex");

  return `${nonce}.${sign(nonce)}`;
}

// Verify that a CSRF token has a valid signature
export function verifyCsrfToken(token) {
  if (typeof token !== "string") {
    return false;
  }

  const parts = token.split(".");

  if (parts.length !== 2) {
    return false;
  }

  const [nonce, suppliedSignature] = parts;

  if (!/^[a-f0-9]{64}$/.test(nonce) || !/^[a-f0-9]{64}$/.test(suppliedSignature)) {
    return false;
  }

  const expectedSignature = sign(nonce);

  return timingSafeEqual(Buffer.from(suppliedSignature, "hex"), Buffer.from(expectedSignature, "hex"));
}

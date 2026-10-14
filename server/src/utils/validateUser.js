import validator from "validator";

export const validateUser = (data) => {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid request data");
  }

  const { name, email, password } = data;

  // Check types before calling string methods.
  if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
    throw new Error("Name, email and password are required");
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim();

  if (!cleanName || !cleanEmail || !password) {
    throw new Error("All fields are required");
  }

  if (!validator.isEmail(cleanEmail)) {
    throw new Error("Invalid email address");
  }

  if (!validator.isLength(cleanName, { min: 3, max: 34 })) {
    throw new Error("Name must contain 3 to 34 characters");
  }

  if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong enough");
  }

  // bcrypt only processes up to 72 bytes.
  if (Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("Password is too long");
  }

  return {
    name: cleanName,
    email: cleanEmail.toLowerCase(),
    password,
  };
};

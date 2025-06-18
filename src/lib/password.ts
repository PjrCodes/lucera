import crypto from "crypto";

/**
 * Salts and hashes a password using SHA-256.
 * @param password The plain text password to hash.
 * @returns The salted and hashed password as a hex string.
 */
export function saltAndHashPassword(password: unknown): string {
  if (typeof password !== "string") {
    throw new Error("Password must be a string.");
  }
  const salt = process.env.PASSWORD_SALT;
  if (!salt) {
    throw new Error("Missing environment variable: PASSWORD_SALT");
  }
  const hash = crypto.createHmac("sha256", salt).update(password).digest("hex");
  return hash;
}


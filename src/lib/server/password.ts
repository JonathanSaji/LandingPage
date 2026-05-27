import crypto from "node:crypto";

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  if (!storedHash || !storedHash.includes(":")) {
    return false;
  }

  const [salt, originalHash] = storedHash.split(":");
  const attemptedHash = crypto.scryptSync(password, salt, 64).toString("hex");

  const originalBuffer = Buffer.from(originalHash, "hex");
  const attemptedBuffer = Buffer.from(attemptedHash, "hex");

  if (originalBuffer.length !== attemptedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(originalBuffer, attemptedBuffer);
}

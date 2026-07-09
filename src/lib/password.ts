import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

function scrypt(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scrypt(password, salt)}`;
}

export function verifyPassword(password: string, hash: string) {
  const [salt, storedHash] = hash.split(":");
  if (!salt || !storedHash) return false;

  const candidateHash = scrypt(password, salt);
  return (
    storedHash.length === candidateHash.length &&
    timingSafeEqual(Buffer.from(storedHash, "hex"), Buffer.from(candidateHash, "hex"))
  );
}

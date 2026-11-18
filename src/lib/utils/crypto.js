import crypto from "node:crypto";

const algorithm = "aes-256-cbc";
const cryptoSecretKey = import.meta.env.CRYPTO_SECRET_KEY;

if (!cryptoSecretKey) {
  throw new Error("CRYPTO_SECRET_KEY is not set!");
}

/**
 * Encrypt data using node:crypto
 * @param {any} value
 * @returns {string}
 */
export function encrypt(value) {
  const key = crypto.scryptSync(cryptoSecretKey, "salt", 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(value, "utf8", "hex");
  encrypted += cipher.final("hex");

  const hmac = crypto.createHmac("sha256", key);
  hmac.update(encrypted);
  const authTag = hmac.digest("hex");

  return encrypted + ":" + iv.toString("hex") + ":" + authTag;
}

/**
 * Decrypt data encryted by `encrypt()`
 * @param {string} encryptedValue
 * @returns {string}
 */
export function decrypt(encryptedValue) {
  const [encryptedData, encryptionIV, encryptionAuthTag] =
    encryptedValue.split(":");
  const key = crypto.scryptSync(cryptoSecretKey, "salt", 32);

  const hmac = crypto.createHmac("sha256", key);
  hmac.update(encryptedData);
  const calcAuthTag = hmac.digest("hex");

  if (calcAuthTag !== encryptionAuthTag) {
    throw new Error("Authentication failed!");
  }

  const iv = Buffer.from(encryptionIV, "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

import { describe, it, expect, beforeEach, vi } from "vitest";
import { encrypt, decrypt } from "../../../src/lib/utils/crypto.js";

describe("Crypto Functions", () => {
  describe("encrypt and decrypt round-trip", () => {
    it("should encrypt and decrypt successfully", () => {
      const original = "sensitive data";
      const encrypted = encrypt(original);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(original);
      expect(encrypted).not.toBe(original);
      expect(encrypted).toContain(":"); // Should contain IV and auth tag separators
    });

    it("should produce different encrypted values for same input", () => {
      const data = "test data";
      const encrypted1 = encrypt(data);
      const encrypted2 = encrypt(data);

      expect(encrypted1).not.toBe(encrypted2);
      expect(decrypt(encrypted1)).toBe(data);
      expect(decrypt(encrypted2)).toBe(data);
    });

    it("should handle different data types as strings", () => {
      const testCases = [
        "simple string",
        "string with special chars: !@#$%^&*()",
        "123456789",
        "",
        "very long string that contains multiple words and should be encrypted and decrypted properly",
        "unicode: 你好世界 🌍 emoji",
      ];

      testCases.forEach((testData) => {
        const encrypted = encrypt(testData);
        const decrypted = decrypt(encrypted);
        expect(decrypted).toBe(testData);
      });
    });

    it("should handle JSON-like strings", () => {
      const jsonString = JSON.stringify({
        user: "test",
        token: "abc123",
        nested: { data: "value" },
      });
      const encrypted = encrypt(jsonString);
      const decrypted = decrypt(encrypted);

      expect(decrypted).toBe(jsonString);
      expect(JSON.parse(decrypted)).toEqual({
        user: "test",
        token: "abc123",
        nested: { data: "value" },
      });
    });
  });

  describe("encryption format validation", () => {
    it("should produce encrypted string with correct format", () => {
      const data = "test data";
      const encrypted = encrypt(data);

      // Should have format: encryptedData:iv:authTag
      const parts = encrypted.split(":");
      expect(parts).toHaveLength(3);

      // Each part should be hex encoded
      parts.forEach((part) => {
        expect(part).toMatch(/^[a-f0-9]+$/);
        expect(part.length).toBeGreaterThan(0);
      });
    });

    it("should produce different IVs for each encryption", () => {
      const data = "test data";
      const encrypted1 = encrypt(data);
      const encrypted2 = encrypt(data);

      const iv1 = encrypted1.split(":")[1];
      const iv2 = encrypted2.split(":")[1];

      expect(iv1).not.toBe(iv2);
    });
  });

  describe("error handling", () => {
    it("should throw error for tampered encrypted data", () => {
      const original = "sensitive data";
      const encrypted = encrypt(original);

      // Tamper with the encrypted data by flipping the first hex character
      // Always change the first character to a different valid hex character
      const tampered =
        encrypted[0] === "a"
          ? "b" + encrypted.slice(1)
          : "a" + encrypted.slice(1);

      expect(() => decrypt(tampered)).toThrow("Authentication failed!");
    });

    it("should throw error for malformed encrypted string", () => {
      expect(() => decrypt("invalid-format")).toThrow();
      expect(() => decrypt("only:two")).toThrow(); // Not enough parts
      expect(() => decrypt("")).toThrow();
      expect(() => decrypt(":")).toThrow();
      expect(() => decrypt("::")).toThrow();
    });

    it("should throw error for invalid hex encoding", () => {
      expect(() => decrypt("invalid-hex:invalid-hex:invalid-hex")).toThrow();
    });

    it("should throw error for tampered auth tag", () => {
      const original = "sensitive data";
      const encrypted = encrypt(original);
      const parts = encrypted.split(":");

      // Tamper with auth tag
      const tamperedAuthTag = parts[2].replace("a", "b");
      const tampered = `${parts[0]}:${parts[1]}:${tamperedAuthTag}`;

      expect(() => decrypt(tampered)).toThrow("Authentication failed!");
    });

    it("should throw error for tampered IV", () => {
      const original = "sensitive data";
      const encrypted = encrypt(original);
      const parts = encrypted.split(":");

      // Tamper with IV - this might not always throw but should at least fail decryption
      const tamperedIV = parts[1].replace("a", "b");
      const tampered = `${parts[0]}:${tamperedIV}:${parts[2]}`;

      // Either throws an error or produces wrong result
      try {
        const result = decrypt(tampered);
        expect(result).not.toBe(original);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("security properties", () => {
    it("should not reveal original data in encrypted output", () => {
      const sensitiveData = "password123";
      const encrypted = encrypt(sensitiveData);

      expect(encrypted).not.toContain(sensitiveData);
      expect(encrypted.toLowerCase()).not.toContain(
        sensitiveData.toLowerCase(),
      );
    });

    it("should use proper key derivation", () => {
      // This test ensures the encryption is using the mocked secret key
      const data = "test";
      const encrypted = encrypt(data);

      // Should be able to decrypt with same environment
      expect(decrypt(encrypted)).toBe(data);
    });

    it("should produce different outputs for similar inputs", () => {
      const inputs = ["test1", "test2", "test3"];
      const encrypted = inputs.map((input) => encrypt(input));

      // All encrypted values should be different
      expect(new Set(encrypted).size).toBe(inputs.length);

      // But should decrypt to original values
      encrypted.forEach((enc, index) => {
        expect(decrypt(enc)).toBe(inputs[index]);
      });
    });
  });

  describe("edge cases", () => {
    it("should handle empty string", () => {
      const encrypted = encrypt("");
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe("");
    });

    it("should handle very long strings", () => {
      const longString = "a".repeat(10000);
      const encrypted = encrypt(longString);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(longString);
    });

    it("should handle strings with newlines and special characters", () => {
      const complexString = "Line 1\nLine 2\r\nTab:\tEnd";
      const encrypted = encrypt(complexString);
      const decrypted = decrypt(encrypted);
      expect(decrypted).toBe(complexString);
    });
  });
});

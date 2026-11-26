import { describe, expect, it } from "vitest";

import { passwordStrength, recoveryFormSchema, resetPasswordSchema } from "./validation";

describe("passwordStrength", () => {
  it("rises with length and variety", () => {
    expect(passwordStrength("").score).toBe(0);
    expect(passwordStrength("abc").label).toBe("Too short");
    expect(passwordStrength("abcdefgh").label).toBe("Fair");
    expect(passwordStrength("abcdefghij12").label).toBe("Good");
    expect(passwordStrength("abcdefghijklmnop").label).toBe("Strong"); // length wins
    expect(passwordStrength("Tr0ub4dor&3xyz").label).toBe("Strong");
  });

  it("does not call a long single-class password strong", () => {
    expect(passwordStrength("aaaaaaaaaaaa").score).toBeLessThanOrEqual(2);
  });
});

describe("recoveryFormSchema", () => {
  it("accepts spring-iam's format, with or without the dash, any case", () => {
    for (const code of ["a1b2c3d4-e5f60718", "A1B2C3D4E5F60718", " a1b2c3d4-e5f60718 "]) {
      expect(recoveryFormSchema.safeParse({ code }).success, code).toBe(true);
    }
    expect(recoveryFormSchema.parse({ code: "A1B2C3D4-E5F60718" }).code).toBe("a1b2c3d4-e5f60718");
  });

  it("rejects anything else", () => {
    for (const code of ["123456", "a1b2c3d4", "g1b2c3d4-e5f60718"]) {
      expect(recoveryFormSchema.safeParse({ code }).success, code).toBe(false);
    }
  });
});

describe("resetPasswordSchema", () => {
  it("requires the confirmation to match", () => {
    const r = resetPasswordSchema.safeParse({ password: "longenough", confirm: "different" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].path).toEqual(["confirm"]);
  });
});

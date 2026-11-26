import { describe, expect, it } from "vitest";

import { pickHandoff, safeContinueUrl } from "./oidc";

const here = "https://accounts.example.com";

describe("safeContinueUrl", () => {
  it("follows same-origin URLs, absolute or relative", () => {
    const sso = `${here}/api/auth/sso/authorize?redirect_uri=x`;
    expect(safeContinueUrl(sso, here)).toBe(sso);
    expect(safeContinueUrl("/api/auth/sso/authorize", here)).toBe(`${here}/api/auth/sso/authorize`);
  });

  it("follows origins on the trusted list only", () => {
    const iam = "https://iam.example.com/api/auth/sso/authorize";
    expect(safeContinueUrl(iam, here)).toBeNull();
    expect(safeContinueUrl(iam, here, ["https://iam.example.com"])).toBe(iam);
  });

  it("refuses open-redirect tricks", () => {
    for (const evil of [
      "https://evil.test/",
      "//evil.test/path",
      "javascript:alert(1)",
      "data:text/html,hi",
      "https://accounts.example.com.evil.test/",
      "https://accounts.example.com@evil.test/",
    ]) {
      expect(safeContinueUrl(evil, here), evil).toBeNull();
    }
  });

  it("treats missing or garbage input as nowhere to go", () => {
    expect(safeContinueUrl(undefined, here)).toBeNull();
    expect(safeContinueUrl("", here)).toBeNull();
    expect(safeContinueUrl("http://[::1", here)).toBeNull();
  });
});

describe("pickHandoff", () => {
  it("keeps only known, non-empty string params", () => {
    expect(pickHandoff({ continue: "/x", audience: "", token: "secret", state: 1 })).toEqual({
      continue: "/x",
    });
  });
});

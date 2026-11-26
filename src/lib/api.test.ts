import { afterEach, describe, expect, it, vi } from "vitest";

import { api, ApiError, toOutcome } from "./api";

function mockFetch(status: number, body: unknown) {
  const fn = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
    typeof body === "string" ? new Response(body, { status }) : Response.json(body, { status }),
  );
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe("toOutcome", () => {
  it("maps spring-iam login results", () => {
    expect(toOutcome({ accessToken: "t" })).toEqual({ status: "OK" });
    expect(toOutcome({ status: "MFA_REQUIRED", challenge: "c" })).toEqual({
      status: "MFA_REQUIRED",
      challenge: "c",
    });
    expect(toOutcome({ status: "MFA_ENROLLMENT_REQUIRED", enrollmentToken: "e" })).toEqual({
      status: "MFA_ENROLLMENT_REQUIRED",
      enrollmentToken: "e",
    });
  });
});

describe("api", () => {
  it("unwraps the { success, message, data } envelope", async () => {
    mockFetch(200, {
      success: true,
      message: "MFA required",
      data: { status: "MFA_REQUIRED", challenge: "c" },
    });
    await expect(api.login({ email: "a@b.co", password: "x" })).resolves.toEqual({
      status: "MFA_REQUIRED",
      challenge: "c",
    });
  });

  it("sends email and token as query params where spring-iam expects them", async () => {
    const fetch = mockFetch(200, { success: true, data: {} });
    await api.forgotPassword("a+b@c.co");
    await api.verifyEmail("t/1");
    expect(fetch.mock.calls.map((c) => c[0])).toEqual([
      "/api/auth/forgot-password?email=a%2Bb%40c.co",
      "/api/auth/verify-email?token=t%2F1",
    ]);
  });

  it("surfaces the server's message on errors", async () => {
    mockFetch(401, { success: false, message: "Invalid email or password" });
    await expect(api.login({ email: "a@b.co", password: "x" })).rejects.toMatchObject({
      status: 401,
      message: "Invalid email or password",
    });
  });

  it("falls back to plain copy when the body isn't JSON", async () => {
    mockFetch(502, "<html>Bad gateway</html>");
    const err = await api.oauthProviders().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).message).toMatch(/on our end/);
  });

  it("reports network failures as status 0", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new TypeError("offline"))),
    );
    await expect(api.oauthProviders()).rejects.toMatchObject({ status: 0 });
  });
});

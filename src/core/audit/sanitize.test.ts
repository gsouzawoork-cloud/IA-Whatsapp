import { describe, expect, it } from "vitest";
import { sanitizeAuditMetadata } from "./sanitize";

describe("sanitização de metadados de auditoria", () => {
  it("redige chaves sensíveis por nome", () => {
    const out = sanitizeAuditMetadata({
      orderId: "abc",
      password: "hunter2",
      access_token: "xyz",
      customerName: "Ana",
    });
    expect(out.orderId).toBe("abc");
    expect(out.password).toBe("[redacted]");
    expect(out.access_token).toBe("[redacted]");
    expect(out.customerName).toBe("Ana");
  });

  it("redige recursivamente em objetos aninhados", () => {
    const out = sanitizeAuditMetadata({
      payload: { token: "secret", value: 10 },
    });
    expect((out.payload as Record<string, unknown>).token).toBe("[redacted]");
    expect((out.payload as Record<string, unknown>).value).toBe(10);
  });

  it("descarta funções e trunca strings longas", () => {
    const long = "x".repeat(600);
    const out = sanitizeAuditMetadata({ fn: () => 1, note: long });
    expect(out.fn).toBeUndefined();
    expect((out.note as string).length).toBeLessThanOrEqual(501);
  });
});

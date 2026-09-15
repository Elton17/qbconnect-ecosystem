import { describe, expect, it } from "vitest";
import { isValidCNPJ, isValidCPF } from "@/lib/masks";

describe("documentos empresariais opcionais", () => {
  it("aceita CPF válido e rejeita CPF inválido", () => {
    expect(isValidCPF("529.982.247-25")).toBe(true);
    expect(isValidCPF("111.111.111-11")).toBe(false);
  });

  it("aceita CNPJ válido e rejeita CNPJ inválido", () => {
    expect(isValidCNPJ("11.222.333/0001-81")).toBe(true);
    expect(isValidCNPJ("11.111.111/1111-11")).toBe(false);
  });
});
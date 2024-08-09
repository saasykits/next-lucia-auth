import { readFileSync } from "fs";
import { type Page, type Locator, expect } from "@playwright/test";
import type { Paths } from "@/lib/constants";
import { extractLastCode } from "../test-utils";

export class Auth {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly codeInput: Locator;
  private readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.codeInput = page.locator('input[name="code"]');
    this.submitButton = page.locator("#submit-btn");
  }

  async goto(path: Paths.Login | Paths.Signup | Paths.VerifyEmail | Paths.ResetPassword) {
    await this.page.goto(path);
  }
  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }
  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }
  async fillCredential(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
  }
  async submit() {
    await this.submitButton.click();
  }
  async fillVerificationCode() {
    const data = readFileSync("application.log", { encoding: "utf-8" });
    const code = extractLastCode(data);
    expect(code).not.toBeNull();
    await this.codeInput.fill(code!);
  }
}

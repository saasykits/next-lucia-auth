import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { expect, test } from "@playwright/test";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { readFileSync } from "fs";
import { testLoginUser, testSignupUser } from "./utils";

test.beforeAll(async () => {
  const hashedPassword = await bcrypt.hash(testLoginUser.password, 10);
  await Promise.allSettled([
    db.insert(users).values({ email: testLoginUser.email, hashedPassword, emailVerified: false }),
    db.delete(users).where(eq(users.email, testSignupUser.email)),
  ]).catch((error) => {
    console.error(error);
  });
});

test.describe("signup and login", () => {
  test("signup", async ({ page }) => {
    await page.goto("/");
    await page.getByText("login").click();
    await page.getByText(/sign up/i).click();
    await page.waitForURL("/signup");
    await page.getByLabel("Email").fill(testSignupUser.email);
    await page.getByLabel("Password").fill(testSignupUser.password);
    await page.getByLabel("submit-btn").click();
    await page.waitForURL("/verify-email");
    const data = readFileSync("application.log", { encoding: "utf-8" });
    const code = extractVerificationCode(data, testSignupUser.email);
    expect(code).not.toBeNull();
    await page.getByLabel("Verification Code").fill(code!);
    await page.getByLabel("submit-btn").click();
    await page.waitForURL("/dashboard");
  });
  test("login and logout", async ({ page }) => {
    await page.goto("/");
    await page.getByText("login").click();
    await page.getByLabel("Email").fill(testLoginUser.email);
    await page.getByLabel("Password").fill(testLoginUser.password);
    await page.getByLabel("submit-btn").click();
    await page.waitForURL("/dashboard");
    await page.getByLabel("user dropdown menu").click();
    await page.getByText("Sign out").click();
    await page.getByText("Continue").click();
    await page.waitForURL("/");
  });
});

function extractVerificationCode(log: string, email: string): string | null {
  const logLines = log.split(/\r?\n/).filter((line) => line.includes(email));
  const lastLog = logLines[logLines.length - 1];
  if (!lastLog) return null;
  const logObj = JSON.parse(lastLog) as unknown;
  if (logObj && logObj instanceof Object && "code" in logObj && typeof logObj.code === "string") {
    return logObj.code;
  }
  return null;
}

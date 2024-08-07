import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { test as base, expect } from "@playwright/test";
import { inArray } from "drizzle-orm";
import { testSignupUser, testLoginUser } from "./test-utils";
import { Auth } from "./fixtures/auth.fixture";
import { Paths } from "@/lib/constants";

let isLoginProfileCreated = false;
let testAccountsDeleted = false;

const test = base.extend<{ auth: Auth }>({
  auth: async ({ page }, use) => {
    const auth = new Auth(page);
    if (!testAccountsDeleted) {
      await db
        .delete(users)
        .where(inArray(users.email, [testSignupUser.email, testLoginUser.email]))
        .catch((error) => console.error(error));
      testAccountsDeleted = true;
    }
    if (!isLoginProfileCreated) {
      await auth.goto(Paths.Signup);
      await auth.fillCredential(testLoginUser.email, testLoginUser.password);
      await auth.submit();
      await auth.fillVerificationCode();
      await auth.submit();
      isLoginProfileCreated = true;
    }
    await use(auth);
  },
});

test("credential signup flow", async ({ page, auth }) => {
  await auth.goto(Paths.Signup);
  await auth.fillCredential(testSignupUser.email, testSignupUser.password);
  await auth.submit();
  await auth.fillVerificationCode();
  await auth.submit();
  await page.waitForURL(Paths.Dashboard);
});

test("credential login flow", async ({ page, auth }) => {
  await auth.goto(Paths.Login);
  await auth.fillCredential(testLoginUser.email, testLoginUser.password);
  await auth.submit();
  await page.waitForURL(Paths.Dashboard);
  await page.getByAltText("Avatar").click();
  await page.getByText("Sign out").click();
  await page.getByText("Continue").click();
  await page.waitForURL(Paths.Login);
});

test("show error on wrong password", async ({ page, auth }) => {
  await auth.goto(Paths.Login);
  await auth.fillCredential(testLoginUser.email, "wrong password");
  await expect(page.getByText("Incorrect email or password")).toBeVisible();
});

test("reset password flow", async ({ page, auth }) => {
  await auth.goto(Paths.ResetPassword);
  await auth.fillEmail(testLoginUser.email);
  await auth.submit();
});

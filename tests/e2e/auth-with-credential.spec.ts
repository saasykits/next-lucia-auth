import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { test, expect } from "@playwright/test";
import { eq } from "drizzle-orm";
import { testUser } from "./utils";

let userDeleted = false;
test.beforeAll(() => {
  if (userDeleted) return;
  db.delete(users)
    .where(eq(users.email, testUser.email))
    .then(() => {
      userDeleted = true;
    })
    .catch((error) => {
      console.error(error);
    });
});

test.describe("signup and login", () => {
  test("signup", async ({ page }) => {
    await page.goto("/");
    await page.getByText("login").click();
    await page.getByText(/sign up/i).click();
    await page.getByLabel("Email").fill(testUser.email);
    await page.getByLabel("Password").fill(testUser.password);
    await page.getByText(/sign up/i).click();
    await page.waitForURL("/verify-email");
  });
});

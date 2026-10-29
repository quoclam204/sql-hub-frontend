import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { loginAsAdmin } from "../generators/helpers/admin-login.js";
import { apiCreateNewUser } from "../helpers/api-requests.js";
import { login } from "../helpers/login.js";

test.describe("Admin Bulk Content Import (FR-ADMIN-03) - Admin Access", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should display bulk import card on admin panel home", async ({ page }) => {
    await page.goto("/en/admin-panel");
    await page.waitForURL(/\/admin-panel/);

    await expect(page.getByTestId("admin-card-bulk-import")).toBeVisible();
    await page.getByTestId("admin-card-bulk-import").click();
    await page.waitForURL(/\/admin-panel\/bulk-import/);
  });

  test("should display bulk import page with selectors, template loader, and actions", async ({
    page,
  }) => {
    await page.goto("/en/admin-panel/bulk-import");
    await page.waitForURL(/\/admin-panel\/bulk-import/);

    await expect(page.getByTestId("admin-bulk-import-title")).toBeVisible();
    await expect(page.getByTestId("select-import-type")).toBeVisible();
    await expect(page.getByTestId("select-import-format")).toBeVisible();
    await expect(page.getByTestId("btn-load-template")).toBeVisible();
    await expect(page.getByTestId("textarea-bulk-content")).toBeVisible();
    await expect(page.getByTestId("btn-validate-import")).toBeVisible();
    await expect(page.getByTestId("btn-execute-import")).toBeVisible();
  });

  test("should load sample template into editor when button is clicked", async ({
    page,
  }) => {
    await page.goto("/en/admin-panel/bulk-import");
    await page.waitForURL(/\/admin-panel\/bulk-import/);

    // Initial textarea should be empty
    const textarea = page.getByTestId("textarea-bulk-content");
    await expect(textarea).toHaveValue("");

    // Click load template
    await page.getByTestId("btn-load-template").click();

    // Verify textarea is now populated with template data
    await expect(textarea).not.toHaveValue("");
    const value = await textarea.inputValue();
    expect(value.length).toBeGreaterThan(10);
  });

  test("should clear editor content when clear button is clicked", async ({ page }) => {
    await page.goto("/en/admin-panel/bulk-import");
    await page.waitForURL(/\/admin-panel\/bulk-import/);

    // Load template first
    await page.getByTestId("btn-load-template").click();
    await expect(page.getByTestId("btn-clear-content")).toBeVisible();

    // Clear content
    await page.getByTestId("btn-clear-content").click();
    await expect(page.getByTestId("textarea-bulk-content")).toHaveValue("");
  });
});

test.describe("Admin Bulk Content Import (FR-ADMIN-03) - Non-Admin Access Control", () => {
  let studentEmail: string;
  let studentPassword: string;

  test.beforeEach(async ({ page }) => {
    studentEmail = faker.internet.email({ provider: "example.com" });
    studentPassword = faker.internet.password();
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    await apiCreateNewUser(studentEmail, studentPassword, firstName, lastName);
    await login(studentEmail, studentPassword, page);
  });

  test("should deny regular student access to admin bulk import page", async ({
    page,
  }) => {
    await page.goto("/en/admin-panel/bulk-import");
    await expect(page.getByTestId("admin-bulk-import-title")).not.toBeVisible();
  });
});

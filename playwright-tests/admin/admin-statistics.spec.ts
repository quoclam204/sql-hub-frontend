import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { loginAsAdmin } from "../generators/helpers/admin-login.js";
import { apiCreateNewUser } from "../helpers/api-requests.js";
import { login } from "../helpers/login.js";

test.describe("Admin Statistics (FR-ADMIN-04) - Admin Access", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should display statistics card on admin panel home and navigate", async ({
    page,
  }) => {
    await page.goto("/en/admin-panel");
    await page.waitForURL(/\/admin-panel/);

    await expect(page.getByTestId("admin-card-statistics")).toBeVisible();
    await page.getByTestId("admin-card-statistics").click();
    await page.waitForURL(/\/admin-panel\/statistics/);
  });

  test("should display statistics overview cards, per-lab table, and refresh button", async ({
    page,
  }) => {
    await page.goto("/en/admin-panel/statistics");
    await page.waitForURL(/\/admin-panel\/statistics/);

    await expect(page.getByTestId("admin-statistics-title")).toBeVisible();
    await expect(page.getByTestId("btn-statistics-refresh")).toBeVisible();

    // Metric cards
    await expect(page.getByTestId("stat-card-learners")).toBeVisible();
    await expect(page.getByTestId("stat-card-pass-rate")).toBeVisible();
    await expect(page.getByTestId("stat-card-lessons")).toBeVisible();
    await expect(page.getByTestId("stat-card-quizzes")).toBeVisible();

    // Specific metric value elements
    await expect(page.getByTestId("value-total-learners")).toBeVisible();
    await expect(page.getByTestId("value-lab-pass-rate")).toBeVisible();
    await expect(page.getByTestId("value-lessons-completed")).toBeVisible();
    await expect(page.getByTestId("value-quiz-score")).toBeVisible();

    // Per-lab statistics table
    await expect(
      page.getByTestId("admin-statistics-labs-table")
    ).toBeVisible();
  });

  test("should support refreshing statistics data on button click", async ({
    page,
  }) => {
    await page.goto("/en/admin-panel/statistics");
    await page.waitForURL(/\/admin-panel\/statistics/);

    const refreshBtn = page.getByTestId("btn-statistics-refresh");
    await expect(refreshBtn).toBeVisible();
    await refreshBtn.click();

    // Page should remain stable and title visible after refresh
    await expect(page.getByTestId("admin-statistics-title")).toBeVisible();
  });

  test("should render bilingual content properly in Vietnamese locale", async ({
    page,
  }) => {
    await page.goto("/vi/admin-panel/statistics");
    await page.waitForURL(/\/admin-panel\/statistics/);

    await expect(page.getByTestId("admin-statistics-title")).toBeVisible();
    await expect(page.getByTestId("stat-card-learners")).toBeVisible();
  });
});

test.describe("Admin Statistics (FR-ADMIN-04) - Non-Admin Access Control", () => {
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

  test("should deny regular student access to admin statistics page", async ({
    page,
  }) => {
    await page.goto("/en/admin-panel/statistics");
    await expect(page.getByTestId("admin-statistics-title")).not.toBeVisible();
  });
});

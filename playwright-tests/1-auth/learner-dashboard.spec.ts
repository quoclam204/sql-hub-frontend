import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { apiCreateNewUser } from "../helpers/api-requests.js";
import { login } from "../helpers/login.js";

let email: string;
let password: string;
let firstName: string;
let lastName: string;

test.describe("Learner Progress Dashboard (FR-PROG-01)", () => {
  test.beforeEach(async ({ page }) => {
    email = faker.internet.email({
      provider: "example.com",
    });
    password = faker.internet.password();
    firstName = faker.person.firstName();
    lastName = faker.person.lastName();

    await apiCreateNewUser(email, password, firstName, lastName);
    await login(email, password, page);
  });

  test("should display progress dashboard with completed lessons, quiz scores, and passed labs", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/dashboard/);

    // Verify main title
    await expect(page.getByTestId("dashboard-title")).toBeVisible();

    // Verify metric 1: Completed lessons
    await expect(page.getByTestId("completed-lessons-card")).toBeVisible();
    await expect(page.getByTestId("completed-lessons-count")).toBeVisible();

    // Verify metric 2: Quiz stats
    await expect(page.getByTestId("quiz-stats-card")).toBeVisible();
    await expect(page.getByTestId("quiz-avg-score")).toBeVisible();
    await expect(page.getByTestId("quiz-highest-score")).toBeVisible();

    // Verify metric 3: Passed labs
    await expect(page.getByTestId("passed-labs-card")).toBeVisible();
    await expect(page.getByTestId("passed-labs-count")).toBeVisible();
  });

  test("should show empty progress state for new learner with CTA to browse courses", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/dashboard/);

    // New user with 0 progress should display empty state banner
    await expect(page.getByTestId("dashboard-empty")).toBeVisible();
    await expect(page.getByTestId("dashboard-browse-courses")).toBeVisible();

    // Zero-state values should be cleanly rendered
    await expect(page.getByTestId("completed-lessons-count")).toHaveText("0");
    await expect(page.getByTestId("quiz-avg-score")).toHaveText("0");
    await expect(page.getByTestId("passed-labs-count")).toHaveText("0");
  });

  test("should navigate to dashboard from sidebar navigation and user menu", async ({
    page,
  }) => {
    await page.goto("/");

    // 1. Through sidebar link
    const navDashboard = page.getByTestId("nav-dashboard");
    if (await navDashboard.isVisible()) {
      await navDashboard.click();
      await page.waitForURL(/\/dashboard/);
    }

    // 2. Through user profile dropdown menu
    await page.goto("/");
    await page.getByTestId("profile-menu-item").click();
    await expect(page.getByTestId("user-dashboard")).toBeVisible();
    await page.getByTestId("user-dashboard").click();
    await page.waitForURL(/\/dashboard/);
  });
});

test.describe("Unauthenticated Access to Dashboard", () => {
  test("should redirect unauthenticated guest to sign-in page", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/sign-in/);
  });
});

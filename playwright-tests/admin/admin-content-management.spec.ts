import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import { loginAsAdmin } from "../generators/helpers/admin-login.js";
import { apiCreateNewUser } from "../helpers/api-requests.js";
import { login } from "../helpers/login.js";

test.describe("Admin Content Management (FR-ADMIN-02) - Admin Access", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should display admin portal hub with Lessons, Quizzes, and Labs management cards", async ({
    page,
  }) => {
    await page.goto("/en/admin-panel");
    await page.waitForURL(/\/admin-panel/);

    await expect(page.getByTestId("admin-card-users")).toBeVisible();
    await expect(page.getByTestId("admin-card-lessons")).toBeVisible();
    await expect(page.getByTestId("admin-card-quizzes")).toBeVisible();
    await expect(page.getByTestId("admin-card-labs")).toBeVisible();
  });

  test("should display lessons management page and allow opening create dialog with bilingual fields", async ({
    page,
  }) => {
    await page.goto("/en/admin-panel/lessons");
    await page.waitForURL(/\/admin-panel\/lessons/);

    await expect(page.getByTestId("admin-lessons-title")).toBeVisible();
    await expect(page.getByTestId("btn-add-lesson")).toBeVisible();

    // Open Add Lesson modal
    await page.getByTestId("btn-add-lesson").click();
    await expect(page.getByTestId("lesson-modal")).toBeVisible();

    // Verify fields
    await expect(page.getByTestId("input-lesson-slug")).toBeVisible();
    await expect(page.getByTestId("input-lesson-order")).toBeVisible();
    await expect(page.getByTestId("input-lesson-title-vi")).toBeVisible();
    await expect(page.getByTestId("input-lesson-content-vi")).toBeVisible();
    await expect(page.getByTestId("input-lesson-title-en")).toBeVisible();
    await expect(page.getByTestId("input-lesson-content-en")).toBeVisible();
    await expect(page.getByTestId("btn-save-lesson")).toBeVisible();

    // Close modal
    await page.getByTestId("btn-cancel-lesson").click();
    await expect(page.getByTestId("lesson-modal")).not.toBeVisible();
  });

  test("should display quiz questions management page and validate dynamic options", async ({
    page,
  }) => {
    await page.goto("/en/admin-panel/quiz-questions");
    await page.waitForURL(/\/admin-panel\/quiz-questions/);

    await expect(page.getByTestId("admin-quiz-questions-title")).toBeVisible();
    await expect(page.getByTestId("btn-add-quiz-question")).toBeVisible();

    // Open Add Quiz Question modal
    await page.getByTestId("btn-add-quiz-question").click();
    await expect(page.getByTestId("quiz-question-modal")).toBeVisible();

    // Verify question content fields
    await expect(page.getByTestId("input-question-vi")).toBeVisible();
    await expect(page.getByTestId("input-explanation-vi")).toBeVisible();
    await expect(page.getByTestId("input-question-en")).toBeVisible();
    await expect(page.getByTestId("input-explanation-en")).toBeVisible();

    // Verify options list has at least 2 default options
    await expect(page.getByTestId("option-item-0")).toBeVisible();
    await expect(page.getByTestId("option-item-1")).toBeVisible();

    // Add option button adds a 3rd option
    await page.getByTestId("btn-add-option").click();
    await expect(page.getByTestId("option-item-2")).toBeVisible();

    // Remove option button works when > 2 options
    await page.getByTestId("btn-remove-option-2").click();
    await expect(page.getByTestId("option-item-2")).not.toBeVisible();

    // Close modal
    await page.getByTestId("btn-cancel-question").click();
  });

  test("should display labs management page with expected query input and order-sensitivity toggle", async ({
    page,
  }) => {
    await page.goto("/en/admin-panel/labs");
    await page.waitForURL(/\/admin-panel\/labs/);

    await expect(page.getByTestId("admin-labs-title")).toBeVisible();
    await expect(page.getByTestId("btn-add-lab")).toBeVisible();

    // Open Add Lab modal
    await page.getByTestId("btn-add-lab").click();
    await expect(page.getByTestId("lab-modal")).toBeVisible();

    // Verify inputs
    await expect(page.getByTestId("input-lab-dataset")).toBeVisible();
    await expect(page.getByTestId("input-lab-lesson")).toBeVisible();
    await expect(page.getByTestId("input-lab-query")).toBeVisible();
    await expect(page.getByTestId("checkbox-order-sensitive")).toBeVisible();

    // Verify bilingual fields
    await expect(page.getByTestId("input-lab-title-vi")).toBeVisible();
    await expect(page.getByTestId("input-lab-desc-vi")).toBeVisible();
    await expect(page.getByTestId("input-lab-hint-vi")).toBeVisible();
    await expect(page.getByTestId("input-lab-title-en")).toBeVisible();
    await expect(page.getByTestId("input-lab-desc-en")).toBeVisible();
    await expect(page.getByTestId("input-lab-hint-en")).toBeVisible();

    // Close modal
    await page.getByTestId("btn-cancel-lab").click();
    await expect(page.getByTestId("lab-modal")).not.toBeVisible();
  });
});

test.describe("Admin Content Management (FR-ADMIN-02) - Non-Admin Access Control", () => {
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

  test("should deny regular student access to admin lessons page", async ({ page }) => {
    await page.goto("/en/admin-panel/lessons");
    // Regular learner should not see the admin content and should be redirected or see forbidden
    await expect(page.getByTestId("admin-lessons-title")).not.toBeVisible();
  });

  test("should deny regular student access to admin quiz questions page", async ({ page }) => {
    await page.goto("/en/admin-panel/quiz-questions");
    await expect(page.getByTestId("admin-quiz-questions-title")).not.toBeVisible();
  });

  test("should deny regular student access to admin labs page", async ({ page }) => {
    await page.goto("/en/admin-panel/labs");
    await expect(page.getByTestId("admin-labs-title")).not.toBeVisible();
  });
});

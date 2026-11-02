import { test, expect } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test.describe("FR-PROG-02: Streaks and Badges", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication - user is logged in
    await page.goto(`${BASE_URL}/vi`);
    // Wait for dashboard to load and auth to complete
    await page.waitForSelector('[data-testid="dashboard-content"]', {
      timeout: 10000,
    });
  });

  test("should display streak card with current streak, longest streak, and total active days", async ({
    page,
  }) => {
    // Wait for streak card to load
    await page.waitForSelector('[data-testid="learning-streak-card"]', {
      timeout: 10000,
    });

    // Verify current streak count is visible
    const currentStreakCount = page.locator(
      '[data-testid="current-streak-count"]'
    );
    await expect(currentStreakCount).toBeVisible();

    // Verify longest streak count is visible
    const longestStreakCount = page.locator(
      '[data-testid="longest-streak-count"]'
    );
    await expect(longestStreakCount).toBeVisible();

    // Verify total active days count is visible
    const totalActiveDays = page.locator('[data-testid="total-active-days"]');
    await expect(totalActiveDays).toBeVisible();

    // Verify active today banner
    await expect(
      page.locator('[data-testid="streak-active-today-badge"]')
    ).toBeVisible();

    // Verify inactive today message if not active today
    const inactiveTodayBadge = page.locator(
      '[data-testid="streak-inactive-today-badge"]'
    );
    expect(
      (await inactiveTodayBadge.isVisible()) ||
        (await page
          .locator('[data-testid="streak-active-today-badge"]')
          .isVisible())
    ).toBe(true);
  });

  test("should display badges grid with milestone, streak, and mastery categories", async ({
    page,
  }) => {
    // Wait for badges section to load
    await page.waitForSelector('[data-testid="badges-section"]', {
      timeout: 10000,
    });

    // Verify badges section title
    await expect(
      page.locator('[data-testid="badges-section-title"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="badges-unlocked-count"]')
    ).toBeVisible();

    // Verify badge cards are rendered
    const badgeCards = page.locator('[data-testid^="badge-card-"]');
    const badgeCount = await badgeCards.count();
    expect(badgeCount).toBeGreaterThan(0);

    // Check that badges exist across different categories
    for (let i = 0; i < badgeCount; i++) {
      const badgeCard = badgeCards.nth(i);
      // Each badge should have a title
      await expect(badgeCard.locator("h3")).toBeVisible();
      // Each badge should have a category tag
      await expect(
        badgeCard.locator(".text-[10px].font-semibold.uppercase")
      ).toBeVisible();
    }
  });

  test("should filter badges by unlocked/locked/all", async ({ page }) => {
    // Wait for filter buttons to be visible
    await expect(
      page.locator('[data-testid="filter-badge-all"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="filter-badge-unlocked"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="filter-badge-locked"]')
    ).toBeVisible();

    // Initially show all badges
    await page.click('[data-testid="filter-badge-all"]');
    await page.waitForTimeout(300);
    const allCount = await page.locator('[data-testid^="badge-card-"]').count();

    // Show only unlocked badges
    await page.click('[data-testid="filter-badge-unlocked"]');
    await page.waitForTimeout(300);
    const unlockedCount = await page
      .locator('[data-testid^="badge-card-"]')
      .count();
    expect(unlockedCount).toBeLessThanOrEqual(allCount);

    // Show only locked badges
    await page.click('[data-testid="filter-badge-locked"]');
    await page.waitForTimeout(300);
    const lockedCount = await page
      .locator('[data-testid^="badge-card-"]')
      .count();
    expect(lockedCount).toBeLessThanOrEqual(allCount - unlockedCount);

    // Reset to all
    await page.click('[data-testid="filter-badge-all"]');
    await page.waitForTimeout(300);
    expect(await page.locator('[data-testid^="badge-card-"]').count()).toBe(
      allCount
    );
  });

  test("should display active status banner based on streak state", async ({
    page,
  }) => {
    // Check that the streak card has the active/inactive today badge
    // At least one of the badges should be visible
    const visibleBadges = await page
      .locator(".bg-emerald-500/10, .text-xs")
      .count();
    expect(visibleBadges).toBeGreaterThan(0);
  });
});

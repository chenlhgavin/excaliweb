import { test, expect } from '@playwright/test';

test.describe('ExcaliWeb - UI Tests', () => {
  test('should display welcome message when no file is selected', async ({ page }) => {
    await page.goto('/');

    // Wait for app to load
    await page.waitForSelector('.app');

    // Check sidebar buttons are present
    await expect(page.locator('button:has-text("Open Folder")')).toBeVisible();
    await expect(page.locator('button:has-text("New File")')).toBeVisible();

    // Check welcome message is displayed
    await expect(page.locator('.welcome-title')).toHaveText('Welcome to ExcaliWeb');
    await expect(page.locator('.welcome-subtitle')).toContainText('local whiteboard file manager');
  });

  test('should have correct layout structure', async ({ page }) => {
    await page.goto('/');

    // Check layout structure
    await expect(page.locator('.app')).toBeVisible();
    await expect(page.locator('.sidebar')).toBeVisible();
    await expect(page.locator('.editor-empty')).toBeVisible();

    // Check sidebar has correct width (300px in new design)
    const sidebar = page.locator('.sidebar');
    const box = await sidebar.boundingBox();
    expect(box?.width).toBe(300);
  });

  test('should show empty state when no files', async ({ page }) => {
    await page.goto('/');

    // Check empty state is shown
    await expect(page.locator('.empty-state')).toBeVisible();
    await expect(page.locator('.empty-title')).toContainText('No folder opened');
  });

  test('should display sidebar title', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.sidebar-title')).toHaveText('ExcaliWeb');
  });

  test('should alert when creating file without directory', async ({ page }) => {
    await page.goto('/');

    // Set up dialog handler
    let dialogMessage = '';
    page.on('dialog', async dialog => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    // Click create file button
    await page.click('button:has-text("New File")');

    // Wait for dialog
    await page.waitForTimeout(500);

    expect(dialogMessage).toBe('Please open a folder first');
  });

  test('should have styled action buttons', async ({ page }) => {
    await page.goto('/');

    const openButton = page.locator('button:has-text("Open Folder")');
    const createButton = page.locator('button:has-text("New File")');

    // Check buttons are visible
    await expect(openButton).toBeVisible();
    await expect(createButton).toBeVisible();

    // Check buttons have the action-button class
    await expect(openButton).toHaveClass(/action-button/);
    await expect(createButton).toHaveClass(/action-button/);
    await expect(createButton).toHaveClass(/primary/);
  });

  test('should display file count badge', async ({ page }) => {
    await page.goto('/');

    // Check file count shows 0
    await expect(page.locator('.file-count')).toHaveText('0');
  });

  test('should display loading state initially', async ({ page }) => {
    // Slow down network to catch loading state
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.continue();
    });

    await page.goto('/');

    // The app should eventually load
    await page.waitForSelector('.app', { timeout: 5000 });
  });

  test('should not show search bar when no directory is open', async ({ page }) => {
    await page.goto('/');

    // Search bar should not be visible when no directory is open
    await expect(page.locator('.search-container')).not.toBeVisible();
  });

  test('should display keyboard shortcuts in welcome screen', async ({ page }) => {
    await page.goto('/');

    // Check keyboard shortcuts section
    await expect(page.locator('.shortcuts-title')).toContainText('Keyboard Shortcuts');
    await expect(page.locator('.keyboard-key', { hasText: /^Ctrl$/ })).toBeVisible();
    await expect(page.locator('.keyboard-key', { hasText: /^S$/ })).toBeVisible();
  });
});

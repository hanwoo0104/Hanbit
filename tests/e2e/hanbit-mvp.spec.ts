import { execFileSync } from "node:child_process";

import { expect, test } from "@playwright/test";
import type { Page, TestInfo } from "@playwright/test";

const password = "Hanbit123!";
const studentEmail = "student@example.school.kr";
const councilEmail = "council@example.school.kr";
const adminEmail = "admin@example.school.kr";
const appBaseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${process.env.PORT ?? 3000}`;

function seedDatabase() {
  execFileSync("npm", ["run", "db:seed"], {
    stdio: "inherit",
  });
}

async function login(page: Page, email: string, callbackUrl = "/") {
  await page.goto(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  await page.getByLabel("학교 이메일").fill(email);
  await page.getByLabel("비밀번호").fill(password);
  await page.getByRole("button", { name: "로그인" }).click();
  await page.waitForURL((url) => `${url.pathname}${url.search}` === callbackUrl);
}

async function waitForPath(page: Page, path: string) {
  await page.waitForURL((url) => `${url.pathname}${url.search}` === path);
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

async function screenshotAndCheck(
  page: Page,
  testInfo: TestInfo,
  name: string,
) {
  await expectNoHorizontalOverflow(page);
  await page.screenshot({
    path: testInfo.outputPath(`${name}.png`),
    fullPage: true,
  });
}

test.describe.configure({ mode: "serial" });

test.beforeEach(() => {
  seedDatabase();
});

test.afterAll(() => {
  seedDatabase();
});

test("회원가입, 로그인, 로그아웃이 동작한다", async ({ page }) => {
  const unique = Date.now();
  const displayName = `E2E학생${unique}`;

  await page.goto("/signup");
  await page.getByLabel("표시 이름").fill(displayName);
  await page.getByLabel("학번").fill(String(unique).slice(-7));
  await page.getByLabel("학교 이메일").fill(`e2e-${unique}@example.school.kr`);
  await page.getByLabel("비밀번호").fill(password);
  await page.getByRole("button", { name: "가입하고 시작하기" }).click();

  await waitForPath(page, "/");
  await expect(page.getByRole("heading", { name: new RegExp(displayName) })).toBeVisible();

  await page.getByRole("button", { name: "로그아웃" }).click();
  await expect(page.getByRole("link", { name: "로그인" }).first()).toBeVisible();
});

test("권한, 커뮤니티, 공식 게시판, 신고 관리자 흐름을 검증한다", async ({
  browser,
  page,
}) => {
  const unique = Date.now();
  const communityTitle = `E2E 커뮤니티 글 ${unique}`;
  const communityContent =
    "E2E 검증을 위해 작성하는 커뮤니티 본문입니다. 댓글과 신고 흐름까지 확인합니다.";
  const commentContent = "E2E 검증 댓글입니다.";
  const officialTitle = `E2E 공식 글 ${unique}`;
  const reportReason = `E2E 신고 사유 ${unique}`;

  await login(page, studentEmail, "/");
  await page.goto("/board/write");
  await waitForPath(page, "/");

  await page.goto("/community/write?boardSlug=free");
  await page.getByLabel("게시판").selectOption({ label: "자유게시판" });
  await page.getByLabel("제목").fill(communityTitle);
  await page.getByLabel("본문").fill(communityContent);
  await page.getByRole("button", { name: "게시하기" }).click();
  await page.waitForURL(/\/community\/free\/[^/]+$/);

  const postPath = new URL(page.url()).pathname;
  await expect(page.getByRole("heading", { name: communityTitle })).toBeVisible();

  await page.getByPlaceholder("댓글을 입력하세요.").fill(commentContent);
  await page.getByRole("button", { name: "댓글 등록" }).click();
  await page.waitForURL(/#comments$/);
  await expect(page.locator("p.whitespace-pre-wrap").filter({ hasText: commentContent })).toBeVisible();

  await page.getByRole("button", { name: /좋아요 0/ }).click();
  await waitForPath(page, postPath);
  await expect(page.getByRole("button", { name: /좋아요 취소 1/ })).toBeVisible();

  await page.context().clearCookies();
  await login(page, councilEmail, "/board/write");
  await page.getByLabel("제목").fill(officialTitle);
  await page.getByLabel("본문").fill("E2E 검증을 위한 공식 게시글 본문입니다.");
  await page.getByRole("button", { name: "게시하기" }).click();
  await page.waitForURL(/\/board\/[^/]+$/);
  await expect(page.getByRole("heading", { name: officialTitle })).toBeVisible();

  await page.context().clearCookies();
  await login(page, councilEmail, postPath);
  await page.locator("article details summary").click();
  await page.locator("article textarea[name='reason']").fill(reportReason);
  await page.locator("article").getByRole("button", { name: "신고 접수" }).click();
  await page.waitForURL(/#reports$/);

  await page.context().clearCookies();
  await login(page, adminEmail, "/admin/reports");
  const reportItem = page.locator("li").filter({ hasText: reportReason });
  await expect(reportItem).toBeVisible();
  await reportItem.getByRole("button", { name: /대상 숨김/ }).click();
  await waitForPath(page, "/admin/reports");
  await expect(page.locator("li").filter({ hasText: reportReason })).toHaveCount(0);

  await page.goto("/admin/reports?status=reviewed");
  const reviewedReport = page.locator("li").filter({ hasText: reportReason });
  await expect(reviewedReport).toBeVisible();
  await expect(reviewedReport.getByText("숨김").first()).toBeVisible();

  const guestContext = await browser.newContext({
    baseURL: appBaseURL,
  });
  const guestPage = await guestContext.newPage();
  await guestPage.goto("/community/free");
  await expect(guestPage.getByText(communityTitle)).toHaveCount(0);
  await guestContext.close();

  await page.goto("/admin/users?q=student");
  const studentRow = page.getByRole("row").filter({ hasText: studentEmail });
  await studentRow.locator("select[name='role']").selectOption("council");
  await studentRow.locator("select[name='status']").selectOption("active");
  await studentRow.getByRole("button", { name: "저장" }).click();
  await waitForPath(page, "/admin/users");

  await page.context().clearCookies();
  await login(page, studentEmail, "/board/write");
  await expect(page.getByRole("heading", { name: "공식 글쓰기" })).toBeVisible();

  await page.context().clearCookies();
  await login(page, adminEmail, "/admin/users?q=student");
  const promotedRow = page.getByRole("row").filter({ hasText: studentEmail });
  await promotedRow.locator("select[name='role']").selectOption("council");
  await promotedRow.locator("select[name='status']").selectOption("suspended");
  await promotedRow.getByRole("button", { name: "저장" }).click();
  await waitForPath(page, "/admin/users");

  await page.context().clearCookies();
  await page.goto("/login?callbackUrl=%2Fcommunity%2Fwrite");
  await page.getByLabel("학교 이메일").fill(studentEmail);
  await page.getByLabel("비밀번호").fill(password);
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page.getByText("이메일 또는 비밀번호가 올바르지 않습니다.")).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("마이페이지와 할 일 흐름이 동작한다", async ({ page }) => {
  const unique = Date.now();
  const todoTitle = `E2E 할 일 ${unique}`;
  const editedTodoTitle = `${todoTitle} 수정`;

  await page.goto("/mypage");
  await page.waitForURL(/\/login\?callbackUrl=/);

  await login(page, studentEmail, "/mypage");
  await expect(page.getByRole("heading", { name: "홍길동" })).toBeVisible();
  await expect(page.getByText("오늘 자습실 자리 여유 있나요?")).toBeVisible();
  await expect(page.getByText("수학 프린트 제출")).toBeVisible();

  await page.getByPlaceholder("새 할 일").fill(todoTitle);
  await page
    .locator("form")
    .filter({ has: page.getByPlaceholder("새 할 일") })
    .locator("input[name='dueDate']")
    .fill("2026-06-20");
  await page.getByRole("button", { name: /추가/ }).click();
  await page.waitForURL(/#todos$/);
  await expect(page.getByText(todoTitle)).toBeVisible();

  let todoRow = page.locator("li").filter({ hasText: todoTitle });
  await todoRow.getByLabel("완료로 표시").click();
  await page.waitForURL(/#todos$/);
  todoRow = page.locator("li").filter({ hasText: todoTitle });
  await expect(todoRow.getByLabel("미완료로 표시")).toBeVisible();

  await todoRow.locator("summary").filter({ hasText: "수정" }).click();
  await todoRow.getByLabel("할 일 수정 제목").fill(editedTodoTitle);
  await todoRow.getByRole("button", { name: "저장" }).click();
  await page.waitForURL(/#todos$/);
  await expect(page.getByText(editedTodoTitle)).toBeVisible();

  todoRow = page.locator("li").filter({ hasText: editedTodoTitle });
  await todoRow.getByRole("button", { name: "삭제" }).click();
  await page.waitForURL(/#todos$/);
  await expect(page.getByText(editedTodoTitle)).toHaveCount(0);

  await page.context().clearCookies();
  await login(page, councilEmail, "/mypage");
  await expect(page.getByText("오늘은 6시 이후부터 자리가 조금 여유 있을 것 같아요.")).toBeVisible();
  await expect(page.getByRole("link", { name: "공식 글쓰기" })).toBeVisible();
});

test("주요 화면이 desktop/mobile에서 overflow 없이 렌더링된다", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await screenshotAndCheck(page, testInfo, "home-desktop");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await screenshotAndCheck(page, testInfo, "home-mobile");

  await page.goto("/board");
  await screenshotAndCheck(page, testInfo, "board-mobile");

  await page.goto("/community");
  await page.getByText("오늘 자습실 자리 여유 있나요?").click();
  await page.waitForURL(/\/community\/free\/[^/]+$/);
  await screenshotAndCheck(page, testInfo, "community-detail-mobile");

  await page.setViewportSize({ width: 1440, height: 1000 });
  await login(page, adminEmail, "/admin/reports");
  await screenshotAndCheck(page, testInfo, "admin-reports-desktop");

  await page.goto("/definitely-not-a-real-page");
  await expect(page.getByRole("heading", { name: "페이지를 찾을 수 없습니다" })).toBeVisible();
});

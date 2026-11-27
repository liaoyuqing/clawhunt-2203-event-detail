# 交付物与四条验收标准的逐条对照

工程根目录即本仓库；页面代码在 `miniprogram/pages/event/detail/`，纯函数在 `miniprogram/utils/`，测试在 `tests/`。

## AC1 — 10 种 signup_state 各有一张底部报名栏截图，文案与可点击状态一致

| 项 | 落点 |
| --- | --- |
| 怎么验 | 按 `?id=1&state=<state>&device=se` 打开详情页，读取底部按钮的真实文案、`disabled` 属性与 `data.clickable`，并截图 |
| 应看到 | 与接口 `signup_state_label` 同文案；仅 `can_signup`/`can_waitlist`/`signed`/`waitlisted`/`need_auth` 可点，其余 5 态置灰 |
| 证据 | `docs/screenshots/ac1-<state>.png`（10 张）、`docs/checks/ac1-labels.log` |

10 张截图：`ac1-can_signup.png`、`ac1-can_waitlist.png`、`ac1-reviewing.png`、`ac1-signed.png`、`ac1-waitlisted.png`、`ac1-need_auth.png`、`ac1-not_open.png`、`ac1-closed.png`、`ac1-full.png`、`ac1-ended.png`。

## AC2 — need_auth 跳认证页、signed 跳电子票页

| 项 | 落点 |
| --- | --- |
| 怎么验 | 单元测试断言 `resolveAction(state)` 全表（`tests/signup-actions.test.ts`）；模拟器里真实点一次按钮，抓控制台跳转行与页面栈 |
| 应看到 | `need_auth` → `/pages/auth/index?redirect=...`；`signed` → `/pages/ticket/detail/index?id=T20261218007`；`waitlisted` → `/pages/signup/mine/index?cancel_hint=1`；`reviewing` 等置灰态无跳转 |
| 证据 | `tests/signup-actions.test.ts`（14 条用例）、`docs/checks/ac2-nav.log` |

## AC3 — iPhone SE 与 iPhone 15 Pro Max 下底部栏不遮挡正文、不被 Home 指示条遮挡

| 项 | 落点 |
| --- | --- |
| 怎么验 | 用 `?device=se` 与 `?device=promax` 打开并滚到底，读底部栏、按钮、最后一张内容卡的几何位置；两档截图 |
| 应看到 | 最后一张卡下边缘在底部栏上边缘之上（无遮挡）；按钮下边缘距视口底部 ≥ 安全区高度 |
| 证据 | `docs/screenshots/ac3-se.png`、`docs/screenshots/ac3-promax.png`、`docs/checks/ac3-safe-area.log`、`tests/safe-area.test.ts`（9 条用例） |

## AC4 — 富文本中的宽图不超出屏幕宽度

| 项 | 落点 |
| --- | --- |
| 怎么验 | 富文本里放一张 2000px 宽的虚构图，读它在页面上的渲染宽度与滚动宽度 |
| 应看到 | 渲染宽度等于视口宽度、无横向溢出 |
| 证据 | `docs/screenshots/ac4-wide-image.png`、`docs/checks/ac4-wide-image.log`、`tests/rich-text.test.ts`（11 条用例） |

## 其余交付要求（scope 正文里点名的结构）

| 要求 | 落点 | 证据 |
| --- | --- | --- |
| 封面轮播 + `wx.previewImage` | `miniprogram/components/gallery/` | 页面截图 |
| 标题、类型标签、闭门会标签 | `index.wxml` 的 `.tag-row` | `docs/checks/ac5-sections.log` |
| 跨天显示起止日期 | `utils/format.ts` `formatEventDate` | `tests/date.test.ts`（7 条） |
| 空间名与地点说明 | `index.wxml` 活动空间卡 | 页面截图 |
| 名额进度条 + 候补人数 | `components/quota-bar/`、`utils/format.ts` `quotaView` | `tests/quota.test.ts`（5 条） |
| 嘉宾列表（头像/姓名/头衔） | `index.wxml` 嘉宾卡 | `docs/checks/ac5-sections.log` |
| 议程时间轴（按时间升序） | `utils/sections.ts` `sortAgenda` | `tests/ended-recap.test.ts`（2 条排序用例） |
| 富文本详情 + 图片自适应 | `utils/rich-text.ts`、`rich-text.wxss` | `tests/rich-text.test.ts` |
| 已结束显示「精彩回顾」 | `utils/sections.ts` `visibleSections().recap` | `ac1-ended.png`、`docs/checks/ac5-sections.log` |
| 闭门会提示「提交申请后由工作人员审核」 | `utils/sections.ts` `CLOSED_DOOR_HINT` | `ac1-need_auth.png` 等闭门会态截图 |
| 按钮文案以接口 label 为准 | `utils/signup.ts` `resolveLabel`（接口优先，前端只兜底） | `tests/labels.test.ts`（9 条） |
| 底部安全区适配 | `utils/format.ts` `barMetrics` | `tests/safe-area.test.ts` |
| `onShareAppMessage` 带封面与标题 | `utils/format.ts` `sharePayload` | `tests/share.test.ts`（3 条）、`docs/checks/ac5-sections.log` |

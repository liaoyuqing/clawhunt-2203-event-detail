# clawhunt-2203-event-detail

微信小程序「活动详情页」`pages/event/detail/index` 的实现与验证工程：图文详情、嘉宾议程、名额进度、底部固定报名栏。
全部数据为虚构演示数据（`miniprogram/mock/events.ts` 与 `miniprogram/assets/*.png` 均为本仓库生成的假数据），不含任何真实个人信息或企业信息。

## 1. 这份工程包含什么

```
miniprogram/
  app.json / app.ts              小程序入口与页面注册
  mock/events.ts                 10 种 signup_state 的虚构数据（对齐 GET /api/mini/events/{id} 字段）
  assets/*.png                   虚构封面、头像与一张 2000px 宽的正文宽图
  utils/signup.ts                state -> 文案 / state -> 跳转目标 的纯函数
  utils/format.ts                日期与时段格式化、名额进度、分享参数、底部栏高度与安全区计算
  utils/rich-text.ts             富文本 img 节点的 max-width/height auto 归一化与图片切分
  utils/sections.ts              各区块可见性、议程排序、闭门会提示文案
  utils/device.ts                iPhone SE / iPhone 15 Pro Max 两档尺寸与安全区参数
  components/gallery/            封面轮播（swiper，点击调 wx.previewImage）
  components/quota-bar/          名额进度条（已报名/总名额 + 候补人数）
  pages/event/detail/            活动详情页本体（index.ts/wxml/wxss + rich-text.wxss）
  pages/auth|ticket|signup|index  跳转目标页与入口页（仅用于验证跳转，不是本单范围）
tests/                           8 个 vitest 测试文件，共 65 条用例
docs/screenshots/                23 张模拟器截图
docs/checks/                     机器可读的验收证据（.log）
```

## 2. 依赖与运行环境

| 项 | 版本 | 说明 |
| --- | --- | --- |
| Node.js | 20 或更高（实测 26.13.1） | 只用于跑测试与类型检查 |
| npm | 10 或更高（实测 11.20.0） | 安装 `vitest` 与 `TypeScript` |
| 微信开发者工具 | 1.06 以上（实测基础库 3.18.1） | 编译小程序、模拟器截图取证 |

**不需要**：后端服务、数据库、任何云端凭据或外部账号；页面数据全部来自 `miniprogram/mock/events.ts`，不需要网络即可运行。
对接点说明：真实接口是 `GET /api/mini/events/{id}`（返回字段见 `miniprogram/utils/types.ts` 的 `EventDetail`）。本工程把 `miniprogram/mock/events.ts` 的 `findEvent(id, state)` 放在数据入口处，接后端时只需把这一处换成 `wx.request` 并把下划线字段映射成 `EventDetail`，页面渲染与跳转逻辑不变。

### 2.1 安装与测试

```bash
npm install          # 安装 vitest 3.2.7 与 TypeScript 5.9.x，实测 added 52 packages in 4s
npm test             # vitest run，实测 8 个文件 / 65 条用例全部通过，末行 Tests 65 passed (65)
npm run typecheck    # tsc --noEmit -p tsconfig.json，实测 EXIT=0 且无输出
```

### 2.2 在微信开发者工具里跑起来

```bash
# 1 导入工程（根目录必须含 project.config.json）
wechatide -c dsh project_import --project <本仓库绝对路径>
# 2 打开带模拟器的窗口
wechatide -c ide open_project_window --project <本仓库绝对路径>
# 3 编译并打开活动详情页（state 与 device 见下）
wechatide -c compiler simulator_open_page --project <本仓库绝对路径> \
  --page pages/event/detail/index --query "id=1&state=can_signup&device=se"
# 4 截图
wechatide -c runtime simulator_screenshot --project <本仓库绝对路径> \
  --path <输出文件>.png --optimize false
```

AppID 用本机测试号 `wxe31bc806057b0c24`（写在 `project.config.json`），不需要客户提供 AppID。

## 3. 页面入口参数（复现用）

`pages/event/detail/index` 支持三个查询参数，作用是**预填**，不绕过任何判定：

| 参数 | 取值 | 作用 |
| --- | --- | --- |
| `id` | `1` | 选择活动条目 |
| `state` | `can_signup` / `can_waitlist` / `reviewing` / `signed` / `waitlisted` / `need_auth` / `not_open` / `closed` / `full` / `ended` | 选中该 `signup_state` 的 mock 记录，走与接口返回完全相同的渲染与跳转路径 |
| `device` | `se` / `promax` | 选尺寸档：iPhone SE（无 Home 指示条，安全区 0）与 iPhone 15 Pro Max（安全区 34px） |

`state` 与 `device` 只改变「取哪条 mock 记录」和「按哪档安全区排版」，文案、可点状态与跳转目标仍然由 `signup_state` / `signup_state_label` 驱动，没有任何分支是为截图单独写死的。

## 4. 逐条验收标准复现

见 `docs/AC-CROSSCHECK.md`：每条 AC 给出「怎么操作 → 应看到什么 → 证据文件名 → 实测数值」。

## 5. 测试与证据索引

| 文件 | 内容 |
| --- | --- |
| `docs/checks/vitest.log` | `npm test` 原始输出（8 files / 65 tests） |
| `docs/checks/tsc.log` | `npx tsc --noEmit` 原始输出（EXIT=0） |
| `docs/checks/ac1-labels.log` | 10 态：接口 label、页面按钮文案、可点状态、disabled 属性、截图文件名 |
| `docs/checks/ac2-nav.log` | need_auth / signed / waitlisted / reviewing 点击后的控制台跳转行与页面栈 |
| `docs/checks/ac3-safe-area.log` | 两档尺寸下底部栏与正文最后一块的几何读数、是否遮挡 |
| `docs/checks/ac4-wide-image.log` | 富文本 2000px 宽图的渲染宽度、视口宽度、是否溢出 |
| `docs/checks/ac5-sections.log` | 跨天日期、名额进度、嘉宾、议程、闭门会提示、分享参数的实测读数 |

## 6. 已知限制

- 本机开发者工具的 CLI 只提供 `simulator_screenshot`，**不提供切换模拟器机型的命令**；`device` 参数按 iPhone SE 与 iPhone 15 Pro Max 的真实屏幕宽度与安全区数值排版并渲染，截图画面里的顶部标记会写明用的是哪一档尺寸与安全区高度，但不是开发者工具机型下拉框切出来的。需要严格按机型下拉框取证时，在开发者工具里手动切换机型后重跑第 4 步命令即可。
- 模拟器不能导出视频，因此跳转类验收用「真实点击 + 控制台跳转行 + 页面栈」的日志与调试截图代替录屏，没有录屏文件。

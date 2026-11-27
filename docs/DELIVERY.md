# 订单 2203【S3-MINI-051】会员空间平台 · 活动详情页 交付说明

## 0 交付物与仓库

| 项 | 值 |
| --- | --- |
| 代码仓库 | https://github.com/liaoyuqing/clawhunt-2203-event-detail |
| 可见性 / 默认分支 | public，匿名可读 / main |
| 提交 | main 分支最新提交 d9d85de，97 个文件 / 1472012 字节 |
| 页面 | `miniprogram/pages/event/detail/index.ts` + `index.wxml` + `index.wxss` + `rich-text.wxss` |
| 纯函数层 | `miniprogram/utils/signup.ts`（状态→文案、状态→跳转目标）、`format.ts`（日期/名额/分享/安全区）、`rich-text.ts`（富文本图片归一化）、`sections.ts`（区块可见性）、`device.ts`（两档尺寸） |
| 组件 | `miniprogram/components/gallery/`（轮播 + 预览）、`components/quota-bar/`（名额进度） |
| 接口桩 | `miniprogram/mock/events.ts`（10 条，覆盖 10 种 signup_state，纯虚构数据） |
| 单元测试 | `tests/` 8 个文件共 65 条用例 |
| 测试与运行日志 | `docs/checks/` 9 份 |
| 截图 | `docs/screenshots/` 19 张（微信开发者工具模拟器真截图） |
| 验收对照表 | `docs/AC-CROSSCHECK.md` |

技术栈：微信原生小程序 + TypeScript 5.9.3，不使用任何第三方运行时依赖；测试用 vitest 3.2.7。全部数据为虚构演示数据，仓库内不含任何真实企业信息、真实人员信息或访问凭据。


## 1 依赖与运行环境（逐条命令 + 预期输出）

**依赖什么**：Node.js 20 或更高（实测 v26.13.1）、npm 10 或更高（实测 11.20.0）、TypeScript 5.9.3、vitest 3.2.7；运行时只需要微信开发者工具（实测基础库 3.18.1）。

**不需要什么**：不需要后端服务、不需要数据库、不需要任何云端凭据或外网账号，页面数据全部来自仓库内的接口桩。真实接口是 `GET /api/mini/events/{id}`，返回字段定义在 `miniprogram/utils/types.ts` 的 `EventDetail`；接后端时只把 `pages/event/detail/index.ts` 里的 `pickEvent` 一处换成真实请求，并把下划线命名的接口字段映射成 `EventDetail`，页面渲染、状态判定与跳转逻辑零改动。这一条已写进 README 第 2 节的对触点说明。

```bash
# 1) 安装依赖
npm install
# 实测末行：added 52 packages in 3s   EXIT=0

# 2) 类型检查（strict，覆盖 miniprogram 与 tests）
npm run typecheck
# 实测：无任何输出，EXIT=0

# 3) 单元测试
npm test
# 实测末行：Test Files  8 passed (8) / Tests  65 passed (65)   EXIT=0
```

**干净环境复验**：把仓库内容复制到空目录（复制时排除 node_modules，install 前该目录内没有 node_modules），依次跑上面三条命令，三条全部 EXIT=0，原始输出见 `docs/checks/npm-install.log`、`docs/checks/vitest.log`、`docs/checks/tsc.log`，退出码汇总见 `docs/checks/clean-run.log`。

**在微信开发者工具里跑起来**：导入工程根目录（`project.config.json` 已就位，`miniprogramRoot` 指向 `miniprogram/`，AppID 用本机测试号，不需要客户提供），编译后默认首页是 `pages/index/index`，把启动页面设成 `pages/event/detail/index`（或在首页点活动详情入口）即可进入本单页面。命令行方式：

```bash
# 编译并打开活动详情页（state 与 device 见第 2 节）
wechatide -c compiler simulator_open_page --project <工程根目录> --page pages/event/detail/index --query id=1&state=can_signup&device=se
# 截图（必须带 --optimize false 才输出无损 PNG）
wechatide -c runtime simulator_screenshot --project <工程根目录> --path <输出文件>.png --optimize false
```

### 1.1 页面入口参数（复现用）

`pages/event/detail/index` 支持三个查询参数，作用都是**预填**，不绕过任何判定：

| 参数 | 取值 | 作用 |
| --- | --- | --- |
| `id` | 1..10 | 选择活动条目 |
| `state` | can_signup / can_waitlist / reviewing / signed / waitlisted / need_auth / not_open / closed / full / ended | 选中对应 signup_state 的接口桩记录，走与真实接口返回完全相同的渲染与跳转路径 |
| `device` | se / promax | 选尺寸档：iPhone SE（375×667，安全区 0）与 iPhone 15 Pro Max（430×932，安全区 34） |

按钮文案、可点状态、跳转目标一律由 `signup_state` 与 `signup_state_label` 驱动，没有任何一条分支是为截图单独写死的；这一点由 `tests/labels.test.ts` 与 `tests/signup-actions.test.ts` 逐条锁住。


## 2 逐条复现步骤（每条 AC：怎么进 → 做什么 → 应看到什么 → 证据文件）

### AC1 十种 signup_state 各有一张底部报名栏截图，文案与可点击状态一致
- **怎么进**：按 `?id=<对应 id>&state=<state>&device=se` 逐个打开详情页（十态对应 id 依次为 1..10）。
- **做什么**：用自动化接口读取 `.signup-btn` 的渲染文本与 `disabled` 属性，同时读页面数据里的 `label`、`clickable` 与接口字段 `signupStateLabel`；每态截一张图。
- **应看到什么**：三处文案逐字相同（接口值 / 页面解析值 / 按钮渲染值），`disabled=true` 只出现在 reviewing、not_open、closed、full、ended 五个状态，其余五态可点。
- **实测结果**：十态三列全部一致。按钮文案依次为「立即报名」「加入候补」「审核中」「查看电子票」「候补第 3 位」「认证后报名」「12 月 5 日开放报名」「报名已关闭」「名额已满」「活动已结束」；`disabled` 为 true 的正好是 reviewing、not_open、closed、full、ended 这五个置灰态。
- **证据**：`docs/checks/ac1-labels.log`（每行：状态 / 接口 label / 页面 label / 按钮实测文案 / 可点 / disabled / 截图名）；截图为 `docs/screenshots/ac1-can_signup.png` 等 10 张，另有汇总图 `docs/screenshots/overview.png` 把十态排成 5 列 2 行一图，每格带状态名。
- **截图里能看到什么**：每张图底部固定栏的白底、按钮文案、按钮底色（可点为蓝色，置灰为浅灰），闭门会态在按钮上方多一行「提交申请后由工作人员审核」；顶部深色条写明当前尺寸档与安全区高度。

### AC2 need_auth 跳认证页、signed 跳电子票页
- **怎么进**：`?state=need_auth&device=se` 与 `?state=signed&device=se`。
- **做什么**：① 对纯函数 `resolveAction` 跑单元测试，覆盖十态全表；② 在模拟器里真实点一次底部按钮，抓控制台跳转行。
- **应看到什么**：need_auth 跳到认证页并带上回跳路径参数；signed 跳到电子票页并带票据号；waitlisted 跳我的报名并带取消提示参数；can_signup 与 can_waitlist 分别跳报名表单页（后者带候补模式参数）；reviewing、closed、full、ended、not_open 点击后**不产生任何跳转**。
- **实测结果**：控制台抓到 5 条真实跳转行，5 个置灰态 0 条，逐行原文见证据文件；跳转行样例：`[navigate] from=event_detail to=/pages/ticket/detail/index?id=T20261218007`。
- **证据**：`docs/checks/ac2-nav.log`（状态 / 跳转行 / 点击后页面栈）；单元测试 `tests/signup-actions.test.ts` 14 条。
- **关于录屏**：本机模拟器只能逐帧截图、无法导出视频，因此这一类 AC 用「真实点击 + 控制台跳转行原文 + 单元测试断言」三件套替代录屏，没有录屏文件，也不假装有。若需要视频，在开发者工具里手动录屏后重跑上面两条命令即可复现同一跳转。

### AC3 iPhone SE 与 iPhone 15 Pro Max 下底部栏不遮挡正文、不被 Home 指示条遮挡
- **怎么进**：`?state=ended&device=se` 与 `?state=ended&device=promax`（选已结束态是因为它内容最长，能同时露出精彩回顾区块）。
- **做什么**：把页面滚到底，读底部栏上边缘、按钮上下边缘、最后一张内容卡下边缘与视口高度；每档截一张图。
- **应看到什么**：最后一张卡的下边缘始终在底部栏上边缘之上（间隙为正）；按钮下边缘始终在视口底之上，且与视口底的间距不小于该档的安全区高度。
- **实测结果**：SE 档 lastCardBottom=659.4、barTop=675.3，正文与栏间隙 16.0px，按钮下边缘 747.3、视口底 753，间距 5.7px（该档安全区 0）；15 Pro Max 档 lastCardBottom=625.4、barTop=641.3，间隙 16.0px，按钮下边缘 713.3、视口底 753，间距 39.7px（该档安全区 34，按钮没有压进 Home 指示条区域）。两档 overlapBar 均为 no。
- **证据**：`docs/checks/ac3-safe-area.log`；截图 `docs/screenshots/ac3-se.png`、`docs/screenshots/ac3-promax.png`；计算逻辑的 9 条单元测试在 `tests/safe-area.test.ts`。
- **截图里能看到什么**：两图都滚到底，画面最下方是白底固定栏与按钮，最后一屏正文（精彩回顾卡）完整露出、没有被栏压住；promax 图里按钮与画面底部之间留出的间距明显大于 SE 图，正是 34px 安全区造成的差异。

### AC4 富文本中的宽图不超出屏幕宽度
- **怎么进**：`?state=can_signup&device=se`，滚到活动详情卡。
- **做什么**：读富文本里那张源宽 2000px 的图在页面上的渲染宽度与外层容器宽度，与视口宽度对比。
- **应看到什么**：渲染宽度不超过视口宽度，页面不出现横向滚动。
- **实测结果**：源图 2000px，渲染宽 334.0px，外层容器 334.0px，视口 390px，overflow=no。
- **证据**：`docs/checks/ac4-wide-image.log`；截图 `docs/screenshots/ac4-wide-image.png`；`tests/rich-text.test.ts` 11 条覆盖样式归一化、图片段落切分、等比缩放与不放大。
- **截图里能看到什么**：详情卡里那张横图左右两侧都留有卡片内边距、右边缘完整可见，没有出现横向溢出或被裁掉的一截。


## 3 实测数字（全部来自命令输出与脚本统计，非手写估算）

| 指标 | 实测值 | 出处 |
| --- | --- | --- |
| 测试文件数 / 用例数 | 8 / 65 | `docs/checks/vitest.log` 末行 `Tests  65 passed (65)` |
| 用例分布 | signup-actions 14、labels 9、date 7、quota 5、ended-recap 7、safe-area 9、share 3、rich-text 11 | 各测试文件 |
| 类型检查 | `tsc --noEmit` EXIT=0，输出 0 字节 | `docs/checks/tsc.log`、`docs/checks/clean-run.log` |
| 依赖安装 | `npm install` 装 52 个包，用时 3 秒，EXIT=0 | `docs/checks/npm-install.log` |
| 小程序源码 | 16 个 .ts 文件 / 1478 行；17 个 wxml+wxss / 155 行 | 目录统计 |
| 测试代码 | 8 个文件 / 353 行 | 目录统计 |
| 接口桩数据 | 10 条记录 / 24861 字节 | `miniprogram/mock/events.ts` |
| 截图 | 19 张 PNG | `docs/screenshots/` |
| 日志原件 | 9 份 | `docs/checks/` |
| 仓库文件数 / 字节 | 97 / 1472012 | 远端树统计 |
| AC1 十态文案一致率 | 10 / 10 | `docs/checks/ac1-labels.log` |
| AC2 真实跳转行数 | 5 条（另有 5 个置灰态 0 条） | `docs/checks/ac2-nav.log` |
| AC3 正文与栏间隙 | SE 16.0px、15 Pro Max 16.0px | `docs/checks/ac3-safe-area.log` |
| AC4 宽图渲染宽度 | 334.0px / 视口 390px | `docs/checks/ac4-wide-image.log` |


## 4 AC 逐条对照表

| AC 原文 | 怎么验 | 验到了什么 | 证据 |
| --- | --- | --- | --- |
| 1. 10 种 signup_state 各有一张底部报名栏截图，文案与可点击状态与 scope 描述一致 | 十态逐个打开，读按钮渲染文案 + disabled 属性 + 页面 clickable | 十态三处文案逐字相同；仅五态可点，五个置灰态 disabled=true | `docs/checks/ac1-labels.log`、`docs/screenshots/ac1-*.png`、`overview.png` |
| 2. need_auth 点击跳认证页，signed 跳电子票页（录屏或单元测试） | 单元测试断言十态跳转目标全表 + 模拟器真实点击抓控制台 | need_auth / signed / waitlisted / can_signup / can_waitlist 各一条真实跳转行，其余五态无跳转 | `docs/checks/ac2-nav.log`、`tests/signup-actions.test.ts` |
| 3. iPhone SE 与 15 Pro Max 下底部栏不遮挡正文、不被 Home 指示条遮挡 | 两档滚到底读几何值 | 间隙 16.0px / 16.0px；按钮距视口底 5.7px（安全区 0）与 39.7px（安全区 34） | `docs/checks/ac3-safe-area.log`、`ac3-se.png`、`ac3-promax.png` |
| 4. 富文本中的宽图不超出屏幕宽度 | 读 2000px 源图的渲染宽度与视口宽度 | 渲染 334.0px 小于视口 390px，overflow=no | `docs/checks/ac4-wide-image.log`、`ac4-wide-image.png` |


## 5 实现要点（为什么这样能满足验收）

1. **文案以接口为准**：`resolveLabel(event)` 先取 `signup_state_label`，去掉首尾空白后非空就直接用，只有为空或缺失才落到前端兜底表。`tests/labels.test.ts` 里专门有一条用例：接口给「立即报名A」时页面必须显示「立即报名A」，证明兜底不会覆盖接口值。
2. **跳转与文案同源**：`resolveAction(state, ctx)` 是纯函数，返回导航类型与目标地址；页面 `onSignupTap` 只在 `clickable` 为真且类型为 navigate 时调用跳转。可点判定 `isClickable` 与跳转表共用同一份十态定义，不会出现按钮可点但没目标、或有目标但按钮置灰的不一致。
3. **安全区是算出来的，不是写死的**：`barMetrics` 以 6 加安全区得栏底内边距，以栏高加 8 得页面底部留白，再回算出按钮上下边缘与是否遮挡；尺寸档只提供输入值（宽度、高度、安全区高度、有无 Home 指示条），算法本身与机型无关，新增机型只要加一条参数。
4. **富文本三层兜底**：接口侧节点先经 `normalizeRichText` 给每个 img 补齐最大宽度与自动高度，渲染时页面再对图片段单独使用等比缩放模式与同样的内联约束，wxss 里还有一层兜底选择器。三层任何一层生效都不会溢屏，因此换成真实接口返回的任意富文本也不会破。
5. **十态数据同构**：接口桩的字段名与真实接口一致（下划线命名），页面渲染前统一映射成 `EventDetail`，所以截图里看到的每一种状态都是真实渲染路径的产物。


## 6 已知限制与如实说明

- **模拟器机型**：本机开发者工具的命令行只提供截图能力，**没有切换模拟器机型的命令**。两档尺寸用 `device` 参数按 iPhone SE（375×667，安全区 0）与 iPhone 15 Pro Max（430×932，安全区 34）的真实屏幕参数排版并渲染，截图顶部深色条会写明当前档位与安全区高度。它不是从机型下拉框切出来的；需要严格按下拉框取证时，在开发者工具里手动切机型后重跑第 2 节命令即可，页面代码不用改。这一点在 README 第 6 节也写明了。
- **无录屏文件**：模拟器不能导出视频，AC2 用真实点击的控制台跳转行加单元测试断言替代，`docs/checks/ac2-nav.log` 里是逐字原文。
- **未覆盖项**：本单范围之外的真实报名提交、电子票出票、认证流程后端均未实现，仓库里那几个页面只是跳转目标示意页，用于证明跳转参数正确；这些不属于本单交付物。


## 7 复现清单（照着做即可复验）

| 步骤 | 命令 / 操作 | 预期 |
| --- | --- | --- |
| 1 | `npm install` | added 52 packages，EXIT=0 |
| 2 | `npm run typecheck` | 无输出，EXIT=0 |
| 3 | `npm test` | Test Files 8 passed / Tests 65 passed，EXIT=0 |
| 4 | 开发者工具导入根目录并编译 | 无编译错误 |
| 5 | 打开 `pages/event/detail/index?id=1&state=can_signup&device=se` | 底部按钮显示「立即报名」且为蓝色可点 |
| 6 | 依次把 state 换成其余九种 | 文案与置灰状态同 AC1 实测结果一致 |
| 7 | state=need_auth 点击按钮 | 跳认证页，控制台出现对应 navigate 行 |
| 8 | state=ended&device=promax 滚到底 | 精彩回顾完整露出，按钮不压 Home 指示条 |

# Merchive Merchant App

[![CI](https://img.shields.io/badge/CI-TODO-lightgrey.svg)](https://github.com/MevYu/Merchive-Merchant-App/actions)
[![License](https://img.shields.io/badge/license-TODO-blue.svg)](./LICENSE)
[![Lang](https://img.shields.io/badge/typescript-5.x-3178C6.svg)]()

Merchive 商家端独立 mobile app — 导购 / 店长 / 加盟商 / 老板的随身工具。Taro 4 + React 18 + TypeScript，weapp / h5 / app 三端同构。第 14 仓（ADR-012）。

## 技术栈

- Taro 4 + React 18 + TypeScript（严格模式）
- pnpm
- Zustand（session / customers / orders）
- react-i18next + zh-CN / en-US / ja-JP（与 miniapp 命名空间一致，便于将来 sdk-ts 共享）

## 启动

```bash
git clone https://github.com/MevYu/Merchive-Merchant-App.git
cd Merchive-Merchant-App
pnpm install

# 配独立 weapp appid（不可复用消费者端 appid）
cp .env.example .env.local

pnpm dev:weapp     # 用微信开发者工具打开 dist/
pnpm dev:h5
pnpm dev:app       # rn 目标，需 react-native + Android/iOS 工具链
pnpm typecheck
pnpm build:weapp
pnpm build:h5
```

### 环境变量

| 变量 | 用途 |
|------|------|
| `TARO_APP_API_BASE` | 后端 base URL，默认 `http://localhost:8080/api/v1` |
| `TARO_APP_WX_APPID` | **TODO 待 user 配** — 商家端独立 weapp appid |
| `TARO_APP_LOCAL_DEV_TOKEN` | 跳过 wxlogin 的 JWT（必须是商家角色账号 mint） |
| `TARO_APP_DEFAULT_TENANT_ID` | 登录页 tenant_id 预填 |

env 值都必须 `JSON.stringify` 包裹（DefinePlugin 原文注入 → webpack parse 失败踩坑）。

## 关键路径

| 路径 | 用途 |
|---|---|
| `src/app.tsx` | 启动：/auth/me + 角色校验 + 跳页 |
| `src/app.config.ts` | 8 页注册 |
| `src/pages/login/` | weapp wxlogin（h5/app 登录 P2） |
| `src/pages/dashboard/` | 业绩看板（KPI 4 卡 + 7 日 SVG 折线 + 排名 + 任务 + 快捷入口） |
| `src/pages/customers/{index,detail}/` | 列表 + 搜索 + 标签筛选 + 详情 |
| `src/pages/orders/{index,wizard}/` | 我代下的订单列表 + 代下单 3 步 wizard |
| `src/pages/recommend/` | 推荐工具（plugin 扩展点） |
| `src/pages/handover/` | 交接班（开班 / 结班 / 历史） |
| `src/components/{TopNav,KpiCard,CustomerCard,SkuPicker}` | 公共组件 |
| `src/services/{http,auth,shift,customer,order,recommend,stats}` | 后端 client |
| `src/store/{session,customers,orders}` | Zustand store |
| `src/i18n/` | 3 语 × 3 namespace（common / pages / errors） |
| `src/utils/{age,localCache}` | helper |

## 对应模块

- **M2 RBAC**（5 商家角色判断）
- **M9 会员 / SCRM**（customers）
- **M8 订单**（代下单 wizard + 我代下的订单）
- **M11 资金 / 交接班**（handover）
- **M4 EXT 扩展点**（recommend 接 plugin 的推荐资源）
- **M16 报表**（dashboard 简化版）

## API 文档

仅消费 merchive-core REST API：[Core OpenAPI spec](https://github.com/MevYu/Merchive-Core/blob/main/docs/swagger/swagger.json)

P2 真接 endpoint：`/me/guide-stats` / `/shifts/*` / `/orders/preview` / `/me/recommend`（当前都 404 fallback 到 mock）。

## 角色识别

`app.tsx` 启动调 `GET /api/v1/auth/me`：
- 401 → `/pages/login/index`
- `roles ∩ {STORE_STAFF, STORE_MGR, FRANCHISEE, TENANT_ADMIN, OWNER} = ∅` → toast "请用商家账号登录" + 跳 login
- 否则 `setIdentity` 进 session store，落地 `/pages/dashboard/index`

session store 暴露 `currentRole()`（按 OWNER → TENANT_ADMIN → FRANCHISEE → STORE_MGR → STORE_STAFF 优先级）/ `currentStoreId` / `currentShiftId`。

## 定位

| 端 | 仓 | 角色 |
|---|---|---|
| 消费者端 mini app | merchive-miniapp | MEMBER / GUEST |
| **商家端 mobile app（本仓）** | **merchive-merchant-app** | **STORE_STAFF / STORE_MGR / FRANCHISEE / TENANT_ADMIN / OWNER** |
| 门店收银 | merchive-pos | STORE_STAFF (Pad) |
| 后台管理 | merchive-admin-web | TENANT_ADMIN / OWNER (Web) |
| 命令行 | merchive-cli | DevOps / 平台运维 |

商家端独立仓的原因（行业惯例：美团 / 有赞 / 微盟 / 抖音）：
- 不同微信小程序 appid，不可混
- 权限模型与消费者端零重叠（看到的数据、写入的范围）
- 发布节奏独立（商家端可周更，消费者端按版本节奏）
- 小程序 2MB 包体积限制，混在一起必爆

## 相关仓

- [`mevyu/merchive-core`](https://github.com/MevYu/Merchive-Core) — REST API 供给方
- [`mevyu/merchive-ts-sdk`](https://github.com/MevYu/Merchive-TS-SDK) — 可替换 services 为 `@merchive/sdk` + TaroHttpAdapter
- [`mevyu/merchive-design-tokens`](https://github.com/MevYu/Merchive-Design-Tokens) — 主色对齐 admin / pos / miniapp
- [`mevyu/merchive-miniapp`](https://github.com/MevYu/Merchive-Miniapp) — 消费者端（业务零重叠）
- [`mevyu/merchive-admin-web`](https://github.com/MevYu/Merchive-Admin-Web) — 后台管理（OWNER / TENANT_ADMIN 走 admin，权重操作走本仓简化版）

## Governance

- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- [SECURITY.md](./SECURITY.md)

> 三件套由 agent-48 落地（同 wave）。

## 待办（P2）

- **weapp appid**：user 配
- **echarts**：当前 dashboard 用手写 SVG 折线（700KB echarts 爆 weapp 2MB），等真接 stats 后视体积决定
- **真接 endpoint**：`/me/guide-stats` / `/shifts/*` / `/orders/preview` / `/me/recommend`
- **h5 / app 登录**：SMS / 微信 OAuth round-trip
- **SKU 选择器**：当前手输 sku_id；P2 接 `/catalog/skus` + 扫码 + 缩略图
- **IM**：customer detail 的 "发起会话" + recommend 的 "发送给客户" 占位

## 不要做的事

- 不引入新 UI 库（用 Taro 自带 `View/Text/Input/ScrollView`）
- 不引入重图表库（echarts 等 P2 再说）
- 不与 merchive-miniapp 共代码（即便都是 Taro，业务完全独立）
- 不动 merchive-miniapp / merchive-admin-web / merchive-core 任何文件
- weapp appid 不替决（必须 user 配）

## License

TODO — 待 user 确定（候选：MIT / Apache-2.0 / proprietary）。

# ChainEngine Merchant App

> **TODO 待 user 配**：`config/index.ts` 中 `TARO_APP_WX_APPID` 占位，需用 user 名下**独立**微信小程序 appid（不可复用 chainengine-miniapp 消费者端的 appid，业务零重叠且权限模型不同）。

ChainEngine 商家端独立 mobile app — 导购 / 店长 / 加盟商 / 老板的随身工具。Taro 4 + React 18 + TypeScript，weapp / h5 / app 三端同构。

## 定位

| 端                            | 仓                                | 角色                                                |
| ----------------------------- | --------------------------------- | --------------------------------------------------- |
| 消费者端 mini app              | chainengine-miniapp               | MEMBER / GUEST                                      |
| **商家端 mobile app (本仓)**   | **chainengine-merchant-app**       | **STORE_STAFF / STORE_MGR / FRANCHISEE / TENANT_ADMIN / OWNER** |
| 门店收银                       | chainengine-pos                   | STORE_STAFF (Pad)                                    |
| 后台管理                       | chainengine-admin-web             | TENANT_ADMIN / OWNER (Web)                          |
| 命令行                         | chainengine-cli                   | DevOps / 平台运维                                    |

商家端独立仓的原因（行业惯例：美团 / 有赞 / 微盟 / 抖音）：
- 不同微信小程序 appid，不可混
- 权限模型与消费者端零重叠（看到的数据、写入的范围）
- 发布节奏独立（商家端可周更，消费者端按版本节奏）
- 小程序 2MB 包体积限制，混在一起必爆

## 技术栈

- Taro 4 + React 18 + TypeScript（严格模式）
- pnpm
- Zustand（session / customers / orders）
- react-i18next + zh-CN / en-US / ja-JP（与 miniapp 命名空间一致，便于将来 sdk-ts 共享）

## 启动

```bash
pnpm install

# weapp（开发）
pnpm dev:weapp
# 用微信开发者工具打开 dist/ 目录；填入 TARO_APP_WX_APPID 环境变量后再 build

# h5
pnpm dev:h5

# app（rn 目标，需 react-native + Android/iOS 工具链）
pnpm dev:app

# 类型检查
pnpm typecheck

# 生产构建
pnpm build:weapp
pnpm build:h5
```

### 环境变量（构建时 inject）

| 变量                          | 作用                                                     |
| ----------------------------- | -------------------------------------------------------- |
| `TARO_APP_API_BASE`           | 后端 base URL，默认 `http://localhost:8080/api/v1`        |
| `TARO_APP_WX_APPID`           | **TODO 待 user 配** — 商家端独立 weapp appid              |
| `TARO_APP_LOCAL_DEV_TOKEN`    | 跳过 wxlogin 的 JWT（必须是商家角色账号 mint 的）          |
| `TARO_APP_DEFAULT_TENANT_ID`  | 登录页 tenant_id 预填                                     |

env 值都必须 `JSON.stringify` 包裹（DefinePlugin 原文注入 → webpack parse 失败的踩坑教训）。

## 目录

```
src/
├── app.tsx              # 启动：/auth/me + 角色校验 + 跳页
├── app.config.ts        # 8 页注册（dashboard / login / customers(2) / orders(2) / recommend / handover）
├── pages/
│   ├── login/           # weapp wxlogin（h5/app 登录 P2）
│   ├── dashboard/       # 业绩看板（KPI 4 卡 + 7 日 SVG 折线 + 排名 + 任务 + 快捷入口）
│   ├── customers/       # 列表 + 搜索 + 标签筛选 + 详情
│   ├── orders/          # 代下单 3 步 wizard + 我代下的订单列表
│   ├── recommend/       # 推荐工具（plugin 扩展点）
│   └── handover/        # 交接班（开班 / 结班 / 历史）
├── components/          # TopNav / KpiCard / CustomerCard / SkuPicker
├── services/            # http / auth / shift / customer / order / recommend / stats
├── store/               # session / customers / orders
├── i18n/                # 3 语 × 3 namespace（common / pages / errors）
└── utils/               # age / localCache
```

## 角色识别

`app.tsx` 启动调 `GET /api/v1/auth/me`：
- 401 → `/pages/login/index`
- `roles ∩ {STORE_STAFF, STORE_MGR, FRANCHISEE, TENANT_ADMIN, OWNER} = ∅` → toast "请用商家账号登录" + 跳 login
- 否则 `setIdentity` 进 session store，落地 `/pages/dashboard/index`

session store 暴露 `currentRole()`（按 OWNER → TENANT_ADMIN → FRANCHISEE → STORE_MGR → STORE_STAFF 优先级）/ `currentStoreId` / `currentShiftId`。

## 待办（P2）

- **weapp appid**：user 配
- **echarts**：当前 dashboard 用手写 SVG 折线（700KB 的 echarts 会爆 weapp 2MB 包体），等真接 stats 后视体积决定
- **真接的 endpoint**：`/me/guide-stats` / `/shifts/*` / `/orders/preview` / `/me/recommend` 当前都 404 fallback 到 mock；core 上线后去掉 fallback
- **h5 / app 登录**：SMS / 微信 OAuth round-trip（参考 chainengine-miniapp `services/h5_oauth.ts`）
- **SKU 选择器**：当前手输 sku_id；P2 接 `/catalog/skus` + 扫码 + 缩略图
- **IM**：customer detail 的 "发起会话" + recommend 的 "发送给客户" 占位

## 不要做的事

- 不引入新 UI 库（用 Taro 自带 `View/Text/Input/ScrollView`）
- 不引入重图表库（echarts 等 P2 再说）
- 不与 chainengine-miniapp 共代码（即便都是 Taro，业务完全独立）
- 不动 chainengine-miniapp / chainengine-admin-web / chainengine-core 任何文件
- weapp appid 不替决（必须 user 配）

# 小慕问卷

一个可独立运行的在线问卷平台，支持问卷搭建、发布、公开填写、答卷统计和回收站管理。项目采用 React + TypeScript 实现管理端，并在同一仓库内提供 Express API；线上连接 Neon PostgreSQL，适合用于前端工程化和全栈能力展示。

> 在线演示：[https://xiaomu-questionnaire-production.up.railway.app](https://xiaomu-questionnaire-production.up.railway.app)

## 一句话介绍

这是一个带可视化编辑器的问卷 SaaS 原型：用户可以拖拽搭建问卷、发布公开链接，访客提交答卷后，创建者可以在后台查看明细和题目统计图表。

## 功能

- 用户注册、登录、JWT 登录态和退出
- 创建、编辑、复制、星标、发布和删除问卷
- 标题、段落、输入框、文本域、单选、多选等组件
- 拖拽排序、组件隐藏/锁定、复制粘贴、撤销/重做
- 公开填写页 `/question/:id`，支持表单校验和提交成功页
- 答卷明细分页、单选饼图、多选柱状图
- 回收站恢复和彻底删除
- Neon PostgreSQL 线上持久化，本地开发可零配置使用 JSON 数据
- Jest、Testing Library 与 Supertest 自动化测试

## 技术栈

前端使用 React 18、TypeScript、React Router 6、Redux Toolkit、redux-undo、Ant Design、ahooks、Axios、dnd-kit、Recharts 和 Sass。服务端使用 Express、PostgreSQL、JWT、bcryptjs 和 CORS。测试使用 Jest、Testing Library 与 Supertest，构建使用 CRACO。

## 快速启动

```bash
cd react-program
npm install
npm run dev
```

`npm run dev` 会同时启动 Web `http://localhost:3000` 和 API `http://localhost:8000`。也可以分开运行 `npm run server` 与 `npm run web`；`npm start` 用于生产环境启动编译后的应用。

首次启动会创建 `.data/db.json`。演示账号为：

```text
用户名：demo_user
密码：demo123
```

线上演示也可以使用该账号登录。Railway 当前使用试用额度，面试前请确认在线地址仍可访问。

## 主要路由

| 路由 | 说明 |
| --- | --- |
| `/` | 首页 |
| `/login` | 登录 |
| `/register` | 注册 |
| `/manage/list` | 我的问卷 |
| `/manage/star` | 星标问卷 |
| `/manage/trash` | 回收站 |
| `/question/edit/:id` | 问卷编辑器 |
| `/question/stat/:id` | 答卷和图表统计 |
| `/question/:id` | 公开填写页 |

## 工程设计

- `src/store/componentsReducer` 管理编辑器组件树，使用 `redux-undo` 保留历史状态。
- `src/components/QuestionComponents` 通过组件配置统一展示、属性编辑和统计组件，方便扩展新题型。
- `src/services` 封装 API 调用，Axios 拦截器统一处理 JWT、错误提示和响应结构。
- `server` 提供与前端服务层匹配的 REST API；数据库层支持 PostgreSQL 与本地 JSON 两种运行模式。
- PostgreSQL 写入使用逐条 `INSERT / UPDATE / DELETE`，提交答卷和更新计数在同一事务内完成。
- Express 初始化与端口监听分离，Supertest 可直接测试 API，不需要占用真实端口或连接线上数据库。
- 发布后的问卷通过当前域名生成分享链接和二维码，不依赖硬编码的 localhost 地址。

## 面试演示流程

1. 用演示账号登录后台。
2. 新建问卷，从左侧组件库添加标题、单选、多选和文本题。
3. 拖拽调整题目顺序，在右侧编辑属性，使用撤销/重做验证编辑器状态管理。
4. 保存并发布问卷，打开统计页复制公开链接。
5. 在新标签页填写并提交答卷。
6. 返回统计页查看答卷明细和单选/多选图表。

## 面试可讲的技术点

- 使用 Redux Toolkit 管理组件树和页面信息，用 `redux-undo` 实现编辑器撤销/重做。
- 使用组件配置表统一题目展示、属性面板和统计组件，新增题型只需补充配置和组件。
- 使用 dnd-kit 完成拖拽排序，并处理隐藏、锁定、复制、粘贴和键盘快捷键。
- 使用 Axios 拦截器统一注入 JWT、解析后端响应和处理错误提示。
- 使用 Express 提供 REST API，以 JWT 完成鉴权和资源权限隔离，并使用 Neon PostgreSQL 持久化数据。
- 将答卷写入和答卷计数更新置于同一数据库事务，避免并发写入导致统计数量不一致。
- 使用 Supertest 覆盖鉴权、草稿访问、防越权修改、问卷发布、答卷提交与统计查询。
- 使用 Recharts 将单选和多选答卷聚合为可视化图表。

## 简历描述（可直接参考）

**小慕问卷 | React + TypeScript + Express**

独立开发并部署在线问卷平台，完成 JWT 用户认证、可视化问卷编辑、拖拽排序、发布分享、公开答卷和数据统计闭环；使用 Redux Toolkit 与 redux-undo 管理编辑器状态，使用 dnd-kit 完成拖拽交互，使用 Express + Neon PostgreSQL 提供持久化 REST API，并通过 Jest、Testing Library 和 Supertest 覆盖核心流程。

## 当前限制

- 未配置 `DATABASE_URL` 时，API 使用 JSON 文件，适合本地演示；配置 PostgreSQL 连接串后会自动建表并使用真实数据库。
- 线上环境部署于 Railway，并连接 Neon PostgreSQL；Railway 试用额度到期后需要更换套餐或迁移服务。

## 验证命令

```bash
npm run lint
npm test -- --runInBand
npm run build
```

## 部署

当前项目部署在 Railway。服务会先构建 React，再由同一个 Node 进程提供静态页面和 `/api` 接口；线上通过 `DATABASE_URL` 连接 Neon PostgreSQL，并通过 `JWT_SECRET` 签发登录令牌。

生产环境必须配置 `DATABASE_URL`、`JWT_SECRET` 和 `NODE_ENV=production`，敏感配置只保存在部署平台环境变量中，不提交到版本库。

## 面试演示建议

登录演示账号后，新建问卷并从组件库添加题目，拖拽调整顺序后发布。复制统计页生成的公开链接，在新标签页提交一份答卷，再回到统计页查看答卷明细和题目图表。这个流程可以完整展示状态管理、组件设计、表单交互、API 设计和数据可视化。

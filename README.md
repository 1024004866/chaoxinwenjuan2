# 小慕问卷

一个可独立运行的在线问卷平台，支持问卷搭建、发布、公开填写、答卷统计和回收站管理。项目采用 React + TypeScript 实现管理端，并在同一仓库内提供 Express API 和本地持久化数据，适合用于前端工程化和全栈协作能力展示。

## 功能

- 用户注册、登录、JWT 登录态和退出
- 创建、编辑、复制、星标、发布和删除问卷
- 标题、段落、输入框、文本域、单选、多选等组件
- 拖拽排序、组件隐藏/锁定、复制粘贴、撤销/重做
- 公开填写页 `/question/:id`，支持表单校验和提交成功页
- 答卷明细分页、单选饼图、多选柱状图
- 回收站恢复和彻底删除
- 本地 JSON 数据持久化，首次启动自动写入演示用户和种子问卷

## 技术栈

前端使用 React 18、TypeScript、React Router 6、Redux Toolkit、redux-undo、Ant Design、ahooks、Axios、dnd-kit、Recharts 和 Sass。服务端使用 Express、JWT、bcryptjs 和 CORS。测试使用 Jest 与 Testing Library，构建使用 CRACO。

## 快速启动

```bash
cd react-program
npm install
npm start
```

`npm start` 会同时启动 Web `http://localhost:3000` 和 API `http://localhost:8000`。也可以分开运行 `npm run server` 与 `npm run web`。

首次启动会创建 `.data/db.json`。演示账号为：

```text
用户名：demo_user
密码：demo123
```

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
- `server` 提供与前端服务层匹配的 REST API；`.data` 只用于本地开发，不提交到版本库。
- 发布后的问卷通过当前域名生成分享链接和二维码，不依赖硬编码的 localhost 地址。

## 验证命令

```bash
npm run lint
npm test -- --runInBand
npm run build
```

## 部署

仓库包含 `render.yaml`，可以在 Render 中选择 **New Blueprint**，连接 GitHub 仓库后自动创建一个 Web Service。服务会先构建 React，再由同一个 Node 进程提供静态页面和 `/api` 接口。

部署完成后，将 Render 分配的 `https://...onrender.com` 地址作为项目演示地址。当前示例数据库使用本地 JSON 文件，适合面试演示；生产环境建议替换为 PostgreSQL，并把 `JWT_SECRET` 配置为平台环境变量。

## 面试演示建议

登录演示账号后，新建问卷并从组件库添加题目，拖拽调整顺序后发布。复制统计页生成的公开链接，在新标签页提交一份答卷，再回到统计页查看答卷明细和题目图表。这个流程可以完整展示状态管理、组件设计、表单交互、API 设计和数据可视化。

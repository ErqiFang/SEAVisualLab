# SEA Visual Lab

东南亚电商智能视觉生成平台（SEA Visual Lab）是一个面向跨境中小商家的 AI 商品图生成 SaaS 原型。

<img width="1732" height="898" alt="image" src="https://github.com/user-attachments/assets/c829e495-8f10-4002-9144-3195b6a716f6" />

它聚焦解决三个高频痛点：

- 不懂东南亚本地审美
- 测图成本高、迭代慢
- 细节图与卖点图制作繁琐
<img width="1270" height="634" alt="image" src="https://github.com/user-attachments/assets/9e50a1e3-736b-40dd-947e-3aee2d546541" />
<img width="1280" height="594" alt="image" src="https://github.com/user-attachments/assets/5d7785f1-1345-4c32-8c4d-ec19a92f6880" />
<img width="1280" height="720" alt="image" src="https://github.com/user-attachments/assets/8abc8707-5f9d-4c24-b485-71a3f4a05c56" />

通过“一键上传原图 + 多风格生成 + 卖点自动拆解 + 一体化工作台”，SEA Visual Lab 帮助商家快速产出适合 Shopee、Lazada、TikTok Shop 等平台的主图、辅图和细节图，降低视觉制作门槛，提升点击率与转化率。


## 页面说明

当前仓库的 GitHub 发布版本会以“README + 源码压缩包”的方式提供。

- 首页：`/`
- 工作台：`/studio`
- 视觉示意素材：源码压缩包内的 `src/image/`

如果你在本地解压源码并启动项目，就可以直接看到首页和工作台中的视觉预览与生成流程。

## 产品定位

- 产品名称：东南亚电商智能视觉生成平台
- 目标用户：东南亚跨境中小商家，尤其是服饰、家居、美妆类目
- 核心价值：让商家用更低成本，生成更符合本地平台调性的商品视觉素材
- 核心场景：商品上新、测款、主图测试、详情页卖点表达、广告素材制作

## 核心功能

### 1. 主图 / 辅图生成

- 上传单张商品原图
- 选择风格模板
- 一键生成多套主图、辅图方案
- 支持单张下载与整组下载
- 适配 Shopee、Lazada、TikTok Shop 等平台风格偏好

### 2. 商品细节图生成

- 上传商品原图并补充基础卖点信息
- 自动拆解面料、版型、工艺等表达重点
- 生成结构细节图、材质细节图、上身细节图
- 支持直接用于详情页和广告素材

### 3. 一体化工作台

- 左侧：功能切换
- 中间：上传与参数配置
- 右侧：结果预览、筛选、重生成与下载
- 整个流程在同一页面完成，减少来回切换

## 技术栈

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- 服务端 API Routes
- 本地上传与生成结果回传
- TokenPlan / MiniMax 集成

## API 接口

以下接口都通过 `FormData` 接收上传文件与参数：

- `POST /api/generate-main-images`
- `POST /api/generate-detail-images`
- `POST /api/regenerate-style`
- `POST /api/regenerate-detail-group`

请求流程大致如下：

1. 校验参数
2. 解析上传图片
3. 临时写入运行时文件
4. 组装 prompt
5. 调用文本规划与图片生成服务
6. 将结果映射为前端可直接展示的结构

## 本地运行

```bash
npm install
npm run dev
```

打开 `http://localhost:3000` 即可查看首页。

如果 PowerShell 对 `npm.ps1` 有执行策略限制，可以使用：

```bash
cmd /c npm run dev
```

## 生产构建

```bash
npm run build
npm run start
```

## 环境变量

请参考 [`.env.local.example`](./.env.local.example) 创建本地配置。

```env
TOKENPLAN_API_KEY=
TOKENPLAN_BASE_URL=https://api.tokenplan.ai
MINIMAX_MODEL=MiniMax-Text-01
MINIMAX_IMAGE_MODEL=image-01
ENABLE_REAL_GENERATION=true
ENABLE_FALLBACK_MOCK=true
REQUEST_TIMEOUT_MS=45000
IMAGE_GENERATION_PROVIDER=minimax-via-tokenplan
TOKENPLAN_CHAT_PATH=/v1/chat/completions
TOKENPLAN_IMAGE_PATH=/v1/image_generation
APP_BASE_URL=http://localhost:3000
```

### 说明

- `TOKENPLAN_API_KEY`：服务端读取，前端不会暴露
- `TOKENPLAN_BASE_URL`：TokenPlan 网关地址
- `MINIMAX_MODEL`：文本规划阶段使用的模型
- `MINIMAX_IMAGE_MODEL`：图片生成阶段使用的模型
- `ENABLE_REAL_GENERATION`：是否启用真实 provider 调用
- `ENABLE_FALLBACK_MOCK`：真实链路失败时是否回退
- `REQUEST_TIMEOUT_MS`：请求超时时间
- `IMAGE_GENERATION_PROVIDER`：当前图像供应商标识
- `TOKENPLAN_CHAT_PATH`：文本规划接口路径
- `TOKENPLAN_IMAGE_PATH`：图片生成接口路径
- `APP_BASE_URL`：生成可访问 URL 时使用

## 安全提醒

- 不要把 API Key 写进前端代码
- 不要把真实密钥写进 README 示例
- 所有 provider 调用都应该保留在服务端

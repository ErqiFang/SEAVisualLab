# SEA Visual Lab

东南亚电商智能视觉生成平台（SEA Visual Lab）是一个面向跨境中小商家的 AI 商品图生成 SaaS 原型。

<img width="1872" height="948" alt="image" src="https://github.com/user-attachments/assets/debb605b-762a-415c-8806-c30780dc6c3c" />


它聚焦解决三个高频痛点：

- 不懂东南亚本地审美
- 测图成本高、迭代慢
- 细节图与卖点图制作繁琐


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

## 页面说明
### 首页

本项目前端展示平台旨在为东南亚跨境电商卖家提供直观、高效的商品图生成体验。整体页面设计遵循“简单、易懂、高效”的原则，引导用户快速完成从原图上传到爆款素材下载的全过程。

1. 首屏核心展示区
价值主张：通过醒目的标题“一键生成东南亚爆款主图”，直击用户痛点（不懂当地审美）。
风格预览：右侧展示“专业棚拍”、“生活场景”、“半身特写”、“多色拼图”四种核心风格卡片，让用户在注册前即可直观感受生成效果，降低决策门槛。
2. 核心功能亮点
多风格测款：展示系统如何通过AI将同一商品生成为不同风格的图片（如工作室vs街拍），帮助用户进行“数据选优”。
智能卖点拆解：演示系统如何自动识别面料与剪裁，生成带有“垂感”、“挺括”等本地化文案的细节图，提升商品转化率。
3. 场景化模板库
平台适配：针对Shopee、Lazada、TikTok等不同平台的算法偏好和用户习惯，预设了“官方推荐”、“爆款街拍”、“细节展示”等热门风格模板，确保生成的图片“用得对”。
4. 极简操作流程
三步闭环：清晰展示“上传原图”→“选择目标市场”→“下载即用”的三步操作流，强调系统自动化匹配当地审美，无需人工干预。

<img width="1278" height="946" alt="image" src="https://github.com/user-attachments/assets/1013d9c7-87e6-4022-aad4-428b122345c0" />
<img width="1270" height="634" alt="image" src="https://github.com/user-attachments/assets/9e50a1e3-736b-40dd-947e-3aee2d546541" />
<img width="1280" height="594" alt="image" src="https://github.com/user-attachments/assets/5d7785f1-1345-4c32-8c4d-ec19a92f6880" />
<img width="1280" height="720" alt="image" src="https://github.com/user-attachments/assets/8abc8707-5f9d-4c24-b485-71a3f4a05c56" />

### 功能一：主图/场景图生成

该页面旨在通过“三步走”的引导式设计，帮助商家快速完成主图与场景图的批量生成。页面布局清晰，左侧为功能导航，中间为参数配置，右侧为实时预览，形成完整的操作闭环。
1. 顶部状态概览区
操作指引：明确提示“1-2-3 步骤操作”，引导用户按顺序完成上传、配置与预览，降低认知负担。
任务状态卡片：通过“待生成”、“点击上传原图”等状态标签，实时反馈当前任务进度，确保用户随时掌握生成状态。
2. 左侧功能导航栏
模块切换：提供“主图/场景图生成”与“卖点细节图生成”两大核心功能的快速切换，满足商家不同阶段的视觉需求。
3. 中间参数配置区（Module A）
商品信息填写：支持填写商品名称、类目、描述及材质信息，为AI生成提供精准的语义参考，确保生成内容与商品属性高度匹配。
输出设置：提供平台（Shopee/TikTok/Lazada）、国家（泰国/印尼/菲律宾等）、图片比例、输出类型（主图+辅图）及生成数量的精细化配置，满足不同平台与市场的差异化需求。
风格选择：支持多选风格模板，如“专业棚拍”、“生活场景”，并附带“官方推荐”、“点击率高”等标签，帮助用户快速选择高转化率的视觉方案。
4. 右侧实时预览区
生成效果展示：实时展示AI根据用户选择生成的主图与场景图，包括“干净白底”、“真实街拍”、“多色拼图”等多种风格，让用户在生成前即可预览效果。
生成提示：明确告知用户“生成过程通常需要10-20秒”，并提供“系统会自动完成上传、校验和结果回传”的说明，提升用户体验与信任感。

<img width="1872" height="948" alt="image" src="https://github.com/user-attachments/assets/9302455a-eee5-4abb-87ab-d0602185587c" />

<br>

<table align="center">
  <tr>
    <td align="center" style="padding-right:10px; vertical-align:top;">
      <img width="300" src="https://github.com/user-attachments/assets/1363d838-be86-4f71-81ac-6b60e6b7f158" />
      <br><br>
      <img width="300" src="https://github.com/user-attachments/assets/e3b271b7-9ff0-4d2c-94b9-d9cbea0888ca" />
    </td>
    <td align="center" style="vertical-align:top;">
      <img width="300" src="https://github.com/user-attachments/assets/2a14648a-7203-4e8d-89dc-a2bc952c4331" />
    </td>
  </tr>
</table>

### 功能二：卖点细节图生成

该页面聚焦于“商品卖点与细节拆解”，通过精准的信息输入与灵活的展示方式配置，帮助商家高效生成高转化率的细节图素材。
1. 卖点信息精准输入
支持填写商品名称、类目、材质细节描述，同时提供面料关键词与工艺关键词的标签式输入，为AI生成提供精准的语义锚点，确保生成的细节图能准确传递商品核心卖点，如“细纹理混纺面料”“高腰腰头”等关键信息。
2. 细节展示灵活配置
提供“细节重点”与“展示场景”两大维度的多选配置：“细节重点”涵盖正面图、面料细节、走线细节等10余种细分选项，覆盖商品从整体到局部的全方位展示需求；“展示场景”支持白底细节图、放大特写图、场景化细节图等5种模式，满足不同平台、不同营销场景下的视觉表达需求。
3. 实时预览与高效生成
右侧实时预览区同步展示AI生成的细节图效果，直观呈现“垂感·挺括西装面料”“舒适！细腻！不易皱”等卖点文案与视觉的结合效果，让商家在生成前即可确认风格与内容；生成过程保持与功能一一致的10-20秒高效节奏，且系统自动完成上传、校验与回传，无需人工干预，进一步提升细节图制作效率。

<img width="1872" height="948" alt="image" src="https://github.com/user-attachments/assets/681c0099-4acb-4f7c-8235-ac422d75ac95" />

<br>

<table align="center">
  <tr>
    <td align="center" style="padding-right:10px">
      <img width="300" src="https://github.com/user-attachments/assets/5f8d6e9c-d421-4a67-a5d0-b9611beb4378" />
    </td>
    <td align="center">
      <img width="300" src="https://github.com/user-attachments/assets/16545f96-ff2d-4b27-be05-f970e8b90209" />
    </td>
  </tr>
</table>

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

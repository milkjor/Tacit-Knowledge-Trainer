# 隐性知识显性化表达

这是一个面向隐性知识训练的网页原型，用于把难以言说的感悟、直觉、审美和判断，转化为可观察、可命名、可练习、可迁移的表达能力。页面采用米白浅色渐变和单中心训练流，内置关系、权力、审美三个固定案例，并支持用户输入任意隐性知识问题，由 AI 生成一条新的 K-R-R-S 训练路径。四步流程保持为“故事、追问、练习、迁移”：故事对应 Knowledge，追问和练习对应 Rule，迁移对应 Skill。用户先在故事中捕捉模糊判断，再把线索写成可追问的问题，随后通过互动练习强化规则，最终生成包含盲区、线索、规则和迁移任务的表达卡。

## 文件结构

- `index.html`：前端页面，包含 HTML、CSS 和浏览器端 JavaScript。
- `api/generate-krrs.js`：Vercel Serverless API，用火山方舟模型生成 K-R-R-S 路径。
- `.gitignore`：忽略环境变量、本地依赖、Vercel 缓存和打包文件。

## 本地预览

直接打开 `index.html` 可以体验固定案例。AI 生成功能需要通过 Vercel 或本地 Serverless 环境访问 `/api/generate-krrs`。

## Vercel 环境变量

在 Vercel Project Settings 中添加：

- `ARK_API_KEY`：火山方舟 API Key

不要把 API Key 写入前端代码、README 或 Git。

## Git 上传

```bash
git init
git add index.html README.md .gitignore api/generate-krrs.js
git commit -m "Add AI generated K-R-R-S path"
```

然后推送到 GitHub，并在 Vercel 导入该仓库。


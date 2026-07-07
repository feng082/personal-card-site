# 个人名片静态网站

这是一个可部署到 Vercel 的纯静态个人名片网站。

## 页面

- `index.html`：访客看到的个人主页
- `admin.html`：内容管理页
- `data/content.json`：线上默认内容

## 本地预览

当前本地预览地址：

```text
http://localhost:5177/index.html
http://localhost:5177/admin.html
```

## 后台怎么用

后台可以增删改：

- 基础信息
- 联系方式
- 数字卡片
- 内容模块
- 更新记录

点击「保存并发布」后，会调用 Vercel 后端接口，把内容提交到 GitHub，并触发 Vercel 自动重新发布。

点击「下载配置」仍会下载一个 `content.json`，可以作为手动备份。

Vercel 项目需要配置这些环境变量：

- `ADMIN_USER`
- `ADMIN_PASS`
- `GITHUB_TOKEN`
- `GITHUB_OWNER`，默认 `feng082`
- `GITHUB_REPO`，默认 `personal-card-site`
- `GITHUB_BRANCH`，默认 `main`

## 部署到 Vercel

1. 把这个文件夹上传到一个 GitHub 仓库
2. 在 Vercel 里选择 Import Project
3. 选择这个 GitHub 仓库
4. Framework Preset 选择 Other
5. Build Command 留空
6. Output Directory 留空或填 `.`
7. 点击 Deploy

部署后会得到一个 `项目名.vercel.app` 地址。

## 在线后台

当前方案不需要数据库。后台保存后会改 GitHub 里的 `data/content.json`，然后等待 Vercel 自动部署。

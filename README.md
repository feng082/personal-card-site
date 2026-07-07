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

点击「保存到本机」后，只会保存在当前浏览器里。

点击「下载配置」会下载一个 `content.json`。要更新线上网站，需要用这个文件替换仓库里的 `data/content.json`，然后重新提交到 GitHub，Vercel 会自动重新发布。

## 部署到 Vercel

1. 把这个文件夹上传到一个 GitHub 仓库
2. 在 Vercel 里选择 Import Project
3. 选择这个 GitHub 仓库
4. Framework Preset 选择 Other
5. Build Command 留空
6. Output Directory 留空或填 `.`
7. 点击 Deploy

部署后会得到一个 `项目名.vercel.app` 地址。

## 如果想要真正的在线后台

当前后台是免费的静态方案，适合个人用，但它不能直接把修改写回 Vercel 线上文件。

如果想登录后台后直接改线上内容，可以后续接：

- Supabase：保存内容数据
- GitHub API：后台直接改仓库文件
- Decap CMS：适合静态站内容管理

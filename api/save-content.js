const OWNER = process.env.GITHUB_OWNER || "feng082";
const REPO = process.env.GITHUB_REPO || "personal-card-site";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const FILE_PATH = "data/content.json";

function sendJson(response, status, data) {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(data));
}

async function readBody(request) {
  if (request.body && typeof request.body === "object") return request.body;

  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function validateContent(content) {
  if (!content || typeof content !== "object") return "内容格式不正确。";
  if (!content.profile || typeof content.profile !== "object") return "缺少基础信息。";
  if (!Array.isArray(content.links)) return "联系方式格式不正确。";
  if (!Array.isArray(content.stats)) return "数字卡片格式不正确。";
  if (!Array.isArray(content.sections)) return "内容模块格式不正确。";
  if (!Array.isArray(content.updates)) return "更新记录格式不正确。";
  return null;
}

async function githubRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "personal-card-site-admin",
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(data.message || `GitHub 请求失败：${response.status}`);
  }
  return data;
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    sendJson(response, 405, { ok: false, message: "只支持 POST 保存。" });
    return;
  }

  const requiredEnv = ["GITHUB_TOKEN", "ADMIN_USER", "ADMIN_PASS"];
  const missing = requiredEnv.filter((name) => !process.env[name]);
  if (missing.length) {
    sendJson(response, 500, {
      ok: false,
      message: `服务器还缺少环境变量：${missing.join(", ")}`
    });
    return;
  }

  try {
    const payload = await readBody(request);
    const username = request.headers["x-admin-user"] || "";
    const password = request.headers["x-admin-pass"] || "";

    if (username !== process.env.ADMIN_USER || password !== process.env.ADMIN_PASS) {
      sendJson(response, 401, { ok: false, message: "账号或密码不正确。" });
      return;
    }

    const content = payload.content;
    const validationError = validateContent(content);
    if (validationError) {
      sendJson(response, 400, { ok: false, message: validationError });
      return;
    }

    const fileUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`;
    const current = await githubRequest(fileUrl);
    const nextContent = `${JSON.stringify(content, null, 2)}\n`;
    const encoded = Buffer.from(nextContent, "utf8").toString("base64");

    await githubRequest(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
      method: "PUT",
      body: JSON.stringify({
        message: "Update site content from admin",
        content: encoded,
        sha: current.sha,
        branch: BRANCH
      })
    });

    sendJson(response, 200, {
      ok: true,
      message: "已提交到 GitHub，Vercel 会自动重新部署。"
    });
  } catch (error) {
    sendJson(response, 500, {
      ok: false,
      message: error.message || "保存失败。"
    });
  }
};

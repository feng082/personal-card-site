const STORAGE_KEY = "personal-card-content";
const AUTH_KEY = "personal-card-admin-auth";
const AUTH_USER_KEY = "personal-card-admin-user";
const AUTH_PASS_KEY = "personal-card-admin-pass";
const ADMIN_USER = "xiaofeng";
const ADMIN_PASS = "setsuna214";

let content = null;
let defaults = null;

async function loadContent() {
  const response = await fetch("./data/content.json", { cache: "no-store" });
  defaults = await response.json();

  const local = localStorage.getItem(STORAGE_KEY);
  if (local) return normalizeContent(JSON.parse(local));
  return normalizeContent(structuredClone(defaults));
}

function normalizeContent(data) {
  data.links = data.links || [];
  data.links.forEach((link) => {
    if (link.qr == null) link.qr = "";
  });

  const hasDouyin = data.links.some((link) => String(link.label || "").includes("抖音"));
  if (!hasDouyin) {
    const wechatIndex = data.links.findIndex((link) => String(link.label || "").includes("微信"));
    data.links.splice(Math.max(wechatIndex + 1, 0), 0, {
      label: "抖音",
      value: "扫码关注抖音",
      url: "",
      qr: ""
    });
  }

  return data;
}

function isAuthed() {
  return sessionStorage.getItem(AUTH_KEY) === "yes";
}

function setAuthenticated(value) {
  if (value) {
    sessionStorage.setItem(AUTH_KEY, "yes");
  } else {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.removeItem(AUTH_PASS_KEY);
  }
}

function showEditor() {
  document.getElementById("loginPanel").classList.add("hidden");
  document.getElementById("adminForm").classList.remove("hidden");
  document.getElementById("adminActions").classList.remove("hidden");
}

function showLogin() {
  document.getElementById("loginPanel").classList.remove("hidden");
  document.getElementById("adminForm").classList.add("hidden");
  document.getElementById("adminActions").classList.add("hidden");
}

function byPath(path) {
  return path.split(".").reduce((target, key) => target && target[key], content);
}

function setByPath(path, value) {
  const keys = path.split(".");
  const last = keys.pop();
  const target = keys.reduce((next, key) => next[key], content);
  target[last] = value;
}

function toast(message) {
  const element = document.getElementById("toast");
  element.textContent = message;
  element.classList.add("show");
  window.setTimeout(() => element.classList.remove("show"), 1800);
}

function input(name, value, placeholder = "") {
  return `<input data-name="${name}" type="text" value="${escapeAttr(value || "")}" placeholder="${placeholder}">`;
}

function textarea(name, value, rows = 3) {
  return `<textarea data-name="${name}" rows="${rows}">${escapeHtml(value || "")}</textarea>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function renderLinks() {
  document.getElementById("linksEditor").innerHTML = (content.links || []).map((item, index) => `
    <article class="repeat-item">
      <button class="remove-button" type="button" data-remove="links" data-index="${index}">删除</button>
      <label>名称${input(`links.${index}.label`, item.label)}</label>
      <label>显示内容${input(`links.${index}.value`, item.value)}</label>
      <label class="wide">跳转地址${input(`links.${index}.url`, item.url, "https://... 或 mailto:...")}</label>
      <label class="wide">二维码图片地址${input(`links.${index}.qr`, item.qr, "https://...，微信/抖音可填写二维码图片")}</label>
    </article>
  `).join("");
}

function renderStats() {
  document.getElementById("statsEditor").innerHTML = (content.stats || []).map((item, index) => `
    <article class="repeat-item">
      <button class="remove-button" type="button" data-remove="stats" data-index="${index}">删除</button>
      <label>数字${input(`stats.${index}.value`, item.value)}</label>
      <label>标题${input(`stats.${index}.label`, item.label)}</label>
      <label class="wide">说明${input(`stats.${index}.note`, item.note)}</label>
    </article>
  `).join("");
}

function renderSections() {
  document.getElementById("sectionsEditor").innerHTML = (content.sections || []).map((item, index) => `
    <article class="repeat-item">
      <button class="remove-button" type="button" data-remove="sections" data-index="${index}">删除</button>
      <label>角标${input(`sections.${index}.eyebrow`, item.eyebrow)}</label>
      <label>标题${input(`sections.${index}.title`, item.title)}</label>
      <label class="wide">正文${textarea(`sections.${index}.body`, item.body)}</label>
      <label class="wide">条目，一行一个${textarea(`sections.${index}.items`, (item.items || []).join("\n"), 4)}</label>
    </article>
  `).join("");
}

function renderUpdates() {
  document.getElementById("updatesEditor").innerHTML = (content.updates || []).map((item, index) => `
    <article class="repeat-item">
      <button class="remove-button" type="button" data-remove="updates" data-index="${index}">删除</button>
      <label>日期${input(`updates.${index}.date`, item.date)}</label>
      <label>标题${input(`updates.${index}.title`, item.title)}</label>
      <label class="wide">内容${textarea(`updates.${index}.body`, item.body)}</label>
    </article>
  `).join("");
}

function render() {
  document.querySelectorAll("#adminForm [name]").forEach((field) => {
    field.value = byPath(field.name) || "";
  });
  renderLinks();
  renderStats();
  renderSections();
  renderUpdates();
}

function collect() {
  document.querySelectorAll("#adminForm [name]").forEach((field) => setByPath(field.name, field.value));
  document.querySelectorAll("[data-name]").forEach((field) => {
    const path = field.dataset.name;
    if (path.endsWith(".items")) {
      setByPath(path, field.value.split("\n").map((line) => line.trim()).filter(Boolean));
      return;
    }
    setByPath(path, field.value);
  });
}

function downloadJson() {
  collect();
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "content.json";
  link.click();
  URL.revokeObjectURL(url);
}

document.getElementById("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const error = document.getElementById("loginError");

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    error.textContent = "";
    setAuthenticated(true);
    sessionStorage.setItem(AUTH_USER_KEY, username);
    sessionStorage.setItem(AUTH_PASS_KEY, password);
    showEditor();
    render();
    return;
  }

  error.textContent = "账号或密码不正确";
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  setAuthenticated(false);
  showLogin();
});

document.addEventListener("click", (event) => {
  if (!isAuthed()) return;

  const add = event.target.closest("[data-add]");
  if (add) {
    collect();
    const type = add.dataset.add;
    const templates = {
      links: { label: "新链接", value: "待补充", url: "", qr: "" },
      stats: { value: "00", label: "新卡片", note: "说明文字" },
      sections: { eyebrow: "New", title: "新模块", body: "这里填写正文。", items: ["第一条"] },
      updates: { date: new Date().toISOString().slice(0, 10), title: "新更新", body: "这里填写更新内容。" }
    };
    content[type].push(templates[type]);
    render();
  }

  const remove = event.target.closest("[data-remove]");
  if (remove) {
    collect();
    content[remove.dataset.remove].splice(Number(remove.dataset.index), 1);
    render();
  }
});

async function publishContent() {
  collect();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content));

  const button = document.getElementById("saveBtn");
  button.disabled = true;
  button.textContent = "发布中...";

  try {
    const response = await fetch("/api/save-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-User": sessionStorage.getItem(AUTH_USER_KEY) || "",
        "X-Admin-Pass": sessionStorage.getItem(AUTH_PASS_KEY) || ""
      },
      body: JSON.stringify({ content })
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.message || "发布失败");
    toast("已提交发布，约 1 分钟后全网更新");
  } catch (error) {
    toast(error.message || "发布失败，已先保存到本机");
  } finally {
    button.disabled = false;
    button.textContent = "保存并发布";
  }
}

document.getElementById("saveBtn").addEventListener("click", publishContent);

document.getElementById("exportBtn").addEventListener("click", () => {
  downloadJson();
  toast("配置文件已下载");
});

document.getElementById("resetBtn").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  content = structuredClone(defaults);
  render();
  toast("已恢复默认草稿");
});

loadContent().then((data) => {
  content = data;
  if (isAuthed()) {
    showEditor();
    render();
  } else {
    showLogin();
  }
});

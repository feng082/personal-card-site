const STORAGE_KEY = "personal-card-content";

async function loadContent() {
  const local = localStorage.getItem(STORAGE_KEY);
  if (local) return JSON.parse(local);

  const response = await fetch("./data/content.json", { cache: "no-store" });
  return response.json();
}

function text(value, fallback = "") {
  return value && String(value).trim() ? value : fallback;
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function linkMarkup(link) {
  const label = text(link.label, "链接");
  const value = text(link.value, "待补充");
  const href = text(link.url, "");
  if (!href) return `<span class="pill">${label}<small>${value}</small></span>`;
  return `<a class="pill" href="${href}" target="_blank" rel="noreferrer">${label}<small>${value}</small></a>`;
}

function render(content) {
  const profile = content.profile || {};
  document.title = `${text(profile.name, "个人名片")} | 个人名片`;
  document.querySelectorAll('[data-field="name"]').forEach((item) => {
    item.textContent = text(profile.name, "个人名片");
  });
  setText("hero-title", text(profile.name, "你的名字"));
  setText("tagline", text(profile.tagline, "个人名片 · 持续更新中"));
  setText("intro", text(profile.intro, "这里先放一段简短的自我介绍。"));
  setText("statusText", text(profile.status, "持续更新中"));
  setText("footerName", text(profile.name, "个人名片"));
  setText("avatarFallback", text(profile.name, "名").slice(0, 1));

  const avatar = document.getElementById("avatar");
  if (avatar && profile.avatar) {
    avatar.src = profile.avatar;
    avatar.alt = text(profile.name, "头像");
    avatar.style.display = "block";
  }

  document.getElementById("heroLinks").innerHTML = (content.links || []).slice(0, 3).map(linkMarkup).join("");
  document.getElementById("contactLinks").innerHTML = (content.links || []).map(linkMarkup).join("");

  document.getElementById("stats").innerHTML = (content.stats || []).map((stat) => `
    <article class="stat">
      <strong>${text(stat.value, "00")}</strong>
      <span>${text(stat.label, "标题")}</span>
      <p>${text(stat.note, "说明文字")}</p>
    </article>
  `).join("");

  document.getElementById("sections").innerHTML = (content.sections || []).map((section) => `
    <article class="info-card">
      <p class="kicker">${text(section.eyebrow, "Section")}</p>
      <h3>${text(section.title, "标题")}</h3>
      <p>${text(section.body, "这里是内容说明。")}</p>
      <ul>
        ${(section.items || []).map((item) => `<li>${text(item, "待补充")}</li>`).join("")}
      </ul>
    </article>
  `).join("");

  document.getElementById("updatesList").innerHTML = (content.updates || []).map((update) => `
    <article class="timeline-item">
      <time>${text(update.date, "2026-01-01")}</time>
      <div>
        <h3>${text(update.title, "更新标题")}</h3>
        <p>${text(update.body, "更新内容。")}</p>
      </div>
    </article>
  `).join("");
}

loadContent().then(render).catch(() => {
  document.body.classList.add("load-error");
});

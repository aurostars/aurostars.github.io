(() => {
  "use strict";

  const profile = window.GARDEN_PROFILE || {};
  const pages = [...document.querySelectorAll(".page")];
  const ids = pages.map((page) => page.id);
  const indexLinks = [...document.querySelectorAll(".garden-index nav a")];
  const previous = document.querySelector("#previousPage");
  const next = document.querySelector("#nextPage");
  const dialog = document.querySelector("#detailDialog");
  const dialogContent = document.querySelector("#dialogContent");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pager = new window.GardenNavigation.WheelPager();
  const visited = new Set();
  let current = 0;
  let transitionTimer;
  let toastTimer;
  let touchStart;
  let touchConsumed = false;

  function icon(name) {
    return `<svg class="icon" aria-hidden="true"><use href="./assets/icons.svg#${name}"></use></svg>`;
  }

  function toast(message) {
    clearTimeout(toastTimer);
    const element = document.querySelector("#toast");
    element.textContent = message;
    element.classList.add("is-visible");
    toastTimer = setTimeout(() => element.classList.remove("is-visible"), 3400);
  }

  document.addEventListener("garden:message", (event) => toast(event.detail));

  function updateNavigation() {
    document.body.classList.toggle("is-inside", current > 0);
    document.querySelector("#gardenIndex").hidden = current === 0;
    document.querySelector("#pageNumber").textContent = String(current).padStart(2, "0");
    document.querySelector("#pageTotal").textContent = `/ ${String(pages.length - 1).padStart(2, "0")}`;
    document.querySelector("#readingProgress").style.transform = `scaleX(${current / (pages.length - 1)})`;
    previous.disabled = current === 0;
    next.disabled = current === pages.length - 1;
    const touch = window.matchMedia("(pointer: coarse)").matches;
    const chapter = pages[current].dataset.chapter || ids[current];
    document.querySelector("#gestureHint").textContent = current === pages.length - 1
      ? "到这里，刚刚好"
      : touch ? "滑动阅读，轻点箭头翻页" : "滚动鼠标，翻开下一页";
    for (const link of indexLinks) {
      const id = link.hash.slice(1);
      if (id === chapter) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
      link.classList.toggle("is-visited", visited.has(id));
    }
    if (current > 0 && window.innerWidth <= 800) {
      const link = indexLinks.find((item) => item.hash === `#${chapter}`);
      const nav = link?.parentElement;
      if (nav && link) nav.scrollTo({ left: Math.max(0, link.offsetLeft - nav.clientWidth / 2 + link.offsetWidth / 2), behavior: reduceMotion.matches ? "instant" : "smooth" });
    }
  }

  function finishTransition() {
    clearTimeout(transitionTimer);
    for (let index = 0; index < pages.length; index++) {
      const page = pages[index];
      page.classList.remove("is-leaving", "is-entering");
      page.hidden = index !== current;
      page.inert = index !== current;
      page.classList.toggle("is-active", index === current);
    }
  }

  function goTo(target, { history = true, animate = true, focus = true } = {}) {
    if (target < 0 || target >= pages.length || (target === current && pages[target].classList.contains("is-active"))) return;
    finishTransition();
    const outgoing = pages[current];
    const incoming = pages[target];
    document.documentElement.style.setProperty("--page-direction", target > current ? 1 : -1);
    current = target;
    visited.add(pages[current].dataset.chapter || ids[current]);
    incoming.hidden = false;
    incoming.inert = false;
    incoming.scrollTop = 0;
    outgoing.inert = true;
    outgoing.classList.remove("is-active");
    incoming.classList.add("is-active");

    if (animate && !reduceMotion.matches) {
      outgoing.classList.add("is-leaving");
      incoming.classList.add("is-entering");
      transitionTimer = setTimeout(finishTransition, 680);
    } else {
      finishTransition();
    }
    if (history) window.history.pushState(null, "", `#${ids[current]}`);
    updateNavigation();
    pager.lock(performance.now());
    document.querySelector("#pageAnnouncer").textContent = `${pages[current].dataset.pageName}，第 ${current + 1} 页，共 ${pages.length} 页`;
    if (focus) {
      const title = incoming.querySelector("h1,h2");
      title.tabIndex = -1;
      title.focus({ preventScroll: true });
    }
  }

  function openDialog(markup, label, projectDetail = false) {
    dialogContent.innerHTML = markup;
    dialog.setAttribute("aria-label", label);
    dialog.classList.toggle("project-dialog", projectDetail);
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  }

  // Scroll the content before turning the page. Consume its momentum at the boundary.
  function scrollableAncestor(target, direction) {
    let element = target instanceof Element ? target : null;
    while (element && element !== document.body) {
      if (element.scrollHeight > element.clientHeight + 3) {
        const style = getComputedStyle(element);
        if (/(auto|scroll)/.test(style.overflowY)) {
          const hasRoom = direction > 0
            ? element.scrollTop + element.clientHeight < element.scrollHeight - 3
            : element.scrollTop > 3;
          if (hasRoom) return element;
        }
      }
      element = element.parentElement;
    }
    return null;
  }

  document.addEventListener("wheel", (event) => {
    if (dialog.open || event.ctrlKey || !event.deltaY || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    if (scrollableAncestor(event.target, Math.sign(event.deltaY))) {
      pager.consume(performance.now());
      return;
    }
    event.preventDefault();
    const direction = pager.feed(event, performance.now());
    if (direction) goTo(current + direction);
  }, { passive: false });

  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    if (link.classList.contains("skip-link")) {
      event.preventDefault();
      document.querySelector("#main").focus({ preventScroll: true });
      return;
    }
    const index = ids.indexOf(link.getAttribute("href").slice(1));
    if (index === -1) return;
    event.preventDefault();
    goTo(index);
  });

  previous.addEventListener("click", () => goTo(current - 1));
  next.addEventListener("click", () => goTo(current + 1));
  document.querySelector("#enterGarden").addEventListener("click", () => goTo(1));

  document.addEventListener("keydown", (event) => {
    if (dialog.open || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
    const forward = ["ArrowRight", "ArrowDown", "PageDown"].includes(event.key);
    const backward = ["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key);
    const nativeClick = event.target.closest("button,a,summary") && (event.key === " " || event.key === "Enter");
    if (nativeClick) return;
    const space = event.key === " ";
    if (forward || backward || space) {
      event.preventDefault();
      if (event.repeat) return;
      const direction = backward || (space && event.shiftKey) ? -1 : 1;
      if (!["ArrowRight", "ArrowLeft"].includes(event.key)) {
        const scroller = scrollableAncestor(pages[current], direction);
        if (scroller) {
          scroller.scrollBy({ top: direction * scroller.clientHeight * .75, behavior: reduceMotion.matches ? "instant" : "smooth" });
          return;
        }
      }
      goTo(current + direction);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      goTo(event.key === "Home" ? 0 : pages.length - 1);
    }
  });

  document.addEventListener("touchstart", (event) => {
    if (dialog.open || event.touches.length !== 1) return;
    const touch = event.touches[0];
    touchStart = { x: touch.clientX, y: touch.clientY, target: event.target };
    touchConsumed = false;
  }, { passive: true });
  document.addEventListener("touchmove", (event) => {
    if (!touchStart || event.touches.length !== 1) { touchStart = undefined; return; }
    const dy = touchStart.y - event.touches[0].clientY;
    if (scrollableAncestor(touchStart.target, Math.sign(dy))) touchConsumed = true;
  }, { passive: true });
  document.addEventListener("touchend", (event) => {
    if (!touchStart || dialog.open) return;
    const touch = event.changedTouches[0];
    const dx = touchStart.x - touch.clientX;
    const dy = touchStart.y - touch.clientY;
    const target = touchStart.target;
    touchStart = undefined;
    if (target.closest("button,a,summary,input,textarea,.garden-index")) return;
    if (Math.abs(dx) > 75 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      goTo(current + Math.sign(dx));
    } else if (Math.abs(dy) > 90 && Math.abs(dy) > Math.abs(dx) * 1.4 && !touchConsumed) {
      goTo(current + Math.sign(dy));
    }
  }, { passive: true });
  document.addEventListener("touchcancel", () => { touchStart = undefined; }, { passive: true });

  function hashIndex() {
    // Bookmarks from the earlier toolbox now lead to the combined greenhouse.
    if (window.location.hash === "#skills") window.history.replaceState(null, "", "#projects");
    return ids.indexOf(window.location.hash.slice(1));
  }
  function fromHash() {
    const target = hashIndex();
    if (target >= 0) goTo(target, { history: false });
    else if (!window.location.hash || window.location.hash !== "#main") goTo(0, { history: false });
  }
  window.addEventListener("hashchange", fromHash);
  window.addEventListener("popstate", fromHash);

  const storedTheme = (() => { try { return localStorage.getItem("color-garden-theme-v2"); } catch { return null; } })();
  let explicitTheme = storedTheme === "light" || storedTheme === "dark";
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const nextTheme = theme === "light" ? "夜间" : "日间";
    document.querySelector("#themeToggle").innerHTML = icon(theme === "light" ? "moon" : "sun");
    document.querySelector("#themeToggle").setAttribute("aria-label", `切换${nextTheme}主题`);
    document.querySelector('meta[name="theme-color"]').content = theme === "light" ? "#f7f7f2" : "#232831";
  }
  setTheme(explicitTheme ? storedTheme : systemTheme.matches ? "dark" : "light");
  systemTheme.addEventListener("change", (event) => { if (!explicitTheme) setTheme(event.matches ? "dark" : "light"); });
  document.querySelector("#themeToggle").addEventListener("click", () => {
    const theme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    explicitTheme = true;
    setTheme(theme);
    try { localStorage.setItem("color-garden-theme-v2", theme); } catch { /* Theme still works without storage. */ }
  });
  document.querySelector("#helpToggle").addEventListener("click", () => {
    openDialog(`<span class="handwritten">Make yourself at home.</span><h2>怎样逛这座花园</h2><ul><li>在封面花圃轻点种花，也可以按「种一朵」。最多种 24 朵，会保存在当前浏览器。</li><li>顶部春夏秋冬，可以改变花朵和整个花园的配色。</li><li>鼠标滚轮：向下翻到下一页，向上返回。</li><li>触控板：一次滑动只翻一页，惯性不会连跳。</li><li>长页面先滚动正文，读完后再滑动即可翻页。</li><li><kbd>←</kbd> <kbd>→</kbd> 直接翻页；<kbd>↑</kbd> <kbd>↓</kbd> 或空格逐屏阅读。</li><li><kbd>Home</kbd> 返回封面，<kbd>End</kbd> 到最后一页。</li><li>手机可左右滑动，或点击底部箭头。</li><li>目录可以直接跳转，浏览器后退也有效。</li></ul>`, "花园操作说明");
  });
  dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener("close", () => pager.lock(performance.now()));

  const projects = window.GARDEN_PROJECTS || [];
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[character]);
  }
  for (const button of document.querySelectorAll("[data-project]")) {
    button.addEventListener("click", () => {
      const project = projects.find((item) => item.slug === button.dataset.project);
      if (!project) { toast("项目资料暂时未加载，请刷新后重试。"); return; }
      const gallery = project.media.map((media) => `<figure>
        <a href="${escapeHTML(media.src)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(media.alt)}，打开原图（新窗口）">
          <img src="${escapeHTML(media.src)}" alt="${escapeHTML(media.alt)}" width="${media.width}" height="${media.height}">
        </a><figcaption>${escapeHTML(media.alt)}<span>查看原图 ↗</span></figcaption>
      </figure>`).join("");
      const background = project.background ? `<div class="project-context">
        <section><h3>为什么做</h3><p>${escapeHTML(project.background)}</p></section>
        <section><h3>希望解决什么</h3><p>${escapeHTML(project.goal)}</p></section>
      </div>` : `<section class="project-context"><div><h3>关于这个项目</h3><p>${escapeHTML(project.description)}</p></div></section>`;
      const workflow = project.workflow ? `<section class="project-workflow"><h3>怎样使用</h3><ol>${project.workflow.map((step) => `<li>${escapeHTML(step)}</li>`).join("")}</ol></section>` : "";
      openDialog(`<span class="eyebrow">项目温室 / ${escapeHTML(project.descriptor)}</span>
        <h2>${escapeHTML(project.title)}</h2><p class="project-summary">${escapeHTML(project.summary)}</p>
        <div class="project-links"><a class="garden-button" href="${escapeHTML(project.repositoryUrl)}" target="_blank" rel="noopener noreferrer">${icon("github")}查看源码</a>
          ${project.releaseUrl ? `<a class="garden-button secondary-button" href="${escapeHTML(project.releaseUrl)}" target="_blank" rel="noopener noreferrer">在线体验${icon("arrow-up-right")}</a>` : ""}
        </div>
        <div class="project-gallery${project.media.length > 1 ? " gallery-pair" : ""}">${gallery}</div>
        <div class="project-highlights">${project.highlights.map((item) => `<span>${escapeHTML(item)}</span>`).join("")}</div>
        ${background}${workflow}
        <section class="project-features"><h3>主要功能</h3><ul>${project.features.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul></section>`,
      project.title, true);
    });
  }

  document.querySelector("#envelopeButton").addEventListener("click", (event) => {
    const envelope = event.currentTarget;
    const open = envelope.classList.toggle("is-open");
    envelope.setAttribute("aria-expanded", String(open));
    envelope.setAttribute("aria-label", open ? "合上花园来信" : "打开花园来信");
  });

  function contactLink(kind, label, value, href) {
    const element = document.createElement(href ? "a" : "button");
    element.className = "contact-link";
    if (href) {
      element.href = href;
      if (kind === "github") { element.target = "_blank"; element.rel = "noopener noreferrer"; }
    } else {
      element.type = "button";
      element.addEventListener("click", () => toast("园丁还没有填写这个联系方式。"));
    }
    element.innerHTML = `${icon(kind)}<span class="link-label"><strong></strong><small></small></span>${icon("arrow-up-right")}`;
    element.querySelector("strong").textContent = label;
    element.querySelector("small").textContent = value;
    return element;
  }
  const github = typeof profile.github === "string" && /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(profile.github) ? profile.github : "";
  const email = typeof profile.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email) ? profile.email : "";
  const links = document.querySelector("#contactLinks");
  links.append(contactLink("github", "GitHub", github ? `@${github}` : "还没有填写账号", github ? `https://github.com/${github}` : ""));
  links.append(contactLink("mail", "Email", email || "还没有填写邮箱", email ? `mailto:${encodeURIComponent(email)}` : ""));
  if (email || github) document.querySelector("#contactSampleNote").textContent = "欢迎来聊聊你的新想法。";
  if (profile.siteName) document.title = `${profile.siteName} · A little wonder`;

  const initial = hashIndex();
  if (initial > 0) {
    goTo(initial, { history: false, animate: false, focus: false });
  } else {
    finishTransition();
    updateNavigation();
  }
})();

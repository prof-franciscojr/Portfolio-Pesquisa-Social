/* =========================================================================
   Portfólio de Aprendizagem — interatividade
   ========================================================================= */
(function () {
  "use strict";

  /* ---------------- Tema claro/escuro ---------------- */
  const THEME_KEY = "portfolio-pesquisa-social-theme";
  const themeToggle = document.getElementById("themeToggle");
  const root = document.documentElement;

  function applyTheme(theme) {
    if (theme === "light" || theme === "dark") {
      root.setAttribute("data-theme", theme);
    } else {
      root.removeAttribute("data-theme");
    }
  }
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) applyTheme(saved);
  } catch (e) { /* localStorage indisponível — segue com o padrão do sistema */ }

  themeToggle.addEventListener("click", () => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const current = root.getAttribute("data-theme") || (prefersDark ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  });

  /* ---------------- Mobile nav ---------------- */
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");
  navToggle.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  mainNav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      mainNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------------- Progress bar + scrollspy ---------------- */
  const progressBar = document.getElementById("progressBar");
  const navLinks = Array.from(document.querySelectorAll("[data-nav]"));
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  function onScroll() {
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const height = doc.scrollHeight - doc.clientHeight;
    progressBar.style.width = height > 0 ? `${(scrollTop / height) * 100}%` : "0%";

    let currentId = null;
    const probe = scrollTop + window.innerHeight * 0.3;
    sections.forEach((sec) => {
      if (sec.offsetTop <= probe) currentId = sec.id;
    });
    navLinks.forEach((a) =>
      a.classList.toggle("active", currentId && a.getAttribute("href") === `#${currentId}`)
    );

    document.getElementById("toTop").style.opacity = scrollTop > 500 ? "1" : "0";
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  document.getElementById("toTop").addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: "smooth" })
  );
  document.getElementById("scrollCue").addEventListener("click", () =>
    document.getElementById("trajetoria").scrollIntoView({ behavior: "smooth" })
  );

  /* ---------------- Reveal on scroll ---------------- */
  const revealTargets = document.querySelectorAll(
    ".tl-item, .summary-card, .recurso-card, .fich-card, .thesis-step, .seminario-card, .orientacao-grid"
  );
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "none";
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(16px)";
      el.style.transition = `opacity .5s ease ${(i % 6) * 0.04}s, transform .5s ease ${(i % 6) * 0.04}s`;
      io.observe(el);
    });
  }

  /* =========================================================================
     RECURSOS VISUAIS (vídeos e filme) — accordion
     ========================================================================= */
  const recursosContainer = document.getElementById("recursosContainer");

  function renderFichaTecnica(rows) {
    return `<table class="ficha-tecnica">${rows
      .map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`)
      .join("")}</table>`;
  }

  function renderRecursoCard(item, index) {
    const blocosHtml = item.blocos
      .map(
        (b) => `
        <h4 class="block-title">${b.titulo}</h4>
        ${b.paragrafos.map((p) => `<p>${p}</p>`).join("")}
      `
      )
      .join("");

    const teseHtml = item.sinteseTese
      ? `<div class="tese-box">
          <h4>${item.sinteseTese.titulo}</h4>
          ${item.sinteseTese.paragrafos.map((p) => `<p>${p}</p>`).join("")}
        </div>`
      : "";

    const refsHtml = item.referencias
      ? `<h4 class="block-title">Referências</h4><ul class="ref-list">${item.referencias
          .map((r) => `<li>${r}</li>`)
          .join("")}</ul>`
      : "";

    const card = document.createElement("article");
    card.className = "recurso-card";
    card.innerHTML = `
      <button class="recurso-head" data-recurso-toggle="${index}" aria-expanded="false">
        <span class="recurso-badge">${item.numero}</span>
        <span class="recurso-head-text">
          <h3>${item.titulo}</h3>
          <p>${item.tipo} · ${item.tags.slice(0, 3).join(" · ")}</p>
        </span>
        <span class="recurso-chevron" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 15.5 5 8.5l1.4-1.4L12 12.7l5.6-5.6L19 8.5z"/></svg>
        </span>
      </button>
      <div class="recurso-panel">
        <div class="recurso-panel-inner">
          <h4 class="block-title">Ficha técnica</h4>
          ${renderFichaTecnica(item.fichaTecnica)}
          <h4 class="block-title">Sinopse</h4>
          <p>${item.sinopse}</p>
          ${blocosHtml}
          ${teseHtml}
          ${refsHtml}
        </div>
      </div>
    `;
    return card;
  }

  RECURSOS_VISUAIS.forEach((item, i) => recursosContainer.appendChild(renderRecursoCard(item, i)));

  recursosContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-recurso-toggle]");
    if (!btn) return;
    const card = btn.closest(".recurso-card");
    const isOpen = card.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(isOpen));
  });

  /* =========================================================================
     FICHAMENTOS — grid, busca, filtros por tag, modal com abas
     ========================================================================= */
  const fichGrid = document.getElementById("fichamentosGrid");
  const fichSearch = document.getElementById("fichSearch");
  const fichTagsWrap = document.getElementById("fichTags");
  const fichCount = document.getElementById("fichCount");
  const fichEmpty = document.getElementById("fichEmpty");

  // Coleta as palavras-chave mais recorrentes para os chips de filtro
  const tagFrequency = {};
  FICHAMENTOS.forEach((f) =>
    (f.palavrasChave || []).forEach((t) => (tagFrequency[t] = (tagFrequency[t] || 0) + 1))
  );
  const topTags = Object.entries(tagFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([t]) => t);

  let activeTag = null;
  let searchTerm = "";

  function renderTagChips() {
    fichTagsWrap.innerHTML = topTags
      .map((t) => `<button class="tag-btn" data-tag="${t}">${t}</button>`)
      .join("");
  }
  renderTagChips();

  function matchesFilters(f) {
    const term = searchTerm.trim().toLowerCase();
    const haystack = [
      f.titulo,
      f.autor,
      f.area,
      f.ano,
      ...(f.palavrasChave || []),
    ]
      .join(" ")
      .toLowerCase();
    const termOk = !term || haystack.includes(term);
    const tagOk = !activeTag || (f.palavrasChave || []).includes(activeTag);
    return termOk && tagOk;
  }

  function renderFichamentoCard(f) {
    const card = document.createElement("button");
    card.className = "fich-card" + (f.destaque ? " destaque" : "");
    card.setAttribute("data-fich-open", f.id);
    card.innerHTML = `
      <div class="fich-card-top">
        <span class="fich-card-author">${f.autor}</span>
        <span class="fich-card-year">${f.ano}</span>
      </div>
      <h3>${f.titulo}</h3>
      <p class="fich-card-area">${f.area}</p>
      <div class="fich-card-tags">
        ${(f.palavrasChave || [])
          .slice(0, 4)
          .map((t) => `<span class="mini-tag">${t}</span>`)
          .join("")}
      </div>
      <span class="fich-card-cta">
        Ver fichamento completo
        <svg viewBox="0 0 24 24" width="15" height="15"><path fill="currentColor" d="M12.6 12 8 7.4 9.4 6l6 6-6 6L8 16.6z"/></svg>
      </span>
    `;
    return card;
  }

  function renderFichamentos() {
    const filtered = FICHAMENTOS.filter(matchesFilters);
    fichGrid.innerHTML = "";
    filtered.forEach((f) => fichGrid.appendChild(renderFichamentoCard(f)));
    fichCount.textContent = `${filtered.length} de ${FICHAMENTOS.length} fichamentos exibidos`;
    fichEmpty.hidden = filtered.length !== 0;
  }
  renderFichamentos();

  fichSearch.addEventListener("input", (e) => {
    searchTerm = e.target.value;
    renderFichamentos();
  });

  fichTagsWrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".tag-btn");
    if (!btn) return;
    const tag = btn.getAttribute("data-tag");
    activeTag = activeTag === tag ? null : tag;
    fichTagsWrap.querySelectorAll(".tag-btn").forEach((b) =>
      b.classList.toggle("active", b.getAttribute("data-tag") === activeTag)
    );
    renderFichamentos();
  });

  /* ---------------- Modal de fichamento ---------------- */
  const modalOverlay = document.getElementById("modalOverlay");
  const modalClose = document.getElementById("modalClose");
  const modalAutor = document.getElementById("modalAutor");
  const modalTitle = document.getElementById("modalTitle");
  const modalRef = document.getElementById("modalRef");
  const modalTabs = document.getElementById("modalTabs");
  const modalBody = document.getElementById("modalBody");

  function buildTabContent(f, tab) {
    if (tab === "identificacao") {
      const id = f.identificacao || {};
      const rows = [
        ["Tipo de obra", id.tipoObra],
        ["Título original", id.tituloOriginal],
        ["Capítulo / trecho", id.capitulo],
        ["Ano de publicação", id.ano],
        ["Editora", id.editora],
        ["Edição / impressão", id.edicao],
        ["Páginas", id.paginas],
        ["Localização da obra", id.localizacao],
      ].filter(([, v]) => v);
      const auto = f.autoria || {};
      const autoRows = [
        ["Autor(es)", auto.autores],
        ["Organizador(es)", auto.organizadores],
        ["Tradutor(es)", auto.tradutores],
      ].filter(([, v]) => v);
      return `
        <h4>Identificação da obra</h4>
        ${renderFichaTecnica(rows)}
        ${id.capituloNota ? `<p class="note">${id.capituloNota}</p>` : ""}
        ${id.anoNota ? `<p class="note">${id.anoNota}</p>` : ""}
        <h4>Autoria</h4>
        ${renderFichaTecnica(autoRows)}
        <p class="note">Referência completa: ${f.referencia}</p>
      `;
    }

    if (tab === "tematica") {
      return `
        <h4>Tema / área</h4>
        <p>${f.area}</p>
        <h4>Palavras-chave</h4>
        <div class="tag-row">${(f.palavrasChave || [])
          .map((t) => `<span class="mini-tag">${t}</span>`)
          .join("")}</div>
        <h4>Ideias principais</h4>
        <p>${f.ideiasPrincipais}</p>
        ${f.ideiasNota ? `<p class="note">${f.ideiasNota}</p>` : ""}
        <h4>Objetivo(s) do autor</h4>
        <p>${f.objetivoAutor}</p>
        ${f.objetivoNota ? `<p class="note">${f.objetivoNota}</p>` : ""}
      `;
    }

    if (tab === "trechos") {
      let html = "";
      if (f.trechos) {
        html += `<h4>Trechos relevantes</h4><div class="quote-list">${f.trechos
          .map((t) => `<div class="quote-item">${t}</div>`)
          .join("")}</div>`;
        if (f.trechosNota) html += `<p class="note">${f.trechosNota}</p>`;
      }
      if (f.subsecoes) {
        html += f.subsecoes
          .map(
            (s) => `
          <div class="subsection">
            <h5>${s.titulo}</h5>
            <p>${s.texto}</p>
            <div class="quote-list">${s.citacoes.map((c) => `<div class="quote-item">${c}</div>`).join("")}</div>
          </div>
        `
          )
          .join("");
      }
      html += `<h4>Conceitos utilizados</h4><p>${f.conceitos}</p>`;
      if (f.conceitosNota) html += `<p class="note">${f.conceitosNota}</p>`;
      html += `<h4>Outros autores/obras citados</h4><p>${f.outrosAutores}</p>`;
      return html;
    }

    if (tab === "glossario") {
      let html = `<h4>Palavras e conceitos novos</h4><p>${f.glossario || "Não indicado neste registro."}</p>`;
      if (f.glossarioNota) html += `<p class="note">${f.glossarioNota}</p>`;
      return html;
    }

    if (tab === "comentarios") {
      let html = `<h4>Impressões gerais</h4><p>${f.impressoes || "Não indicado neste registro."}</p>`;
      if (f.impressoesNota) html += `<p class="note">${f.impressoesNota}</p>`;
      if (f.duvidas) html += `<h4>Dúvidas para aula</h4><p>${f.duvidas}</p>`;
      if (f.creditoAdaptacao) html += `<p class="credit-note">${f.creditoAdaptacao}</p>`;
      return html;
    }
    return "";
  }

  const TABS = [
    { id: "identificacao", label: "Identificação" },
    { id: "tematica", label: "Temática" },
    { id: "trechos", label: "Trechos & Conceitos" },
    { id: "glossario", label: "Glossário" },
    { id: "comentarios", label: "Comentários" },
  ];

  let activeFich = null;
  let activeTabId = TABS[0].id;

  function renderModalTab() {
    modalBody.innerHTML = buildTabContent(activeFich, activeTabId);
    modalBody.scrollTop = 0;
    modalTabs.querySelectorAll(".modal-tab").forEach((b) =>
      b.classList.toggle("active", b.getAttribute("data-tab") === activeTabId)
    );
  }

  function openModal(id) {
    const f = FICHAMENTOS.find((x) => x.id === id);
    if (!f) return;
    activeFich = f;
    activeTabId = TABS[0].id;
    modalAutor.textContent = `${f.autor} · ${f.ano}`;
    modalTitle.textContent = f.titulo;
    modalRef.textContent = f.referencia;
    modalTabs.innerHTML = TABS.map(
      (t) => `<button class="modal-tab" data-tab="${t.id}">${t.label}</button>`
    ).join("");
    renderModalTab();
    modalOverlay.hidden = false;
    document.body.style.overflow = "hidden";
    modalClose.focus();
  }

  function closeModal() {
    modalOverlay.hidden = true;
    document.body.style.overflow = "";
  }

  fichGrid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-fich-open]");
    if (!btn) return;
    openModal(btn.getAttribute("data-fich-open"));
  });

  modalTabs.addEventListener("click", (e) => {
    const btn = e.target.closest(".modal-tab");
    if (!btn) return;
    activeTabId = btn.getAttribute("data-tab");
    renderModalTab();
  });

  modalClose.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modalOverlay.hidden) closeModal();
  });

  /* ---------------- Rodapé: nota metodológica ---------------- */
  document.getElementById("footerNote").textContent = NOTA_METODOLOGICA;

  /* =========================================================================
     SEMINÁRIO APRESENTADO — detecta se o PDF já foi anexado ao projeto
     ========================================================================= */
  (function checkSeminarioPdf() {
    const PDF_PATH = "assets/docs/seminario-pesquisa-social.pdf";
    const statusEl = document.getElementById("seminarioStatus");
    const linkEl = document.getElementById("seminarioLink");
    const badgeEl = document.getElementById("seminarioBadge");

    fetch(PDF_PATH, { method: "HEAD" })
      .then((res) => {
        if (res.ok) {
          statusEl.textContent = "PDF disponível para consulta e download.";
          linkEl.hidden = false;
        } else {
          throw new Error("not found");
        }
      })
      .catch(() => {
        statusEl.textContent = "Os slides ainda serão anexados a esta seção.";
        badgeEl.hidden = false;
      });
  })();
})();

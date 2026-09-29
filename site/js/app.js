/* Painel do Laboratório Digital — lê window.CATALOGO (gerado por scripts/catalogo.py). */
(() => {
  "use strict";

  const REPO = "https://github.com/WillianCoder/WillCoder01/tree/main/";
  const STATUS = {
    concluido: "🟢 Concluído",
    desenvolvimento: "🟡 Em desenvolvimento",
    planejado: "🔵 Planejado",
    teste: "🟠 Em teste",
    bloqueado: "🔴 Bloqueado",
    arquivado: "⚪ Arquivado",
  };
  const TIPOS = {
    projeto: "💻 Projeto",
    academico: "🎓 Acadêmico",
    estudo: "📚 Estudo",
    experimento: "🧪 Experimento",
    documentacao: "📖 Documentação",
    ideia: "💡 Ideia",
    conquista: "🏆 Conquista",
    arquivo: "📦 Arquivo",
  };

  const catalogo = window.CATALOGO || { perfil: {}, estatisticas: {}, itens: [] };
  const itens = catalogo.itens;
  const perfil = catalogo.perfil;
  const $ = (sel) => document.querySelector(sel);

  /* ---------- Utilidades ---------- */
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const ano = (item) => (item.data || "").slice(0, 4);
  const normalizar = (t) => String(t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const badge = (s) => `<span class="badge s-${esc(s)}">${esc((STATUS[s] || s).replace(/^\S+\s/, ""))}</span>`;
  const chips = (lista) => (lista || []).map((t) => `<span class="chip">${esc(t)}</span>`).join("");
  const vazio = (msg, cmd) => `<div class="empty">${msg}${cmd ? `<br><code>${esc(cmd)}</code>` : ""}</div>`;
  const aDefinir = '<span class="a-definir">a definir</span>';

  function card(item, extra = "") {
    const i = itens.indexOf(item);
    const progresso = item.estudo?.progresso;
    return `
      <article class="card${item.destaque ? " destaque" : ""}">
        <div class="card-top"><span>${TIPOS[item.tipo] || esc(item.tipo)}${ano(item) ? " · " + ano(item) : ""}</span>${badge(item.status)}</div>
        <h3><button type="button" data-item="${i}">${esc(item.titulo)}</button></h3>
        <p>${esc(item.resumo)}</p>
        ${typeof progresso === "number" ? `<div class="progress" role="progressbar" aria-label="Progresso" aria-valuenow="${progresso}" aria-valuemin="0" aria-valuemax="100"><span style="width:${Math.min(100, Math.max(0, progresso))}%"></span></div>` : ""}
        ${extra}
        <div class="chips">${chips(item.tecnologias)}</div>
      </article>`;
  }

  /* ---------- Perfil (placeholders, nunca inventa dados) ---------- */
  function renderPerfil() {
    document.querySelectorAll("[data-perfil]").forEach((el) => {
      const v = perfil[el.dataset.perfil];
      if (v) el.textContent = v;
      else if (el.tagName === "P" && el.closest("#sobre")) el.innerHTML = `${aDefinir} — edite <code>perfil.json</code>`;
    });
    document.querySelectorAll("[data-lista]").forEach((el) => {
      const lista = perfil[el.dataset.lista] || [];
      el.innerHTML = lista.length
        ? lista.map((v) => (el.tagName === "UL" ? `<li>${esc(v)}</li>` : `<span class="chip">${esc(v)}</span>`)).join("")
        : el.tagName === "UL" ? `<li>${aDefinir}</li>` : aDefinir;
    });

    const links = perfil.links || {};
    const rotulos = { github: "GitHub", linkedin: "LinkedIn", portfolio: "Portfólio", email: "E-mail" };
    const href = (k, v) => (k === "email" ? `mailto:${v}` : v);
    $("#hero-links").innerHTML = Object.entries(rotulos).map(([k, r], n) => links[k]
      ? `<a class="btn${n ? " ghost" : ""}" href="${esc(href(k, links[k]))}" rel="noopener">${r}</a>`
      : `<span class="btn ghost placeholder" title="Ainda não informado">${r} · a definir</span>`).join("");
    $("#contatos").innerHTML = Object.entries(rotulos).map(([k, r]) =>
      `<li><strong>${r}:</strong> ${links[k] ? `<a href="${esc(href(k, links[k]))}" rel="noopener">${esc(links[k])}</a>` : aDefinir}</li>`).join("");
  }

  /* ---------- Dashboard ---------- */
  function renderDashboard() {
    const s = catalogo.estatisticas;
    const blocos = [
      ["Projetos", s.projetos, "var(--pac)"],
      ["Concluídos", s.concluidos, "var(--ok)"],
      ["Em desenvolvimento", s.desenvolvimento, "var(--pac)"],
      ["Acadêmicos", s.academicos, "var(--maze)"],
      ["Estudos", s.estudos, "var(--maze)"],
      ["Experimentos", s.experimentos, "var(--test)"],
      ["Tecnologias", (s.tecnologias || []).length, "var(--maze)"],
      ["Documentos", s.documentos, "var(--doc)"],
    ];
    $("#stats").innerHTML = blocos.map(([rotulo, n, c]) =>
      `<div class="stat" style="--c:${c}"><div class="stat-num">${n ?? 0}</div><div class="stat-label">${rotulo}</div></div>`).join("");
    $("#gerado").textContent = catalogo.gerado || "—";

    $("#tecs").innerHTML = (s.tecnologias || []).length
      ? s.tecnologias.map((t) => `<button type="button" class="chip" data-tec="${esc(t)}">${esc(t)}</button>`).join("")
      : aDefinir;
    $("#recentes").innerHTML = itens.slice(0, 6).map((it) =>
      `<li><button type="button" data-item="${itens.indexOf(it)}">${esc(it.titulo)}</button><span class="muted small mono">${esc(it.atualizado || it.data || "")}</span></li>`).join("")
      || `<li class="muted">Nenhum item ainda.</li>`;
  }

  /* ---------- Portfólio ---------- */
  function renderPortfolio() {
    const lista = itens.filter((i) => i.destaque);
    const perguntas = [["problema", "Qual problema resolve?"], ["desenvolvido", "O que foi desenvolvido?"],
      ["participacao", "Minha participação"], ["resultado", "Resultado"]];
    $("#lista-portfolio").innerHTML = lista.length
      ? lista.map((it) => card(it, `<dl class="qa">${perguntas.filter(([k]) => it.portfolio?.[k])
          .map(([k, q]) => `<dt>${q}</dt><dd>${esc(it.portfolio[k])}</dd>`).join("")}</dl>`)).join("")
      : vazio('Nenhum projeto em destaque ainda. Marque <code>"destaque": true</code> no <code>meta.json</code> de um projeto pronto para apresentar.');
  }

  /* ---------- Estudos e Acadêmico ---------- */
  function renderEstudos() {
    const lista = itens.filter((i) => i.tipo === "estudo");
    $("#lista-estudos").innerHTML = lista.length ? lista.map((it) => card(it)).join("")
      : vazio("Nenhum estudo registrado ainda. Para começar:", 'python scripts/novo.py estudo "Assunto"');
  }

  function renderAcademico() {
    const lista = itens.filter((i) => i.tipo === "academico");
    if (!lista.length) {
      $("#lista-academico").innerHTML = vazio("Nenhum trabalho acadêmico registrado ainda. Para adicionar:",
        'python scripts/novo.py academico "Tema" --disciplina "Disciplina" --semestre 2026-2');
      return;
    }
    const grupos = {};
    lista.forEach((it) => (grupos[it.academico?.semestre || "Sem semestre"] ??= []).push(it));
    $("#lista-academico").innerHTML = Object.keys(grupos).sort().reverse().map((sem) => `
      <div class="semestre"><h3>${esc(sem)}</h3><div class="cards">${grupos[sem].map((it) =>
        card(it, it.academico?.disciplina ? `<p class="small">📘 ${esc(it.academico.disciplina)}</p>` : "")).join("")}</div></div>`).join("");
  }

  /* ---------- Busca e filtros ---------- */
  const filtros = {
    tipo: { el: $("#f-tipo"), valor: (i) => [i.tipo], rotulo: (v) => TIPOS[v] || v },
    status: { el: $("#f-status"), valor: (i) => [i.status], rotulo: (v) => STATUS[v] || v },
    tec: { el: $("#f-tec"), valor: (i) => i.tecnologias || [] },
    cat: { el: $("#f-cat"), valor: (i) => (i.categoria ? [i.categoria] : []) },
    ano: { el: $("#f-ano"), valor: (i) => (ano(i) ? [ano(i)] : []) },
  };

  function montarFiltros() {
    Object.values(filtros).forEach((f) => {
      const valores = [...new Set(itens.flatMap(f.valor))].sort((a, b) => a.localeCompare(b, "pt-BR"));
      f.el.insertAdjacentHTML("beforeend", valores.map((v) => `<option value="${esc(v)}">${esc(f.rotulo ? f.rotulo(v) : v)}</option>`).join(""));
    });
  }

  const textoBusca = (i) => normalizar([i.titulo, i.resumo, i.categoria, i.tipo, i.caminho, ...(i.tecnologias || []),
    i.academico?.disciplina, i.academico?.professor, i.academico?.semestre].filter(Boolean).join(" "));

  function aplicarBusca() {
    const termos = normalizar($("#busca").value).split(/\s+/).filter(Boolean);
    const resultado = itens.filter((i) =>
      Object.values(filtros).every((f) => !f.el.value || f.valor(i).includes(f.el.value)) &&
      termos.every((t) => textoBusca(i).includes(t)));
    $("#lista-explorar").innerHTML = resultado.length ? resultado.map((it) => card(it)).join("")
      : vazio(itens.length ? "Nenhum resultado para esses filtros. ᗧ···" : "O labirinto ainda está vazio. Adicione o primeiro item:",
          itens.length ? "" : 'python scripts/novo.py projeto "Nome"');
    $("#contagem").textContent = `${resultado.length} de ${itens.length} itens`;
  }

  /* ---------- Detalhe ---------- */
  function abrirDetalhe(item) {
    const linhas = [
      ["Tipo", TIPOS[item.tipo] || item.tipo], ["Status", STATUS[item.status] || item.status],
      ["Categoria", item.categoria], ["Versão", item.versao && "v" + item.versao], ["Nível", item.nivel],
      ["Criado em", item.data], ["Atualizado em", item.atualizado],
      ["Disciplina", item.academico?.disciplina], ["Professor(a)", item.academico?.professor],
      ["Semestre", item.academico?.semestre], ["Integrantes", (item.academico?.integrantes || []).join(", ")],
      ["Progresso", typeof item.estudo?.progresso === "number" && item.estudo.progresso + "%"],
      ["Pasta", item.caminho],
    ].filter(([, v]) => v);
    const links = item.links || {};
    $("#det-corpo").innerHTML = `
      <h2 id="det-titulo">${esc(item.titulo)}</h2>
      <p class="muted">${esc(item.resumo)}</p>
      <table>${linhas.map(([k, v]) => `<tr><th scope="row">${k}</th><td>${esc(v)}</td></tr>`).join("")}</table>
      <div class="chips">${chips(item.tecnologias)}</div>
      <p class="hero-links" style="margin-top:1rem">
        <a class="btn" href="${REPO}${esc(item.caminho)}" rel="noopener">Ver pasta e README</a>
        ${links.demo ? `<a class="btn ghost" href="${esc(links.demo)}" rel="noopener">Demonstração</a>` : ""}
        ${links.repositorio ? `<a class="btn ghost" href="${esc(links.repositorio)}" rel="noopener">Repositório</a>` : ""}
      </p>`;
    $("#detalhe").showModal();
  }

  /* ---------- Preferências: tema, movimento, menu ---------- */
  const salvar = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* armazenamento indisponível */ } };
  const raiz = document.documentElement;
  const reduzido = matchMedia("(prefers-reduced-motion: reduce)");
  const movimentoPausado = () => raiz.dataset.motion === "off" || (reduzido.matches && raiz.dataset.motion !== "on");

  function sincronizarBotaoMovimento() {
    const btn = $("#btn-movimento");
    const pausado = movimentoPausado();
    btn.setAttribute("aria-pressed", String(pausado));
    btn.textContent = pausado ? "▶" : "⏸";
    btn.title = btn.ariaLabel = pausado ? "Retomar animações" : "Pausar animações";
  }

  function ligarControles() {
    $("#btn-tema").addEventListener("click", () => {
      raiz.dataset.theme = raiz.dataset.theme === "light" ? "dark" : "light";
      salvar("tema", raiz.dataset.theme);
    });
    $("#btn-movimento").addEventListener("click", () => {
      raiz.dataset.motion = movimentoPausado() ? "on" : "off";
      salvar("movimento", raiz.dataset.motion);
      sincronizarBotaoMovimento();
    });
    sincronizarBotaoMovimento();

    const menuBtn = $(".menu-btn");
    const menu = $("#menu");
    menuBtn.addEventListener("click", () => {
      const aberto = menu.classList.toggle("aberto");
      menuBtn.setAttribute("aria-expanded", String(aberto));
    });
    menu.addEventListener("click", (e) => {
      if (e.target.closest("a")) { menu.classList.remove("aberto"); menuBtn.setAttribute("aria-expanded", "false"); }
    });

    document.addEventListener("click", (e) => {
      const alvo = e.target.closest("[data-item]");
      if (alvo) abrirDetalhe(itens[Number(alvo.dataset.item)]);
      const tec = e.target.closest("[data-tec]");
      if (tec) { filtros.tec.el.value = tec.dataset.tec; aplicarBusca(); $("#explorar").scrollIntoView(); }
    });

    const form = $("#filtros");
    form.addEventListener("input", aplicarBusca);
    form.addEventListener("reset", () => setTimeout(aplicarBusca));
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) {
        e.preventDefault(); $("#busca").focus();
      }
    });

    // Destaca no menu a seção visível
    const links = [...menu.querySelectorAll('a[href^="#"]')];
    const observador = new IntersectionObserver((entradas) => entradas.forEach((en) => {
      if (en.isIntersecting) links.forEach((a) => a.setAttribute("aria-current", String(a.hash === "#" + en.target.id)));
    }), { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main > section").forEach((s) => observador.observe(s));
  }

  /* ---------- Easter egg discreto: código Konami deixa os fantasmas azuis ---------- */
  function easterEgg() {
    const codigo = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let pos = 0;
    document.addEventListener("keydown", (e) => {
      pos = e.key === codigo[pos] ? pos + 1 : e.key === codigo[0] ? 1 : 0;
      if (pos < codigo.length) return;
      pos = 0;
      const maze = $(".maze");
      maze.classList.add("assustados");
      setTimeout(() => maze.classList.remove("assustados"), 6000);
    });
    console.log("%cᗧ··· 👻  Bem-vindo ao laboratório. Tente o código Konami.", "color:#f5c518;font-weight:bold");
  }

  renderPerfil();
  renderDashboard();
  renderPortfolio();
  renderEstudos();
  renderAcademico();
  montarFiltros();
  aplicarBusca();
  ligarControles();
  easterEgg();
})();

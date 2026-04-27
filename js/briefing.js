// 1. IMPORTAÇÕES DO FIREBASE (Sintaxe Modular v9+)
import { storage } from "./firebase.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js";

const CAROL_WA = "5511912986866";
const STORAGE_KEY = "carol-briefing-v3";
// Limite de 5MB para upload de arquivos
const MAX_FILE_SIZE = 5 * 1024 * 1024; 

// ── CURSOR & ANIMAÇÕES ────────────────────────────────────────────────
const $cur = document.getElementById("cursor");
const $fol = document.getElementById("follower");
let mx = 0,
  my = 0,
  fx = 0,
  fy = 0;
document.addEventListener("mousemove", (e) => {
  mx = e.clientX;
  my = e.clientY;
  $cur.style.transform = `translate(${mx - 5}px,${my - 5}px)`;
});
document.addEventListener("mouseover", (e) => {
  const h = !!e.target.closest(
    "a,button,input,textarea,label,select,[role=button]",
  );
  $cur.classList.toggle("hovering", h);
  $fol.classList.toggle("hovering", h);
});
(function tick() {
  fx += (mx - fx) * 0.14;
  fy += (my - fy) * 0.14;
  $fol.style.transform = `translate(${fx - 18}px,${fy - 18}px)`;
  requestAnimationFrame(tick);
})();

// ── SECTIONS CONFIG ────────────────────────────────────────
const SECS = [
  { id: "sec-1", num: "01", title: "O Negócio", dot: "var(--dot-gray)", critical: false },
  { id: "sec-2", num: "02", title: "Escopo & Objetivos", dot: "var(--dot-purple)", critical: false },
  { id: "sec-3", num: "03", title: "Experiência & Emoção", dot: "var(--dot-coral)", critical: false },
  { id: "sec-4", num: "04", title: "Direção Visual", dot: "var(--dot-blue)", critical: true },
  { id: "sec-5", num: "05", title: "Entrega & Processo", dot: "var(--dot-green)", critical: false },
  { id: "sec-6", num: "06", title: "Encerramento", dot: "var(--dot-gray)", critical: false },
];

const sNav = document.getElementById("sidebarNav");
SECS.forEach((s, i) => {
  const btn = document.createElement("button");
  btn.className = "sidebar-item";
  btn.dataset.idx = i;
  btn.innerHTML = `<span class="sidebar-dot" style="background:${s.dot}" id="sdot${i}"></span><span class="sidebar-num">${s.num}</span><span class="sidebar-title">${s.title}</span>${s.critical ? '<span class="sidebar-critical">crítico</span>' : ""}<span class="sidebar-check" id="scheck${i}" style="display:none">✓</span>`;
  btn.addEventListener("click", () =>
    document.getElementById(s.id).scrollIntoView({ behavior: "smooth", block: "start" })
  );
  sNav.appendChild(btn);
});

// ── PROGRESS ──────────────────────────────────────────────
function calcProgress() {
  const d = readForm();
  const c = [
    !!(d.siteAtual || d.portfolioLink || d.portfolioFileName),
    !!(d.objetivo && d.funcionalidades.length > 0 && d.textosStatus),
    d.sentimentos.length > 0,
    !!(d.esteticas.length > 0 || d.coresAma || d.referencias),
    !!(d.apresentacao && d.participacao && d.prazo),
    !!(d.nome && d.email && d.whatsapp),
  ];
  return {
    pct: Math.round((c.filter(Boolean).length / c.length) * 100),
    checks: c,
  };
}

function updateProgress() {
  const { pct, checks } = calcProgress();
  const s = pct + "%";
  document.getElementById("progressFill").style.width = s;
  document.getElementById("sidebarFill").style.width = s;
  document.getElementById("sidebarPct").textContent = s;
  document.getElementById("mobileProgFill").style.width = s;
  document.getElementById("mobilePct").textContent = s;
  checks.forEach((done, i) => {
    const el = document.getElementById("scheck" + i);
    if (el) el.style.display = done ? "flex" : "none";
    const btn = sNav.children[i];
    if (btn) btn.style.color = done ? "var(--text)" : "";
  });
}

let activeIdx = 0;
const secEls = SECS.map((s) => document.getElementById(s.id));
const secObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const i = secEls.indexOf(e.target);
        if (i >= 0) {
          activeIdx = i;
          updateActiveSidebar(i);
        }
      }
    });
  },
  { threshold: 0.25 }
);
secEls.forEach((el) => el && secObs.observe(el));

function updateActiveSidebar(i) {
  Array.from(sNav.children).forEach((b, j) => b.classList.toggle("active", j === i));
  const s = SECS[i];
  document.getElementById("mobileDot").style.background = s.dot;
  document.getElementById("mobileNum").textContent = s.num;
  document.getElementById("mobileTitle").textContent = s.title;
}
updateActiveSidebar(0);

const revObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        revObs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.1 }
);
document.querySelectorAll(".reveal").forEach((el) => revObs.observe(el));

// ── INTERACTIVE CONTROLS ──────────────────────────────────
document.querySelectorAll(".radio-card").forEach((card) => {
  card.addEventListener("click", () => {
    const input = card.querySelector("input[type=radio]");
    document
      .querySelectorAll(`input[name="${input.name}"]`)
      .forEach((inp) => inp.closest(".radio-card").classList.remove("selected"));
    input.checked = true;
    card.classList.add("selected");
    saveDraftDebounced();
    updateProgress();
  });
});

document.querySelectorAll(".check-item").forEach((item) => {
  item.addEventListener("click", (e) => {
    const input = item.querySelector("input[type=checkbox]");
    if (e.target !== input) input.checked = !input.checked;
    item.classList.toggle("checked", input.checked);
    saveDraftDebounced();
    updateProgress();
  });
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    chip.classList.toggle("active");
    saveDraftDebounced();
    updateProgress();
  });
});

function toggleAes(val) {
  document.querySelector(`.aes-card[data-val="${val}"]`).classList.toggle("selected");
  saveDraftDebounced();
  updateProgress();
}

document.querySelectorAll("input[type=range]").forEach((r) =>
  r.addEventListener("input", () => {
    saveDraftDebounced();
    updateProgress();
  })
);

document
  .querySelectorAll("input[type=text],input[type=email],input[type=tel],input[type=url],textarea")
  .forEach((el) => {
    el.addEventListener("input", () => {
      saveDraftDebounced();
      updateProgress();
    });
  });

function openZoom(e, src) {
  e.stopPropagation();
  document.getElementById("zoomImg").src = src;
  document.getElementById("zoomModal").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeZoom() {
  document.getElementById("zoomModal").classList.remove("open");
  document.body.style.overflow = "";
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeZoom();
});

function setPrazo(v) {
  document.getElementById("prazo").value = v;
  saveDraftDebounced();
  updateProgress();
}

// ── FILE UPLOAD COM VALIDAÇÃO DE TAMANHO ──────────────────
let uploadedFile = null;
function handleDragOver(e) {
  e.preventDefault();
  document.getElementById("dropzone").classList.add("dragover");
}
function handleDragLeave() {
  document.getElementById("dropzone").classList.remove("dragover");
}
function handleDrop(e) {
  e.preventDefault();
  document.getElementById("dropzone").classList.remove("dragover");
  const f = e.dataTransfer.files[0];
  if (f) setFile(f);
}
function handleFileSelect(e) {
  const f = e.target.files[0];
  if (f) setFile(f);
}
function setFile(f) {
  if (f.size > MAX_FILE_SIZE) {
    alert("O arquivo selecionado excede o limite de 5MB. Por favor, envie um arquivo menor.");
    // Limpa o input se o arquivo foi escolhido via botão
    const inputEl = document.getElementById("fileInput");
    if (inputEl) inputEl.value = "";
    return;
  }
  
  uploadedFile = f;
  document.getElementById("dropzoneFile").textContent = `✓ ${f.name}`;
  saveDraftDebounced();
  updateProgress();
}

// ── READ FORM ─────────────────────────────────────────────
function readForm() {
  return {
    siteAtual: v("siteAtual"),
    linkedin: v("linkedin"),
    instagram: v("instagram"),
    portfolioLink: v("portfolioLink"),
    portfolioFileName: uploadedFile ? uploadedFile.name : "",
    objetivo: radio("objetivo"),
    funcionalidades: checked("func"),
    textosStatus: radio("textosStatus"),
    sentimentos: activeChips(),
    personalidade: {
      conservadoraModerna: +document.getElementById("sliderModerna").value,
      popularPremium: +document.getElementById("sliderPremium").value,
      formalDescontraida: +document.getElementById("sliderDescontraida").value,
    },
    esteticas: activeAes(),
    coresAma: v("coresAma"),
    coresOdeia: v("coresOdeia"),
    referencias: v("referencias"),
    apresentacao: radio("apresentacao"),
    participacao: radio("participacao"),
    prazo: v("prazo"),
    nome: v("nome"),
    email: v("email"),
    whatsapp: v("whatsapp"),
    observacoes: v("observacoes"),
  };
}

function v(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}
function radio(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : "";
}
function checked(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map((e) => e.value);
}
function activeChips() {
  return [...document.querySelectorAll(".chip.active")].map((c) => c.dataset.val);
}
function activeAes() {
  return [...document.querySelectorAll(".aes-card.selected")].map((c) => c.dataset.val);
}

// ── AUTO-SAVE ─────────────────────────────────────────────
let saveTimer;
function saveDraftDebounced() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveDraft, 500);
}
function saveDraft() {
  try {
    const d = readForm();
    d._sm = document.getElementById("sliderModerna").value;
    d._sp = document.getElementById("sliderPremium").value;
    d._sd = document.getElementById("sliderDescontraida").value;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
    showToastSave();
  } catch (e) {}
}
function showToastSave() {
  const t = document.getElementById("toastSave");
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), 2200);
}
function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    const set = (id, v) => {
      const el = document.getElementById(id);
      if (el && v) el.value = v;
    };
    set("siteAtual", d.siteAtual);
    set("linkedin", d.linkedin);
    set("instagram", d.instagram);
    set("portfolioLink", d.portfolioLink);
    set("coresAma", d.coresAma);
    set("coresOdeia", d.coresOdeia);
    set("referencias", d.referencias);
    set("prazo", d.prazo);
    set("nome", d.nome);
    set("email", d.email);
    set("whatsapp", d.whatsapp);
    set("observacoes", d.observacoes);
    if (d.portfolioFileName)
      document.getElementById("dropzoneFile").textContent = `✓ ${d.portfolioFileName}`;

    const setR = (name, val) => {
      if (!val) return;
      const i = document.querySelector(`input[name="${name}"][value="${val}"]`);
      if (i) {
        i.checked = true;
        i.closest(".radio-card").classList.add("selected");
      }
    };
    setR("objetivo", d.objetivo);
    setR("textosStatus", d.textosStatus);
    setR("apresentacao", d.apresentacao);
    setR("participacao", d.participacao);

    (d.funcionalidades || []).forEach((val) => {
      const i = document.querySelector(`input[name="func"][value="${val}"]`);
      if (i) {
        i.checked = true;
        i.closest(".check-item").classList.add("checked");
      }
    });
    (d.sentimentos || []).forEach((val) => {
      const c = document.querySelector(`.chip[data-val="${val}"]`);
      if (c) c.classList.add("active");
    });
    (d.esteticas || []).forEach((val) => {
      const c = document.querySelector(`.aes-card[data-val="${val}"]`);
      if (c) c.classList.add("selected");
    });

    if (d._sm) document.getElementById("sliderModerna").value = d._sm;
    if (d._sp) document.getElementById("sliderPremium").value = d._sp;
    if (d._sd) document.getElementById("sliderDescontraida").value = d._sd;
    return true;
  } catch (e) {
    return false;
  }
}
function clearDraftAndReload() {
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

// ── VALIDATION ────────────────────────────────────────────
function validate() {
  let ok = true;
  const d = readForm();
  function err(errId, fieldId, show) {
    const e = document.getElementById(errId);
    const f = document.getElementById(fieldId);
    if (e) e.classList.toggle("show", show);
    if (f) f.classList.toggle("error", show);
    if (show) ok = false;
  }
  const nomeOk = d.nome.length >= 2;
  err("err-nome", "nome", !nomeOk);
  const emailOk = /\S+@\S+\.\S+/.test(d.email);
  err("err-email", "email", !emailOk);
  const waOk = d.whatsapp.length >= 8;
  err("err-whatsapp", "whatsapp", !waOk);

  const objEl = document.getElementById("err-objetivo");
  if (objEl) objEl.classList.toggle("show", !d.objetivo);
  if (!d.objetivo) ok = false;

  const txtEl = document.getElementById("err-textos");
  if (txtEl) txtEl.classList.toggle("show", !d.textosStatus);
  if (!d.textosStatus) ok = false;

  if (!ok) {
    const first = document.querySelector(".field-error.show,.error");
    if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  return ok;
}

// ── PDF GENERATION ────────────────────────────────────────
function sliderLbl(v, l, r) {
  if (v < 35) return `${l} (${v})`;
  if (v > 65) return `${r} (${v})`;
  return `Equilibrado (${v})`;
}

async function generatePDF(d) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210, PX = 18;
  let y = 20;
  const acRGB = [200, 245, 100], dk = [10, 10, 10], mt = [100, 96, 90], txtC = [30, 30, 30];

  doc.setFillColor(...dk);
  doc.rect(0, 0, W, 28, "F");
  doc.setFillColor(...acRGB);
  doc.rect(0, 26, W, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(240, 237, 232);
  doc.text("Briefing Estratégico", PX, 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...mt);
  doc.text("Carol Gonzaga · Desenvolvedora Web Fullstack", W - PX, 17, { align: "right" });
  doc.text(`Enviado em ${new Date().toLocaleString("pt-BR")}`, W - PX, 23, { align: "right" });
  y = 38;

  function secTitle(title, rgb) {
    if (y > 258) { doc.addPage(); y = 20; }
    doc.setFillColor(...(rgb || acRGB));
    doc.rect(PX, y, 3, 5.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...dk);
    doc.text(title, PX + 7, y + 4.5);
    y += 12;
    doc.setDrawColor(228, 228, 228);
    doc.line(PX, y, W - PX, y);
    y += 5;
  }
  function row(lbl, val) {
    if (!val) return;
    if (y > 268) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...mt);
    doc.text(lbl.toUpperCase(), PX, y);
    y += 4.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...txtC);
    const lines = doc.splitTextToSize(val, W - PX * 2 - 4);
    doc.text(lines, PX + 4, y);
    y += lines.length * 5 + 4;
  }

  secTitle("01 · O Negócio", [90, 90, 90]);
  row("Site atual", d.siteAtual);
  row("LinkedIn", d.linkedin);
  row("Instagram", d.instagram);
  row("Portfólio / Link", d.portfolioLink);
  row("Arquivo enviado", d.portfolioFileName);
  y += 2;

  secTitle("02 · Escopo & Objetivos", [124, 106, 245]);
  const objM = {
    "captar-leads": "Captar leads qualificados",
    vender: "Vender produtos/serviços",
    autoridade: "Construir autoridade",
    informar: "Informar e educar",
  };
  row("Objetivo principal", objM[d.objetivo] || d.objetivo);
  row("Funcionalidades", d.funcionalidades.join(", ") || "—");
  const txtM = { prontos: "Textos prontos", rascunho: "Tem rascunho", "nao-tenho": "Não tem textos ainda" };
  row("Status dos textos", txtM[d.textosStatus] || d.textosStatus);
  y += 2;

  secTitle("03 · Experiência & Emoção", [245, 100, 100]);
  row("Sentimentos desejados", d.sentimentos.join(", ") || "—");
  row("Conservadora ↔ Moderna", sliderLbl(d.personalidade.conservadoraModerna, "Conservadora", "Moderna"));
  row("Popular ↔ Premium", sliderLbl(d.personalidade.popularPremium, "Popular", "Premium"));
  row("Formal ↔ Descontraída", sliderLbl(d.personalidade.formalDescontraida, "Formal", "Descontraída"));
  y += 2;

  secTitle("04 · Direção Visual", [100, 168, 245]);
  const aeM = { clean: "Clean & Minimal", dark: "Dark Premium", bold: "Bold Modern", editorial: "Editorial / Creative" };
  row("Estéticas", d.esteticas.map((e) => aeM[e] || e).join(", ") || "—");
  row("Cores que ama", d.coresAma);
  row("Cores que odeia", d.coresOdeia);
  row("Referências", d.referencias);
  y += 2;

  secTitle("05 · Entrega & Processo", [100, 245, 168]);
  const apM = { prototipo: "Protótipo (Figma)", direto: "Desenvolvimento direto", indiferente: "Indiferente" };
  const paM = { ativo: "Ativo — cada etapa", moderado: "Moderado — marcos", confia: "Confia totalmente" };
  row("Apresentação", apM[d.apresentacao] || d.apresentacao);
  row("Participação", paM[d.participacao] || d.participacao);
  row("Prazo", d.prazo);
  y += 2;

  secTitle("06 · Encerramento", [90, 90, 90]);
  row("Nome", d.nome);
  row("E-mail", d.email);
  row("WhatsApp", d.whatsapp);
  row("Observações", d.observacoes);
  y += 6;

  if (y > 270) { doc.addPage(); y = 20; }
  doc.setFillColor(...dk);
  doc.rect(0, 285, W, 12, "F");
  doc.setFillColor(...acRGB);
  doc.rect(0, 283, W, 2, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...mt);
  doc.text("carolgonzaga.site · dev.carolgonzaga@gmail.com", W / 2, 291, { align: "center" });
  return doc;
}

function buildText(d, anexoUrl = "") {
  const aM = {
    clean: "Clean & Minimal",
    dark: "Dark Premium",
    bold: "Bold Modern",
    editorial: "Editorial / Creative",
  };
  
  const linkDoAnexo = anexoUrl ? `\n• Link do Anexo: ${anexoUrl}` : `\n• Arquivo enviado: ${d.portfolioFileName || "—"}`;

  return `📋 BRIEFING ESTRATÉGICO — Carol Gonzaga\nData: ${new Date().toLocaleString("pt-BR")}\n\n👤 CLIENTE\n• Nome: ${d.nome}\n• E-mail: ${d.email}\n• WhatsApp: ${d.whatsapp}\n\n🌐 01 · O NEGÓCIO\n• Site atual: ${d.siteAtual || "—"}\n• LinkedIn: ${d.linkedin || "—"}\n• Instagram: ${d.instagram || "—"}\n• Portfólio: ${d.portfolioLink || "—"}${linkDoAnexo}\n\n🎯 02 · ESCOPO & OBJETIVOS\n• Objetivo: ${d.objetivo || "—"}\n• Funcionalidades: ${d.funcionalidades.join(", ") || "—"}\n• Status textos: ${d.textosStatus || "—"}\n\n💫 03 · EXPERIÊNCIA & EMOÇÃO\n• Sentimentos: ${d.sentimentos.join(", ") || "—"}\n• Personalidade: Conserv↔Mod ${d.personalidade.conservadoraModerna} | Pop↔Prem ${d.personalidade.popularPremium} | Form↔Desc ${d.personalidade.formalDescontraida}\n\n🎨 04 · DIREÇÃO VISUAL\n• Estéticas: ${d.esteticas.map((e) => aM[e] || e).join(", ") || "—"}\n• Cores que ama: ${d.coresAma || "—"}\n• Cores que odeia: ${d.coresOdeia || "—"}\n• Referências: ${d.referencias || "—"}\n\n⏱ 05 · ENTREGA & PROCESSO\n• Apresentação: ${d.apresentacao || "—"}\n• Participação: ${d.participacao || "—"}\n• Prazo: ${d.prazo || "—"}\n\n📝 OBSERVAÇÕES\n${d.observacoes || "—"}`;
}

// ── UPLOAD PDF PARA FIREBASE ───────────────────────────
async function uploadPDF(d, doc) {
  const blob = doc.output("blob");
  const firstName = d.nome.trim().split(" ")[0] || "cliente";
  const fileName = `briefings/${Date.now()}-${firstName.toLowerCase()}.pdf`;

  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, blob);
  return await getDownloadURL(storageRef);
}

// ── UPLOAD ANEXO PARA FIREBASE ─────────────────────────
async function uploadAttachment(file, d) {
  if (!file) return null;
  const firstName = d.nome.trim().split(" ")[0] || "cliente";
  const ext = file.name.split('.').pop();
  const fileName = `anexos/${Date.now()}-${firstName.toLowerCase()}.${ext}`;

  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// ── SUBMIT ────────────────────────────────────────────────
async function submitBriefing() {
  if (!validate()) return;
  const d = readForm();
  document.getElementById("sendingOverlay").classList.add("active");
  document.getElementById("submitBtn").disabled = true;

  try {
    const firstName = d.nome.trim().split(" ")[0] || "cliente";

    // 1) Gerar PDF
    const doc = await generatePDF(d);

    // 2) Download automático para o cliente
    doc.save(`briefing-${firstName.toLowerCase()}-${Date.now()}.pdf`);

    // 3) Upload PDF para Firebase
    const pdfUrl = await uploadPDF(d, doc);

    // 3.5) Upload do Anexo para Firebase (se existir)
    let anexoUrl = "";
    if (uploadedFile) {
      anexoUrl = await uploadAttachment(uploadedFile, d);
    }

    // 4) Disparar o EmailJS
    const txt = buildText(d, anexoUrl);
    await emailjs.send("service_x97grzf", "template_xo174rn", {
      nome: d.nome,
      email: d.email,
      pdf_url: pdfUrl,
      anexo_url: anexoUrl, 
      resumo: txt,
    });

    // 5) Abrir WhatsApp
    const waMsg = encodeURIComponent(
      `🌿 *Novo Briefing Recebido*\n\n${txt.substring(0, 1500)}${txt.length > 1500 ? "\n\n[...PDF enviado via Email]" : ""}`
    );
    window.open(`https://wa.me/${CAROL_WA}?text=${waMsg}`, "_blank");

    // 6) Build orcamento URL params
    const params = new URLSearchParams({
      nome: d.nome,
      email: d.email,
      whatsapp: d.whatsapp,
      objetivo: d.objetivo,
      features: d.funcionalidades.join(","),
      prazo: d.prazo,
      apresentacao: d.apresentacao,
    });

    // 7) Limpar rascunho
    localStorage.removeItem(STORAGE_KEY);

    // 8) Mostrar tela de sucesso
    document.getElementById("sendingOverlay").classList.remove("active");
    document.getElementById("formMain").style.display = "none";

    const ss = document.getElementById("successScreen");
    ss.classList.add("active");
    document.getElementById("successName").textContent = firstName;
    document.getElementById("successEmail").textContent = d.email;

    const waTxt = encodeURIComponent(`Olá Carol! Acabei de enviar o briefing ✦\nNome: ${d.nome}`);
    document.getElementById("waSuccessBtn").href = `https://wa.me/${CAROL_WA}?text=${waTxt}`;

    // 9) Redirect to orcamento
    setTimeout(() => {
      window.location.href = `/orcamento.html?${params.toString()}`;
    }, 3500);
  } catch (err) {
    console.error("Erro no processamento:", err);
    document.getElementById("sendingOverlay").classList.remove("active");
    document.getElementById("submitBtn").disabled = false;
    alert("Ocorreu um erro ao processar. Por favor, tente novamente.");
  }
}

// ── EXPOR FUNÇÕES PARA O HTML (MUITO IMPORTANTE!) ─────────
window.submitBriefing = submitBriefing;
window.clearDraftAndReload = clearDraftAndReload;
window.toggleAes = toggleAes;
window.openZoom = openZoom;
window.closeZoom = closeZoom;
window.setPrazo = setPrazo;
window.handleDragOver = handleDragOver;
window.handleDragLeave = handleDragLeave;
window.handleDrop = handleDrop;
window.handleFileSelect = handleFileSelect;

// ── INIT ──────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  const hasDraft = loadDraft();
  updateProgress();
  if (hasDraft) {
    const tr = document.getElementById("toastRestore");
    tr.classList.add("show");
    setTimeout(() => tr.classList.remove("show"), 6000);
  }
});
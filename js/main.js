document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
});

// Custom cursor
const cursor = document.getElementById("cursor");
const follower = document.getElementById("follower");
let mx = 0,
  my = 0,
  fx = 0,
  fy = 0;
document.addEventListener("mousemove", (e) => {
  mx = e.clientX;
  my = e.clientY;
  cursor.style.transform =
    "translate(" + (mx - 5) + "px," + (my - 5) + "px)";
});
function animFollower() {
  fx += (mx - fx) * 0.12;
  fy += (my - fy) * 0.12;
  follower.style.transform =
    "translate(" + (fx - 18) + "px," + (fy - 18) + "px)";
  requestAnimationFrame(animFollower);
}
animFollower();

// Nav scroll
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 40);
});

// Reveal on scroll
const reveals = document.querySelectorAll(
  "section > *:not(.section-label)",
);
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.1 },
);
document
  .querySelectorAll(
    ".about-grid, .services-grid, .process-list, .stats-grid, .stack-scroll, .contact-h2, .contact-sub, .contact-links, .portfolio-header, .portfolio-grid, #openModalBtn",
  )
  .forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });

// =========================================
// Modal & Formulário de Contato
// =========================================
const modal = document.getElementById("contactModal");
const openBtn = document.getElementById("openModalBtn");
const closeBtn = document.getElementById("closeModalBtn");
const form = document.getElementById("contactForm");

// Abrir modal
openBtn.addEventListener("click", () => {
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
});

// Fechar no X
closeBtn.addEventListener("click", () => {
  modal.classList.remove("active");
  document.body.style.overflow = "";
});

// Fechar clicando fora do box
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
});

// Fechar com Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    // Fecha modal de contato
    if (modal.classList.contains("active")) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
    // Fecha lightbox de portfólio
    closeLightbox();
  }
});

// Simular Envio do Formulário
form.addEventListener("submit", function (e) {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  const nome = form.nome.value.trim();
  const email = form.email.value.trim();
  const msg = form.mensagem.value.trim();

  if (!nome || !email || !msg) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  btn.textContent = "Enviando…";
  btn.style.opacity = "0.7";
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = "✓ Mensagem enviada!";
    btn.style.background = "var(--text)";
    btn.style.color = "var(--bg)";
    btn.style.opacity = "1";
    form.reset();

    setTimeout(() => {
      btn.textContent = "Enviar mensagem";
      btn.style.background = "";
      btn.style.color = "";
      btn.disabled = false;
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }, 3000);
  }, 1200);
});

// =========================================
// Lightbox de Portfólio — CORRIGIDO
// =========================================
let lightboxOverlay = null;

function openLightbox(src, alt) {
  // Remove qualquer lightbox existente
  closeLightbox();

  // Trava scroll do fundo
  document.body.style.overflow = "hidden";

  // Cria overlay
  lightboxOverlay = document.createElement("div");
  lightboxOverlay.id = "lightbox-overlay";
  lightboxOverlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(10, 10, 10, 0.95);
    z-index: 9000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    box-sizing: border-box;
    animation: fadeIn 0.25s ease;
    cursor: zoom-out;
  `;

  // Cria imagem
  const img = document.createElement("img");
  img.src = src;
  img.alt = alt || "";
  img.style.cssText = `
    max-width: min(90vw, 1200px);
    max-height: 85vh;
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 4px;
    display: block;
    cursor: default;
    box-shadow: 0 24px 80px rgba(0,0,0,0.8);
  `;

  // Cria botão de fechar — SEMPRE visível e acessível
  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "×";
  closeBtn.setAttribute("aria-label", "Fechar imagem");
  closeBtn.style.cssText = `
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 9001;
    width: 44px;
    height: 44px;
    background: rgba(240, 237, 232, 0.95);
    color: #0a0a0a;
    border: none;
    border-radius: 50%;
    font-size: 1.6rem;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    transition: background 0.2s, transform 0.2s;
    font-family: sans-serif;
  `;
  closeBtn.addEventListener("mouseenter", () => {
    closeBtn.style.background = "#c8f564";
    closeBtn.style.transform = "scale(1.1)";
  });
  closeBtn.addEventListener("mouseleave", () => {
    closeBtn.style.background = "rgba(240, 237, 232, 0.95)";
    closeBtn.style.transform = "scale(1)";
  });
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeLightbox();
  });

  // Fechar ao clicar no overlay (fora da imagem)
  lightboxOverlay.addEventListener("click", () => closeLightbox());
  // Impede fechar ao clicar na imagem em si
  img.addEventListener("click", (e) => e.stopPropagation());

  lightboxOverlay.appendChild(img);
  document.body.appendChild(lightboxOverlay);
  document.body.appendChild(closeBtn);

  // Salva referência ao botão para remoção
  lightboxOverlay._closeBtn = closeBtn;
}

function closeLightbox() {
  if (lightboxOverlay) {
    if (lightboxOverlay._closeBtn) lightboxOverlay._closeBtn.remove();
    lightboxOverlay.remove();
    lightboxOverlay = null;
    document.body.style.overflow = "";
  }
}

// Inicializa lightbox nos itens do portfólio com imagens reais
document.querySelectorAll(".portfolio-item").forEach((item) => {
  const img = item.querySelector("img");
  if (!img) return; // Só ativa se houver imagem real

  item.style.cursor = "zoom-in";
  item.addEventListener("click", () => {
    openLightbox(img.src, img.alt);
  });
});

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
        document.body.style.overflow = "hidden"; // Trava o scroll do fundo
      });

      // Fechar no X
      closeBtn.addEventListener("click", () => {
        modal.classList.remove("active");
        document.body.style.overflow = ""; // Libera o scroll
      });

      // Fechar clicando fora do box
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("active");
          document.body.style.overflow = "";
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

        /* Animação de enviando */
        btn.textContent = "Enviando…";
        btn.style.opacity = "0.7";
        btn.disabled = true;

        setTimeout(() => {
          btn.textContent = "✓ Mensagem enviada!";
          btn.style.background = "var(--text)";
          btn.style.color = "var(--bg)";
          btn.style.opacity = "1";
          form.reset();

          /* Fecha modal automaticamente após 3 segundos */
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
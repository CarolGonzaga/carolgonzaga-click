      /* ------ Ano dinâmico ------ */
      document.getElementById("year").textContent = new Date().getFullYear();

      /* ------ Navbar scroll ------ */
      const navbar = document.getElementById("navbar");
      window.addEventListener(
        "scroll",
        () => {
          navbar.classList.toggle("scrolled", window.scrollY > 40);
        },
        { passive: true },
      );

      /* ------ Menu mobile ------ */
      const hamburger = document.getElementById("hamburger");
      const navMobile = document.getElementById("navMobile");
      const navClose = document.getElementById("navClose");

      function openMenu() {
        hamburger.classList.add("open");
        navMobile.classList.add("open");
        navMobile.setAttribute("aria-hidden", "false");
        hamburger.setAttribute("aria-expanded", "true");
        document.body.style.overflow = "hidden";
      }
      function closeMenu() {
        hamburger.classList.remove("open");
        navMobile.classList.remove("open");
        navMobile.setAttribute("aria-hidden", "true");
        hamburger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
      hamburger.addEventListener("click", openMenu);
      navClose.addEventListener("click", closeMenu);

      /* ------ Scroll Reveal ------ */
      const revealEls = document.querySelectorAll(".reveal");
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
      );
      revealEls.forEach((el) => revealObserver.observe(el));

      /* ------ Formulário ------ */
      const form = document.getElementById("contactForm");
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

        /* Simula envio */
        btn.textContent = "Enviando…";
        btn.disabled = true;
        setTimeout(() => {
          btn.innerHTML = "✓ Mensagem enviada!";
          btn.style.background = "#2a9d5c";
          form.reset();
          setTimeout(() => {
            btn.innerHTML =
              'Enviar mensagem <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
            btn.style.background = "";
            btn.disabled = false;
          }, 3500);
        }, 1200);
      });
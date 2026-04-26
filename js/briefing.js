document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("briefingForm");
  if (!form) return;

  const inputs = form.querySelectorAll("input, textarea, select");
  const uploadBtn = document.getElementById("uploadBtn");
  const fileInput = document.getElementById("fileInput");
  const uploadText = document.querySelector("#uploadBtn span");
  const progressFills = document.querySelectorAll(".progress-bar-fill");
  const progressTexts = document.querySelectorAll(".progress-value, .mobile-progress-text");
  
  let formData = JSON.parse(localStorage.getItem("briefingDraft")) || {
    objetivo: "", sentimentos: [], esteticas: [], funcionalidades: []
  };

  // Toast de rascunho restaurado
  if(localStorage.getItem("briefingDraft")) {
    const toast = document.getElementById("draftToast");
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 4000);
  }

  const saveDraft = () => {
    localStorage.setItem("briefingDraft", JSON.stringify(formData));
    updateProgress();
  };

  // Bind inputs text/select
  inputs.forEach(input => {
    input.addEventListener("input", (e) => {
      if (e.target.type !== "radio" && e.target.type !== "checkbox" && e.target.type !== "file") {
        formData[e.target.name] = e.target.value;
        if(e.target.required && e.target.value) e.target.classList.remove("error");
        saveDraft();
      }
    });
  });

  // Radios (Cards)
  document.querySelectorAll('.radio-card input[type="radio"]').forEach(radio => {
    radio.addEventListener("change", (e) => {
      const group = e.target.closest('.grid-2, .space-y-2\\.5');
      group.querySelectorAll(".radio-card").forEach(card => card.classList.remove("selected"));
      if (e.target.checked) {
        e.target.closest(".radio-card").classList.add("selected");
        formData[e.target.name] = e.target.value;
        saveDraft();
      }
    });
  });

  // Checkboxes (Cards)
  document.querySelectorAll('.checkbox-card input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener("change", (e) => {
      const card = e.target.closest(".checkbox-card");
      card.classList.toggle("selected");
      const val = e.target.value;
      
      if (!formData.funcionalidades) formData.funcionalidades = [];
      if (e.target.checked) {
        formData.funcionalidades.push(val);
      } else {
        formData.funcionalidades = formData.funcionalidades.filter(v => v !== val);
      }
      saveDraft();
    });
  });

  // Chips (Sentimentos)
  document.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", function() {
      this.classList.toggle("active");
      const val = this.dataset.value;
      if (this.classList.contains("active")) {
        formData.sentimentos.push(val);
      } else {
        formData.sentimentos = formData.sentimentos.filter(v => v !== val);
      }
      saveDraft();
    });
  });

  // Estéticas
  document.querySelectorAll(".aesthetics-card").forEach(card => {
    card.addEventListener("click", function() {
      this.classList.toggle("active");
      const val = this.dataset.value;
      if (this.classList.contains("active")) {
        formData.esteticas.push(val);
      } else {
        formData.esteticas = formData.esteticas.filter(v => v !== val);
      }
      saveDraft();
    });
  });

  // Upload Simulado
  uploadBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", function() {
    if (this.files[0]) {
      uploadText.textContent = this.files[0].name;
      uploadBtn.classList.add("has-file");
      formData.hasFile = true;
      saveDraft();
    }
  });

  // ----------------------------------------------------
  // Sidebar e Progresso
  // ----------------------------------------------------
  const sections = document.querySelectorAll(".section-card");
  const sidebarLinks = document.querySelectorAll(".sidebar-link");

  const updateProgress = () => {
    let stepsCompleted = [false, false, false, false, false, false];

    if (formData.siteAtual || formData.linkedin || formData.hasFile) stepsCompleted[0] = true;
    if (formData.objetivo) stepsCompleted[1] = true;
    if (formData.sentimentos.length > 0) stepsCompleted[2] = true;
    if (formData.esteticas.length > 0 || formData.referencias) stepsCompleted[3] = true;
    if (formData.prazo) stepsCompleted[4] = true;
    if (formData.nome && formData.email && formData.whatsapp) stepsCompleted[5] = true;

    // Atualiza Checkmarks na Sidebar
    sidebarLinks.forEach((link, idx) => {
      if(stepsCompleted[idx]) {
        link.classList.add("completed");
      } else {
        link.classList.remove("completed");
      }
    });

    const totalDone = stepsCompleted.filter(Boolean).length;
    const percentage = Math.round((totalDone / 6) * 100);
    
    progressFills.forEach(fill => fill.style.width = `${percentage}%`);
    progressTexts.forEach(text => text.textContent = `${percentage}%`);
  };

  // ScrollSpy
  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (scrollY >= sectionTop - 200) {
        current = section.getAttribute("id");
      }
    });

    sidebarLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
        
        // Mobile Header Sync
        document.getElementById("mobile-num").textContent = link.querySelector(".num").textContent;
        document.getElementById("mobile-title").textContent = link.textContent.replace(/[0-9]/g, '').replace('crítico', '').trim();
        document.getElementById("mobile-dot").style.background = link.querySelector(".sidebar-dot-wrap").style.background;
      }
    });
  });

  // Submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const requiredFields = ["nome", "email", "whatsapp"];
    let isValid = true;

    requiredFields.forEach(field => {
      const el = document.querySelector(`input[name="${field}"]`);
      if (!el.value.trim()) {
        el.classList.add("error");
        isValid = false;
      } else {
        el.classList.remove("error");
      }
    });

    if (!isValid) {
      document.getElementById("sec-6").scrollIntoView({ behavior: "smooth" });
      return;
    }

    const btn = document.getElementById("btnSubmitBriefing");
    btn.innerHTML = `<span class="h-2 w-2 rounded-full bg-background animate-ping" style="display:inline-block; margin-right:8px;"></span> Enviando...`;
    btn.style.opacity = "0.7";

    setTimeout(() => {
      localStorage.removeItem("briefingDraft");
      document.getElementById("successScreen").style.display = "flex";
      window.scrollTo(0,0);
    }, 1500);
  });

  // Restaura dados se houver (visualização simplificada)
  updateProgress();
});
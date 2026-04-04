(function () {
  document.documentElement.classList.add("js");

  const body = document.body;
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const loadingButtons = document.querySelectorAll("[data-loading-button]");
  const contactForm = document.querySelector("[data-contact-form]");
  const formSubmit = document.querySelector("[data-form-submit]");
  const formStatus = document.querySelector("[data-form-status]");
  let savedTheme = null;

  // --- Theme Management ---
  try {
    savedTheme = window.localStorage.getItem("portfolio-theme");
  } catch (error) {
    savedTheme = null;
  }

  if (savedTheme === "light" || savedTheme === "dark") {
    body.dataset.theme = savedTheme;
  }

  function syncThemeLabel() {
    if (!themeToggle) return;
    themeToggle.textContent = body.dataset.theme === "dark" ? "Light mode" : "Dark mode";
  }

  syncThemeLabel();

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme = body.dataset.theme === "dark" ? "light" : "dark";
      body.dataset.theme = nextTheme;
      try {
        window.localStorage.setItem("portfolio-theme", nextTheme);
      } catch (error) {}
      syncThemeLabel();
    });
  }

  // --- Navigation ---
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const isOpen = body.dataset.navOpen === "true";
      body.dataset.navOpen = String(!isOpen);
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      navToggle.textContent = isOpen ? "Menu" : "Close";
    });
  }

  // --- Stat Counter Animation ---
  function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const value = Math.floor(progress * (end - start) + start);
      obj.innerHTML = value + (obj.dataset.suffix || "");
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  // --- Reveal on Scroll ---
  const revealItems = document.querySelectorAll(".reveal");
  if (revealItems.length && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          
          // Trigger stat animation if it is a stat card
          const statValue = entry.target.querySelector("strong[data-stat-value]");
          if (statValue) {
            const endValue = parseInt(statValue.dataset.statValue, 10);
            animateValue(statValue, 0, endValue, 1500);
          }
          
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  // --- Magnetic Buttons & Micro-interactions ---
  const magneticElements = document.querySelectorAll(".button--primary, .brand__mark");
  magneticElements.forEach(el => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });
    
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });

  // --- Contact Form ---
  if (contactForm && formSubmit) {
    contactForm.addEventListener("submit", (event) => {
      if (!contactForm.checkValidity()) return;
      event.preventDefault();

      const name = contactForm.elements.name.value.trim();
      const email = contactForm.elements.email.value.trim();
      const message = contactForm.elements.message.value.trim();
      const subject = `Project Inquiry${name ? " - " + name : ""}`;
      const mailtoUrl = `mailto:myemail@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;

      formSubmit.classList.add("is-loading");
      formSubmit.setAttribute("aria-busy", "true");

      if (formStatus) {
        formStatus.hidden = false;
        formStatus.textContent = "Your email client should open now...";
      }

      window.location.href = mailtoUrl;
      setTimeout(() => {
        formSubmit.classList.remove("is-loading");
        formSubmit.removeAttribute("aria-busy");
      }, 1200);
    });
  }

  // --- Image Lightbox Modal ---
  const imageModal = document.getElementById("image-modal");
  const modalImg = document.getElementById("image-modal-img");
  const modalClose = document.getElementById("image-modal-close");
  const galleryImages = document.querySelectorAll(".gallery-item img");

  if (imageModal && modalImg && galleryImages.length > 0) {
    function openModal(src, alt) {
      modalImg.src = src;
      modalImg.alt = alt;
      imageModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    function closeModal() {
      imageModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      setTimeout(() => { modalImg.src = ""; }, 300); // Clear after fade out
    }

    galleryImages.forEach(img => {
      img.addEventListener("click", () => {
        openModal(img.src, img.alt);
      });
    });

    if (modalClose) {
      modalClose.addEventListener("click", closeModal);
    }

    // Close on background click
    imageModal.addEventListener("click", (e) => {
      if (e.target === imageModal) {
        closeModal();
      }
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && imageModal.getAttribute("aria-hidden") === "false") {
        closeModal();
      }
    });
  }
})();

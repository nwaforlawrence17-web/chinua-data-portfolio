(function () {
  document.documentElement.classList.add("js");

  const body = document.body;
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const loadingButtons = document.querySelectorAll("[data-loading-button]");
  const contactForm = document.querySelector("[data-contact-form]");
  const formSubmit = document.querySelector("[data-form-submit]");
  const formStatus = document.querySelector("[data-form-status]");
  const mobileLayoutQuery = "(max-width: 768px), (hover: none) and (pointer: coarse) and (orientation: portrait) and (max-width: 1200px)";
  const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
  const isMobileLayout = () => window.matchMedia(mobileLayoutQuery).matches;
  const isReducedMotion = () => window.matchMedia(reducedMotionQuery).matches;
  let mobileOptimizedMotion = isMobileLayout() || isReducedMotion();
  let savedTheme = null;

  const revealItems = document.querySelectorAll(".reveal");
  let revealObserver = null;

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function optimizeMediaForMobile() {
    if (!mobileOptimizedMotion) return;

    document.querySelectorAll("img").forEach((img) => {
      if (!img.hasAttribute("loading")) {
        img.setAttribute("loading", "lazy");
      }
      img.setAttribute("decoding", "async");
    });

    document.querySelectorAll("video").forEach((video) => {
      video.preload = "none";
      video.autoplay = false;
      video.removeAttribute("autoplay");
    });
  }

  function setupReveals() {
    if (!revealItems.length) return;

    // Clean up existing triggers/observers to prevent memory leaks and conflicts
    if (window.ScrollTrigger && typeof window.ScrollTrigger.getAll === "function") {
      window.ScrollTrigger.getAll().forEach((t) => t.kill());
    }
    if (revealObserver) {
      revealObserver.disconnect();
      revealObserver = null;
    }

    const canUseGsap = !mobileOptimizedMotion && window.gsap && window.ScrollTrigger;

    if (canUseGsap) {
      window.gsap.registerPlugin(window.ScrollTrigger);
      revealItems.forEach((item) => {
        if (item.classList.contains("is-visible")) return;

        window.gsap.set(item, { autoAlpha: 0, y: 18, willChange: "transform,opacity" });
        window.gsap.to(item, {
          autoAlpha: 1,
          y: 0,
          duration: 0.62,
          ease: "power2.out",
          clearProps: "transform,opacity,willChange",
          scrollTrigger: {
            trigger: item,
            start: "top 88%",
            once: true,
            onEnter: () => {
              item.classList.add("is-visible");
              triggerStatAnimation(item);
            }
          }
        });
      });
    } else if ("IntersectionObserver" in window) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          triggerStatAnimation(entry.target);
          revealObserver.unobserve(entry.target);
        });
      }, {
        threshold: mobileOptimizedMotion ? 0.06 : 0.15,
        rootMargin: mobileOptimizedMotion ? "0px 0px -6% 0px" : "0px"
      });

      revealItems.forEach((item) => {
        if (item.classList.contains("is-visible")) return;
        item.style.willChange = "transform, opacity";
        revealObserver.observe(item);
      });
    } else {
      revealItems.forEach((item) => {
        item.classList.add("is-visible");
        triggerStatAnimation(item);
      });
    }
  }

  function syncMotionMode() {
    const previousMode = mobileOptimizedMotion;
    mobileOptimizedMotion = isMobileLayout() || isReducedMotion();
    document.documentElement.classList.toggle("is-mobile-optimized", mobileOptimizedMotion);

    if (previousMode !== mobileOptimizedMotion) {
      setupReveals();
      if (mobileOptimizedMotion) {
        optimizeMediaForMobile();
      }
    }
  }

  syncMotionMode();
  setupReveals();
  optimizeMediaForMobile();

  window.addEventListener("resize", debounce(syncMotionMode, 150), { passive: true });
  window.addEventListener("orientationchange", syncMotionMode);

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

  // --- Smooth Anchor Scrolling ---
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
      target.scrollIntoView({ behavior, block: "start" });

      if (history.replaceState) {
        history.replaceState(null, "", href);
      }
    });
  });

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

  function triggerStatAnimation(element) {
    const statValue = element.querySelector("strong[data-stat-value]");
    if (!statValue || statValue.dataset.animated === "true") return;
    const endValue = parseInt(statValue.dataset.statValue, 10);
    if (Number.isNaN(endValue)) return;
    statValue.dataset.animated = "true";
    animateValue(statValue, 0, endValue, mobileOptimizedMotion ? 900 : 1500);
  }

  // --- Magnetic Buttons & Micro-interactions ---
  const magneticElements = document.querySelectorAll(".button--primary, .brand__mark");
  const supportsHover = window.matchMedia("(hover: hover)").matches;
  if (!mobileOptimizedMotion && supportsHover) {
    magneticElements.forEach((el) => {
      el.style.willChange = "transform";
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate3d(${x * 0.15}px, ${y * 0.15}px, 0)`;
      });

      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  }

  // --- Contact Form ---
  if (contactForm && formSubmit) {
    contactForm.addEventListener("submit", (event) => {
      if (!contactForm.checkValidity()) return;
      event.preventDefault();

      const name = contactForm.elements.name.value.trim();
      const email = contactForm.elements.email.value.trim();
      const message = contactForm.elements.message.value.trim();
      const subject = `Project Inquiry${name ? " - " + name : ""}`;
      const mailtoUrl = `mailto:nwaforlawrence17@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;

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
      if (!isMobileLayout()) {
        document.body.style.overflow = "hidden";
      }
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

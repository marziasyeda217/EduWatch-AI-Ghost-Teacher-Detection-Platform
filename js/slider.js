// EduWatch 3D Multi-Image Educational Showcase Slider with Text Animations

class EduSlider {
  constructor() {
    this.slides = [
      {
        url: "img/classroom-primary.jpg",
        title: "Govt. Primary School Model Town, Lahore",
        urduTitle: "کلاس روم میں استاد کی موجودگی اور تدریس جاری ہے",
        badgeText: "Primary Mathematics & Alphabets",
        status: "✓ Teacher Verified Present (In-Class)",
        location: "Lahore, Punjab"
      },
      {
        url: "img/teacher-grammar.jpg",
        title: "Govt. Girls High School Satellite Town, Rawalpindi",
        urduTitle: "انگریزی گرامر اور تدریسی عمل کی براہِ راست نگرانی",
        badgeText: "Grade 8 English & Grammar Lecture",
        status: "✓ Active Lesson Verified",
        location: "Rawalpindi, Punjab"
      },
      {
        url: "img/students-group.jpg",
        title: "Govt. Comprehensive High School, Sukkur",
        urduTitle: "طالبات اور اساتذہ کا سو فیصد تصدیق شدہ حاضری ریکارڈ",
        badgeText: "Geography & General Science",
        status: "✓ 100% Verified Staff Attendance",
        location: "Sukkur, Sindh"
      },
      {
        url: "img/kindergarten-learning.jpg",
        title: "Govt. Early Childhood Learning Center, Peshawar",
        urduTitle: "ابتدائی تعلیم اور اساتذہ کی باقاعدہ جانچ پڑتال",
        badgeText: "Early Childhood & Activity Lab",
        status: "✓ Geofence Confirmed (15m from Gate)",
        location: "Peshawar, KPK"
      }
    ];

    this.currentIndex = 0;
    this.intervalId = null;
    this.isPaused = false;
  }

  init() {
    this.container = document.getElementById("hero-slider-images");
    this.dotsContainer = document.getElementById("hero-slider-dots");
    this.captionTitle = document.getElementById("hero-slider-title");
    this.captionUrdu = document.getElementById("hero-slider-urdu");
    this.captionBadge = document.getElementById("hero-slider-badge");
    this.floatingBadgeText = document.getElementById("floating-badge-status");

    if (!this.container) return;

    this.renderSlides();
    this.startAutoPlay();
    this.bindEvents();
  }

  renderSlides() {
    this.container.innerHTML = this.slides.map((s, idx) => `
      <img 
        src="${s.url}" 
        alt="${s.title}" 
        class="slider-img absolute inset-0 w-full h-full object-cover rounded-2xl ${idx === 0 ? 'active' : 'inactive'}"
        data-index="${idx}"
      />
    `).join("");

    if (this.dotsContainer) {
      this.dotsContainer.innerHTML = this.slides.map((_, idx) => `
        <button 
          onclick="window.EduWatchSlider.goToSlide(${idx})"
          class="slider-dot w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === 0 ? 'bg-sea-400 w-8' : 'bg-white/40 hover:bg-white/80'}"
          title="Slide ${idx + 1}">
        </button>
      `).join("");
    }

    this.updateCaptions(0);
  }

  bindEvents() {
    const wrapper = document.getElementById("hero-slider-wrapper");
    if (wrapper) {
      wrapper.addEventListener("mouseenter", () => this.pause());
      wrapper.addEventListener("mouseleave", () => this.resume());
    }
    const prevBtn = document.getElementById("hero-slider-prev");
    const nextBtn = document.getElementById("hero-slider-next");
    if (prevBtn) prevBtn.addEventListener("click", (e) => { e.stopPropagation(); this.prevSlide(); });
    if (nextBtn) nextBtn.addEventListener("click", (e) => { e.stopPropagation(); this.nextSlide(); });
  }

  prevSlide() {
    const prev = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prev);
  }

  goToSlide(index) {
    if (index === this.currentIndex) return;

    const images = this.container.querySelectorAll(".slider-img");
    const dots = this.dotsContainer ? this.dotsContainer.querySelectorAll(".slider-dot") : [];

    images[this.currentIndex]?.classList.remove("active");
    images[this.currentIndex]?.classList.add("inactive");

    if (dots[this.currentIndex]) {
      dots[this.currentIndex].className = "slider-dot w-2.5 h-2.5 rounded-full bg-white/40 hover:bg-white/80 transition-all duration-300";
    }

    this.currentIndex = index;

    images[this.currentIndex]?.classList.remove("inactive");
    images[this.currentIndex]?.classList.add("active");

    if (dots[this.currentIndex]) {
      dots[this.currentIndex].className = "slider-dot w-8 h-2.5 rounded-full bg-sea-400 transition-all duration-300";
    }

    this.updateCaptions(this.currentIndex);
  }

  updateCaptions(index) {
    const s = this.slides[index];
    
    // Animate text with subtle pulse/fade-in
    const animateEl = (el, text) => {
      if (!el) return;
      el.classList.add("opacity-0", "translate-y-1");
      setTimeout(() => {
        el.textContent = text;
        el.classList.remove("opacity-0", "translate-y-1");
        el.classList.add("opacity-100", "translate-y-0");
      }, 150);
    };

    animateEl(this.captionTitle, s.title);
    animateEl(this.captionUrdu, s.urduTitle);
    animateEl(this.captionBadge, s.badgeText);
    animateEl(this.floatingBadgeText, s.status);
  }

  nextSlide() {
    const next = (this.currentIndex + 1) % this.slides.length;
    this.goToSlide(next);
  }

  startAutoPlay() {
    this.intervalId = setInterval(() => {
      if (!this.isPaused) {
        this.nextSlide();
      }
    }, 4000);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }
}

window.EduWatchSlider = new EduSlider();

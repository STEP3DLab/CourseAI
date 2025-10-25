/*
  Основной скрипт лендинга интенсива.
  Здесь реализованы: мобильное меню, подсветка активных секций, параллакс, частицы,
  валидация форм и генерация PDF-памятки через Canvas.
*/

document.addEventListener('DOMContentLoaded', () => {
  // Кэш элементов интерфейса
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');
  const navLinks = document.querySelectorAll('.nav-link');
  const toTopButton = document.querySelector('.to-top');
  const toast = document.querySelector('.toast');
  const registerForm = document.getElementById('register-form');
  const subscribeForm = document.getElementById('subscribe-form');
  const phoneInput = document.getElementById('phone');
  const currentYear = document.getElementById('current-year');
  const backgroundLayer = document.querySelector('.background__gradient');
  const particlesCanvas = document.getElementById('particles');
  // Фавикон и логотип: показываем PNG, только если файл добавлен пользователем
  const faviconLink = document.getElementById('favicon');
  const logoImage = document.querySelector('.logo__image');
  const logoIcon = document.querySelector('.logo__icon');

  const showLogoFallback = () => {
    if (logoImage) {
      logoImage.hidden = true;
      logoImage.removeAttribute('src');
    }
    logoIcon?.removeAttribute('hidden');
    if (faviconLink?.dataset.fallback) {
      faviconLink.href = faviconLink.dataset.fallback;
      faviconLink.type = 'image/svg+xml';
    }
  };

  const tryLoadCustomLogo = () => {
    const customLogoPath = 'assets/rgsy-logo.png';
    const testImage = new Image();
    testImage.onload = () => {
      if (logoImage) {
        logoImage.src = customLogoPath;
        logoImage.hidden = false;
      }
      logoIcon?.setAttribute('hidden', '');
      if (faviconLink) {
        faviconLink.href = customLogoPath;
        faviconLink.type = 'image/png';
      }
    };
    testImage.onerror = showLogoFallback;
    testImage.src = customLogoPath;
  };

  tryLoadCustomLogo();

  if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
  }

  /* -------------------------------------------------- */
  /* Мобильное меню                                      */
  /* -------------------------------------------------- */

  const closeNav = () => {
    if (!navToggle) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navList.classList.remove('is-open');
  };

  const openNav = () => {
    if (!navToggle) return;
    navToggle.setAttribute('aria-expanded', 'true');
    navList.classList.add('is-open');
  };

  navToggle?.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeNav();
    } else {
      openNav();
    }
  });

  document.addEventListener('click', (event) => {
    if (!navList.classList.contains('is-open')) return;
    if (!navToggle) return;
    if (!navList.contains(event.target) && !navToggle.contains(event.target)) {
      closeNav();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navList.classList.contains('is-open')) {
      closeNav();
    }
  });

  /* -------------------------------------------------- */
  /* Плавный скролл с учётом высоты шапки                */
  /* -------------------------------------------------- */

  const scrollToSection = (targetId) => {
    const target = document.querySelector(targetId);
    if (!target) return;
    const headerOffset = header?.offsetHeight ?? 0;
    const elementPosition = target.getBoundingClientRect().top + window.scrollY;
    const offsetPosition = elementPosition - headerOffset - 16;

    window.scrollTo({
      top: offsetPosition < 0 ? 0 : offsetPosition,
      behavior: 'smooth'
    });
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const href = link.getAttribute('href');
      if (!href?.startsWith('#')) return;
      scrollToSection(href);
      closeNav();
    });
  });

  toTopButton?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* -------------------------------------------------- */
  /* Подсветка активного пункта меню                     */
  /* -------------------------------------------------- */

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute('id');
      if (!id) return;
      navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
      });
    });
  }, {
    threshold: 0.45,
    rootMargin: '-20% 0px -20% 0px'
  });

  document.querySelectorAll('main section[id]').forEach((section) => {
    sectionObserver.observe(section);
  });

  /* -------------------------------------------------- */
  /* Кнопка наверх и параллакс-фон                      */
  /* -------------------------------------------------- */

  const handleScroll = () => {
    const showToTop = window.scrollY > 480;
    toTopButton?.classList.toggle('is-visible', showToTop);
    if (backgroundLayer) {
      backgroundLayer.style.setProperty('--parallax-offset', `${window.scrollY * 0.08}px`);
    }
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll();

  /* -------------------------------------------------- */
  /* Частицы (мягкое свечение)                          */
  /* -------------------------------------------------- */

  const initParticles = () => {
    if (!particlesCanvas) return;
    const ctx = particlesCanvas.getContext('2d');
    const particles = [];
    const count = window.matchMedia('(min-width: 768px)').matches ? 36 : 20;

    const resize = () => {
      particlesCanvas.width = particlesCanvas.offsetWidth;
      particlesCanvas.height = particlesCanvas.offsetHeight;
    };

    const createParticle = () => ({
      x: Math.random() * particlesCanvas.width,
      y: Math.random() * particlesCanvas.height,
      radius: Math.random() * 1.6 + 0.6,
      speedX: (Math.random() - 0.5) * 0.05,
      speedY: (Math.random() - 0.5) * 0.05,
      alpha: Math.random() * 0.6 + 0.2
    });

    const render = () => {
      ctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
      particles.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0 || particle.x > particlesCanvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > particlesCanvas.height) particle.speedY *= -1;

        ctx.beginPath();
        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.radius * 6);
        gradient.addColorStop(0, `rgba(59, 130, 246, ${particle.alpha})`);
        gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = gradient;
        ctx.arc(particle.x, particle.y, particle.radius * 6, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(render);
    };

    resize();
    particles.splice(0, particles.length, ...Array.from({ length: count }, createParticle));
    render();

    window.addEventListener('resize', () => {
      resize();
      particles.splice(0, particles.length, ...Array.from({ length: count }, createParticle));
    });
  };

  initParticles();

  /* -------------------------------------------------- */
  /* Маска телефона и валидация                          */
  /* -------------------------------------------------- */

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    const normalized = digits[0] === '8' ? `7${digits.slice(1)}` : digits;
    const ensured = normalized.startsWith('7') ? normalized : `7${normalized}`;
    const trimmed = ensured.slice(0, 11);
    const parts = [
      trimmed.slice(0, 1),
      trimmed.slice(1, 4),
      trimmed.slice(4, 7),
      trimmed.slice(7, 9),
      trimmed.slice(9, 11)
    ];
    let formatted = '+7';
    if (parts[1]) formatted += ` (${parts[1]}`;
    if (parts[1] && parts[1].length === 3) formatted += ')';
    if (parts[2]) formatted += ` ${parts[2]}`;
    if (parts[3]) formatted += `-${parts[3]}`;
    if (parts[4]) formatted += `-${parts[4]}`;
    return formatted;
  };

  phoneInput?.addEventListener('input', () => {
    phoneInput.value = formatPhone(phoneInput.value);
  });

  const showFieldError = (input, message) => {
    const errorField = registerForm.querySelector(`[data-error-for="${input.id}"]`);
    if (errorField) {
      errorField.textContent = message || '';
    }
    input.classList.toggle('has-error', Boolean(message));
  };

  const validatePhone = (value) => {
    const digits = value.replace(/\D/g, '');
    return digits.length === 11;
  };

  const validateFormField = (input) => {
    if (input.type === 'checkbox') {
      const isValid = input.checked;
      showFieldError(input, isValid ? '' : 'Поставьте отметку для согласия');
      return isValid;
    }

    if (input.id === 'phone') {
      const isValid = validatePhone(input.value);
      showFieldError(input, isValid ? '' : 'Введите корректный номер телефона');
      return isValid;
    }

    if (!input.checkValidity()) {
      showFieldError(input, input.validationMessage || 'Проверьте корректность поля');
      return false;
    }

    showFieldError(input, '');
    return true;
  };

  registerForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const elements = Array.from(registerForm.elements).filter((el) => el.id);
    const isValid = elements.every((el) => validateFormField(el));

    if (!isValid) {
      showToast('Проверьте обязательные поля', true);
      return;
    }

    try {
      // Имитируем сетевой запрос.
      await new Promise((resolve) => setTimeout(resolve, 900));

      const formData = {
        fullName: registerForm.fullName.value.trim(),
        email: registerForm.email.value.trim(),
        phone: registerForm.phone.value.trim(),
        format: registerForm.format.value,
        comment: registerForm.comment.value.trim()
      };

      const pdfBlob = await generateParticipantPdf(formData);
      triggerPdfDownload(pdfBlob, 'Памятка участника интенсив ИИ.pdf');

      registerForm.reset();
      elements.forEach((el) => showFieldError(el, ''));
      showToast('Заявка отправлена! Мы свяжемся с вами в течение дня.');
    } catch (error) {
      console.error(error);
      showToast('Не удалось отправить заявку. Попробуйте позже.', true);
    }
  });

  registerForm?.addEventListener('input', (event) => {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) {
      validateFormField(target);
    }
  });

  subscribeForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const emailField = subscribeForm.querySelector('input[type="email"]');
    if (!emailField) return;
    if (!emailField.checkValidity()) {
      const errorField = subscribeForm.querySelector(`[data-error-for="${emailField.id}"]`);
      if (errorField) {
        errorField.textContent = 'Введите корректный e-mail';
      }
      showToast('Проверьте адрес e-mail', true);
      return;
    }
    const errorField = subscribeForm.querySelector(`[data-error-for="${emailField.id}"]`);
    if (errorField) errorField.textContent = '';
    showToast('Спасибо! Мы отправим подборку материалов на почту.');
    subscribeForm.reset();
  });

  /* -------------------------------------------------- */
  /* FAQ (аккордеон на чистом JS)                        */
  /* -------------------------------------------------- */

  document.querySelectorAll('.faq-item').forEach((item) => {
    const toggle = item.querySelector('.faq-item__toggle');
    const content = item.querySelector('.faq-item__content');
    if (!toggle || !content) return;

    toggle.setAttribute('aria-expanded', 'false');
    content.classList.remove('is-open');

    toggle.addEventListener('click', () => {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isExpanded));
      content.classList.toggle('is-open', !isExpanded);
    });
  });

  /* -------------------------------------------------- */
  /* Тост-уведомления                                    */
  /* -------------------------------------------------- */

  let toastTimeout;
  function showToast(message, isError = false) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.toggle('is-error', isError);
    toast.classList.add('is-visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 4000);
  }

  /* -------------------------------------------------- */
  /* Генерация PDF через Canvas                          */
  /* -------------------------------------------------- */

  async function generateParticipantPdf({ fullName, email, phone, format, comment }) {
    // Создаём холст для отрисовки содержимого PDF.
    const canvas = document.createElement('canvas');
    canvas.width = 1240; // ~A4 @150dpi
    canvas.height = 1754;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    // Фон с мягким градиентом.
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Полупрозрачные акценты.
    ctx.fillStyle = 'rgba(59, 130, 246, 0.12)';
    ctx.beginPath();
    ctx.arc(200, 320, 220, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(1040, 520, 260, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 64px Inter';
    ctx.fillText('Памятка участника', 140, 200);

    ctx.font = '36px Inter';
    ctx.fillText('Интенсив «Современный ИИ»', 140, 260);

    ctx.font = '28px Inter';
    const infoLines = [
      `Участник: ${fullName || '—'}`,
      `E-mail: ${email || '—'}`,
      `Телефон: ${phone || '—'}`,
      `Формат: ${format === 'offline' ? 'Офлайн' : 'Онлайн'}`,
      `Комментарий: ${comment || 'Без комментариев'}`
    ];

    infoLines.forEach((line, index) => {
      ctx.fillText(line, 140, 360 + index * 60);
    });

    ctx.font = '28px Inter';
    ctx.fillText('Полезные ссылки:', 140, 720);
    ctx.font = '24px Inter';
    const links = [
      '• Чат участников: t.me/rgsy-ai',
      '• Материалы и чек-листы: example.com/ai-kit',
      '• Поддержка: ai@rgsu.ru'
    ];
    links.forEach((line, index) => {
      ctx.fillText(line, 160, 780 + index * 50);
    });

    ctx.font = '22px Inter';
    ctx.fillStyle = 'rgba(226, 232, 240, 0.8)';
    ctx.fillText('Не забудьте прийти за 10 минут до старта и обновить промты!', 140, 1000);

    const date = new Date();
    ctx.fillText(`Дата генерации: ${date.toLocaleDateString('ru-RU')} ${date.toLocaleTimeString('ru-RU')}`, 140, 1060);

    // Получаем JPEG из Canvas, чтобы встроить в PDF.
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const jpegData = atob(dataUrl.split(',')[1]);
    const jpegBytes = new Uint8Array(jpegData.length);
    for (let i = 0; i < jpegData.length; i += 1) {
      jpegBytes[i] = jpegData.charCodeAt(i);
    }

    return createPdfFromImage(jpegBytes, canvas.width, canvas.height);
  }

  function createPdfFromImage(imageBytes, widthPx, heightPx) {
    const encoder = new TextEncoder();
    const pdfChunks = [];
    const offsets = [];
    let length = 0;

    const push = (data) => {
      const chunk = typeof data === 'string' ? encoder.encode(data) : data;
      pdfChunks.push(chunk);
      length += chunk.length;
    };

    const startObject = (id) => {
      offsets[id] = length;
      push(`${id} 0 obj\n`);
    };

    const endObject = () => {
      push('endobj\n');
    };

    push('%PDF-1.4\n');

    // 1: Catalog
    startObject(1);
    push('<< /Type /Catalog /Pages 2 0 R >>\n');
    endObject();

    // 2: Pages
    startObject(2);
    push('<< /Type /Pages /Kids [3 0 R] /Count 1 /MediaBox [0 0 595 842] >>\n');
    endObject();

    // 3: Page
    startObject(3);
    push('<< /Type /Page /Parent 2 0 R /Resources << /XObject << /Im0 6 0 R >> >> /Contents 5 0 R >>\n');
    endObject();

    // 4: Info
    startObject(4);
    push('<< /Producer (CourseAI Landing Generator) /CreationDate (D:' + formatPdfDate(new Date()) + ') >>\n');
    endObject();

    // 5: Page content referencing image.
    const widthPt = 595;
    const heightPt = 842;
    const contentStream = `q\n${widthPt} 0 0 ${heightPt} 0 0 cm\n/Im0 Do\nQ\n`;
    startObject(5);
    push(`<< /Length ${contentStream.length} >>\nstream\n`);
    push(contentStream);
    push('\nendstream\n');
    endObject();

    // 6: Image object
    const imageLength = imageBytes.length;
    startObject(6);
    push(`<< /Type /XObject /Subtype /Image /Width ${widthPx} /Height ${heightPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageLength} >>\n`);
    push('stream\n');
    push(imageBytes);
    push('\nendstream\n');
    endObject();

    const startXref = length;
    const totalObjects = 6;

    push(`xref\n0 ${totalObjects + 1}\n`);
    push('0000000000 65535 f \n');
    for (let i = 1; i <= totalObjects; i += 1) {
      push(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
    }

    push(`trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R /Info 4 0 R >>\n`);
    push(`startxref\n${startXref}\n%%EOF`);

    return new Blob(pdfChunks, { type: 'application/pdf' });
  }

  function formatPdfDate(date) {
    const pad = (n) => String(n).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const offsetHours = pad(Math.floor(Math.abs(offset) / 60));
    const offsetMinutes = pad(Math.abs(offset) % 60);
    return `${year}${month}${day}${hours}${minutes}${seconds}${sign}${offsetHours}'${offsetMinutes}'`;
  }

  function triggerPdfDownload(blob, filename) {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `downloads/${filename}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
});

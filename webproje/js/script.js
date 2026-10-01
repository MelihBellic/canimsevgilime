(() => {
  const pageShell = document.getElementById('page-shell');
  const heartCloud = document.querySelector('.heart-cloud');
  const starfield = document.querySelector('.starfield');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let scrollFrame = 0;
  let lastHeartTime = 0;
  let heartInterval = 0;

  function updateSky() {
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0
      ? Math.min(1, Math.max(0, window.scrollY / maxScroll))
      : 0;

    // Sayfa ilerledikçe gökyüzü pembeden mora ve gece mavisine kayar.
const hue = Math.round(205 - progress * 40);
    document.documentElement.style.setProperty('--sky-hue', hue);

    // Yıldızlar kaydırma yönünün tersine hafifçe hareket ederek derinlik verir.
    if (starfield && !reducedMotion.matches) {
      starfield.style.transform = `translateY(${window.scrollY * -0.035}px)`;
    }

    scrollFrame = 0;
  }

  function onScroll() {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(updateSky);

    const now = Date.now();
    if (now - lastHeartTime > 450) {
      createHeart();
      lastHeartTime = now;
    }
  }

  function createStars() {
    if (!starfield || reducedMotion.matches) return;

    const count = Math.min(110, Math.floor(window.innerWidth / 8));

    for (let index = 0; index < count; index += 1) {
      const star = document.createElement('i');
      const size = Math.random() < 0.12 ? 3 : 1 + Math.random() * 1.4;

      star.className = 'star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.setProperty('--star-size', `${size}px`);
      star.style.setProperty('--star-opacity', `${0.35 + Math.random() * 0.65}`);
      star.style.setProperty('--twinkle-duration', `${2.5 + Math.random() * 5}s`);
      star.style.setProperty('--twinkle-delay', `${Math.random() * -6}s`);
      starfield.appendChild(star);
    }
  }

  function createHeart() {
    if (!heartCloud || reducedMotion.matches) return;

    while (heartCloud.childElementCount >= 20) {
      heartCloud.firstElementChild?.remove();
    }

    const heart = document.createElement('span');
    const duration = 7 + Math.random() * 3;

    heart.className = 'heart';
    heart.style.left = `${5 + Math.random() * 90}%`;
    heart.style.top = `${55 + Math.random() * 35}%`;
    heart.style.width = `${1 + Math.random() * 1.3}rem`;
    heart.style.height = heart.style.width;
    heart.style.animationDuration = `${4 + Math.random() * 2}s, ${duration}s`;
    heartCloud.appendChild(heart);

    window.setTimeout(() => heart.remove(), duration * 1000 + 500);
  }

  function init() {
    const yesBtn = document.getElementById('yes-btn');
    const noBtn = document.getElementById('no-btn');
    const modal = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');
    const modalOk = document.getElementById('modal-ok');
    const splash = document.getElementById('splash');
    const splashStart = document.getElementById('splash-start');
    const audio = document.getElementById('bg-audio');

    let lastFocus = null;

    function openModal() {
      if (!modal) return;
      lastFocus = document.activeElement;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      modalClose?.focus();
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      lastFocus?.focus?.();
    }

    // Başlangıç ekranını görünür yap.
    splash?.setAttribute('aria-hidden', 'false');

    splashStart?.addEventListener('click', () => {
      if (audio) {
        audio.volume = 0.55;
        audio.play()?.catch(() => {});
      }
      splash?.setAttribute('aria-hidden', 'true');
    });

    yesBtn?.addEventListener('click', () => {
      yesBtn.classList.add('clicked');
      window.setTimeout(() => yesBtn.classList.remove('clicked'), 700);
      createHeart();

      if (audio) audio.play()?.catch(() => {});
      openModal();
    });

    // Hayır seçeneği de rahatça tıklanabilir; cevabı gönderen kişi seçer.
let noButtonDetached = false;

function dodgeNoButton() {
  if (!noBtn) return;

  // Düğmeyi dönüştürülmüş panelin dışına al; fixed koordinatları
  // artık pencereye göre hesaplanır.
  if (!noButtonDetached) {
    const rect = noBtn.getBoundingClientRect();

    document.body.appendChild(noBtn);
    noBtn.style.position = 'fixed';
    noBtn.style.left = `${rect.left}px`;
    noBtn.style.top = `${rect.top}px`;
    noBtn.style.margin = '0';
    noBtn.style.zIndex = '50';
    noBtn.style.transform = 'none';
    noBtn.style.transition =
      'left 350ms cubic-bezier(.2,.9,.2,1), top 350ms cubic-bezier(.2,.9,.2,1)';
    noButtonDetached = true;
  }

  const margin = 16;
  const width = noBtn.offsetWidth;
  const height = noBtn.offsetHeight;
  const maxLeft = Math.max(margin, window.innerWidth - width - margin);
  const maxTop = Math.max(margin, window.innerHeight - height - margin);

  noBtn.style.left = `${margin + Math.random() * (maxLeft - margin)}px`;
  noBtn.style.top = `${margin + Math.random() * (maxTop - margin)}px`;
}

noBtn?.addEventListener('pointerenter', dodgeNoButton);
noBtn?.addEventListener('touchstart', dodgeNoButton, { passive: true });
noBtn?.addEventListener('click', dodgeNoButton);

    modalClose?.addEventListener('click', closeModal);
    modalOk?.addEventListener('click', closeModal);

    modal?.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeModal();
    });

    document.addEventListener('pointermove', (event) => {
      document.body.style.setProperty('--pointer-x', `${event.clientX}px`);
      document.body.style.setProperty('--pointer-y', `${event.clientY}px`);
    }, { passive: true });

    createStars();
    updateSky();

    if (!reducedMotion.matches) {
      heartInterval = window.setInterval(createHeart, 2400);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateSky, { passive: true });
    window.addEventListener('pagehide', () => {
      window.clearInterval(heartInterval);
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
    }, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
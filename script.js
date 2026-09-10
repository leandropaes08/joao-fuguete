// Theme toggle (dark / light)
const themeToggle = document.getElementById('themeToggle');
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('joao-theme', theme);
}
themeToggle?.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  applyTheme(current === 'light' ? 'dark' : 'light');
});
applyTheme(localStorage.getItem('joao-theme') || 'dark');

// Hero parallax fade: text drifts up and fades as the hero scrolls out of view
const heroBanner = document.querySelector('.hero-banner');
const heroContent = document.querySelector('.hero-banner-content');
const heroSide = document.querySelector('.hero-banner-side');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let heroTicking = false;
function updateHeroParallax() {
  heroTicking = false;
  if (!heroBanner) return;
  const progress = Math.min(Math.max(window.scrollY / heroBanner.offsetHeight, 0), 1);
  const opacity = Math.max(1 - progress * 1.3, 0);
  if (heroContent) {
    heroContent.style.transform = `translateY(${-progress * 36}px)`;
    heroContent.style.opacity = opacity;
  }
  if (heroSide) heroSide.style.opacity = opacity;
}
if (!prefersReducedMotion) {
  window.addEventListener('scroll', () => {
    if (!heroTicking) {
      heroTicking = true;
      requestAnimationFrame(updateHeroParallax);
    }
  }, { passive: true });
  updateHeroParallax();
}

// Floating header, appears with blur once the page scrolls past the hero
const siteHeader = document.getElementById('siteHeader');
function onHeaderScroll() {
  siteHeader?.classList.toggle('scrolled', window.scrollY > 60);
}
window.addEventListener('scroll', onHeaderScroll, { passive: true });
onHeaderScroll();

// Scroll reveal, with staggered entrance for grouped items
document.querySelectorAll('[data-reveal-group]').forEach(group => {
  const items = group.querySelectorAll(':scope > [data-reveal]');
  items.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i * 70, 420)}ms`;
  });
});
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
navToggle?.addEventListener('click', () => {
  mainNav.classList.toggle('open');
  navToggle.classList.toggle('active');
});
mainNav?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mainNav.classList.remove('open'));
});

// Countdown to next race
const NEXT_RACE = new Date('2026-09-11T08:00:00');
function updateCountdown() {
  const now = new Date();
  let diff = NEXT_RACE - now;
  if (diff < 0) diff = 0;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const pad = n => String(n).padStart(2, '0');
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = pad(val); };

  set('cd-days', days);
  set('cd-hours', hours);
  set('cd-min', minutes);
  set('cd-sec', seconds);
}
updateCountdown();
setInterval(updateCountdown, 1000);

// Animated stat counters
const statEls = document.querySelectorAll('[data-count]');
const statObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.count, 10);
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const tick = () => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current < target) requestAnimationFrame(tick);
    };
    tick();
    statObserver.unobserve(el);
  });
}, { threshold: 0.5 });
statEls.forEach(el => statObserver.observe(el));

// Modal
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const openTriggers = document.querySelectorAll('[data-open-modal]');
const supportForm = document.getElementById('supportForm');
const formSuccess = document.getElementById('formSuccess');

function openModal(e) {
  e.preventDefault();
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}
openTriggers.forEach(btn => btn.addEventListener('click', openModal));
modalClose?.addEventListener('click', closeModal);
modalOverlay?.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Phone input mask (Brazilian format)
const telefoneInput = document.getElementById('telefoneInput');
function formatPhoneBR(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.replace(/^(\d*)/, '($1');
  if (digits.length <= 6) return digits.replace(/^(\d{2})(\d*)/, '($1) $2');
  if (digits.length <= 10) return digits.replace(/^(\d{2})(\d{4})(\d*)/, '($1) $2-$3');
  return digits.replace(/^(\d{2})(\d{5})(\d*)/, '($1) $2-$3');
}
telefoneInput?.addEventListener('input', (e) => {
  e.target.value = formatPhoneBR(e.target.value);
});

// Toggle "Empresa/Marca" <-> "Nome" label depending on Pessoa física / Empresa
const empresaLabel = document.getElementById('empresaLabel');
function updateEmpresaLabel() {
  const tipo = document.querySelector('input[name="tipo"]:checked')?.value;
  const key = tipo === 'pessoa' ? 'modal.labelNomePF' : 'modal.labelEmpresa';
  const lang = localStorage.getItem('joao-lang') || 'pt';
  if (empresaLabel) {
    empresaLabel.textContent = translations[lang][key];
    empresaLabel.dataset.i18n = key;
  }
}
document.querySelectorAll('input[name="tipo"]').forEach(radio => {
  radio.addEventListener('change', updateEmpresaLabel);
});

const GUARDIAN_WHATSAPP = '5592991619983';

supportForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(supportForm);
  const tipo = data.get('tipo') === 'empresa' ? 'Empresa' : 'Pessoa física';
  const empresaFieldLabel = data.get('tipo') === 'pessoa' ? 'Nome' : 'Empresa/Marca';
  const message = [
    'Novo interesse em apoiar o João!',
    '',
    `Tipo: ${tipo}`,
    `${empresaFieldLabel}: ${data.get('empresa') || '-'}`,
    `E-mail: ${data.get('email')}`,
    `Telefone: ${data.get('telefone')}`,
    `Mensagem: ${data.get('mensagem') || '-'}`,
  ].join('\n');
  window.open(`https://wa.me/${GUARDIAN_WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank');

  supportForm.style.display = 'none';
  formSuccess.classList.add('visible');
  setTimeout(() => {
    closeModal();
    setTimeout(() => {
      supportForm.reset();
      supportForm.style.display = 'flex';
      formSuccess.classList.remove('visible');
    }, 300);
  }, 2200);
});

// Gallery slider nav arrows
const gallerySlider = document.getElementById('gallerySlider');
const galleryPrevBtn = document.querySelector('.gallery-nav--prev');
const galleryNextBtn = document.querySelector('.gallery-nav--next');
function gallerySlideBy(direction) {
  if (!gallerySlider) return;
  const card = gallerySlider.querySelector('.gallery-item');
  const step = card ? card.getBoundingClientRect().width + 14 : 300;
  gallerySlider.scrollBy({ left: step * direction, behavior: 'smooth' });
}
galleryPrevBtn?.addEventListener('click', () => gallerySlideBy(-1));
galleryNextBtn?.addEventListener('click', () => gallerySlideBy(1));

// Gallery lightbox with prev/next navigation
const galleryButtons = document.querySelectorAll('[data-lightbox]');
const galleryItems = Array.from(galleryButtons).map(btn => ({
  src: btn.dataset.lightbox,
  alt: btn.querySelector('img')?.alt || '',
}));
let lightboxEl;
let lightboxIndex = 0;

function renderLightboxImage() {
  const { src, alt } = galleryItems[lightboxIndex];
  const img = lightboxEl.querySelector('img');
  img.src = src;
  img.alt = alt;
}
function showNext(e) {
  e?.stopPropagation();
  lightboxIndex = (lightboxIndex + 1) % galleryItems.length;
  renderLightboxImage();
}
function showPrev(e) {
  e?.stopPropagation();
  lightboxIndex = (lightboxIndex - 1 + galleryItems.length) % galleryItems.length;
  renderLightboxImage();
}
function openLightbox(index) {
  lightboxIndex = index;
  lightboxEl = document.createElement('div');
  lightboxEl.className = 'lightbox';
  lightboxEl.innerHTML = `
    <img src="" alt="">
    <button class="lightbox-close" aria-label="Fechar">&times;</button>
    <button class="lightbox-nav lightbox-nav--prev" aria-label="Foto anterior">&#8249;</button>
    <button class="lightbox-nav lightbox-nav--next" aria-label="Próxima foto">&#8250;</button>
  `;
  document.body.appendChild(lightboxEl);
  renderLightboxImage();
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => lightboxEl.classList.add('open'));
  lightboxEl.addEventListener('click', closeLightbox);
  lightboxEl.querySelector('.lightbox-nav--prev').addEventListener('click', showPrev);
  lightboxEl.querySelector('.lightbox-nav--next').addEventListener('click', showNext);
  lightboxEl.querySelector('img').addEventListener('click', (e) => e.stopPropagation());
  lightboxEl.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
}
function closeLightbox() {
  if (!lightboxEl) return;
  lightboxEl.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { lightboxEl?.remove(); lightboxEl = null; }, 200);
}
galleryButtons.forEach((btn, index) => {
  btn.addEventListener('click', () => openLightbox(index));
});
document.addEventListener('keydown', (e) => {
  if (!lightboxEl) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') showNext();
  if (e.key === 'ArrowLeft') showPrev();
});

// ---------------------------------------------------------------------------
// i18n - pt-BR / en-US
// ---------------------------------------------------------------------------
const translations = {
  pt: {
    'page.title': 'João Fuguete, Atleta de Triatlo',
    'nav.sobre': 'Sobre',
    'nav.trajetoria': 'Trajetória',
    'nav.provas': 'Provas',
    'nav.galeria': 'Galeria',
    'nav.apoiadores': 'Apoiadores',
    'nav.cta': 'Seja apoiador',
    'nav.menuLabel': 'Abrir menu',

    'hero.greeting': 'Olá, eu sou <span class="wave">👋</span>',
    'hero.name': 'João <span>Fuguete</span>',
    'hero.tag': 'future is now',
    'hero.side': 'road to the race',
    'hero.videoText': 'Acompanhe a jornada de perto,<br>treino a treino.',
    'hero.videoLink': 'Ver trajetória',
    'hero.inviteTitle': 'Você está convidado<br>para a próxima prova!',
    'hero.inviteStatLabel': 'Provas disputadas',
    'hero.subtitle': 'Atleta de triatlo, {{age}} anos, determinação, disciplina e paixão pelo esporte, treino a treino, prova a prova.',
    'hero.ctaLink': 'Seja um apoiador',
    'hero.date': '11 de setembro de 2026, horário a confirmar',
    'hero.registerBtn': 'Inscrever-se',
    'hero.photoAlt': 'João Fuguete correndo à beira do lago, contraluz do amanhecer',
    'hero.inviteStatPhotoAlt': 'João correndo à beira do lago durante prova',
    'nextRace.badgeAlt': 'Jogos Escolares Brasileiros (JEBS)',

    'countdown.days': 'Dias',
    'countdown.hours': 'Horas',
    'countdown.min': 'Min',
    'countdown.sec': 'Seg',

    'stats.races.label': 'Provas disputadas',
    'stats.podiums.label': 'Pódios conquistados',
    'stats.years.label': 'Anos de treino',
    'stats.best.value': '1º',
    'stats.best.label': 'Campeão Brasileiro de Duatlo',

    'about.eyebrow': 'Quem é João',
    'about.photoAlt': 'João comemorando durante prova de corrida, com número de peito 170',
    'about.title': 'Quem sou eu',
    'about.p1': 'João tem {{age}} anos e descobriu o triatlo como forma de superar limites, próprios, não dos outros. Entre treinos de natação, ciclismo e corrida, ele concilia rotina escolar com uma disciplina que muita gente adulta ainda está aprendendo.',
    'about.p2': 'Mais do que resultado, o que move o João é a evolução constante. Cada treino é um degrau, cada prova é uma prova de que dá pra ir mais longe.',
    'about.quote': '“Eu não compito só contra os outros. Compito contra o João de ontem.”',

    'trajectory.eyebrow': 'Trajetória',
    'trajectory.title': 'A caminhada até aqui',
    'trajectory.2021.title': 'Início no ciclismo',
    'trajectory.2021.desc': 'Primeiros treinos de ciclismo.',
    'trajectory.2022.title': 'Início na natação',
    'trajectory.2022.desc': 'Primeiros treinos de natação.',
    'trajectory.2023.title': 'Início na corrida',
    'trajectory.2023.desc': 'Primeiros treinos de corrida.',
    'trajectory.2024.title': 'Primeira prova oficial',
    'trajectory.2024.desc': 'Largada na categoria de base, com foco em aprender o ritmo de transição entre as três modalidades.',
    'trajectory.2025.title': 'Entrada na equipe',
    'trajectory.2025.desc': 'Passa a treinar com equipe técnica estruturada, evoluindo tempos em todas as modalidades.',
    'trajectory.2025b.title': 'Campeão Brasileiro de Duatlo',
    'trajectory.2025b.desc': 'Conquista o 1º lugar no Campeonato Brasileiro de Duatlo Sprint, categoria infantil, masculino 12 anos.',
    'trajectory.2026.title': 'Jogos JEBS',
    'trajectory.2026.desc': 'Disputa os Jogos JEBS na categoria juvenil, próximo desafio.',

    'upcoming.eyebrow': 'Próximas provas e metas',
    'upcoming.title': 'Para onde o apoio se transforma em resultado',
    'upcoming.desc': 'Cada prova é um passo em direção a um objetivo maior: chegar entre os primeiros do país na categoria juvenil e seguir evoluindo rumo às categorias de elite do triatlo nacional.',
    'upcoming.card1.title': 'Circuito Regional de Triatlo',
    'upcoming.card1.date': 'Setembro de 2026, Manaus/AM',
    'upcoming.card2.title': 'Jogos Escolares Brasileiros (JEBS) 2026',
    'upcoming.card2.date': '11 e 26 de setembro de 2026',
    'upcoming.card3.title': 'Meta 2026/2027',
    'upcoming.card3.date': 'Top 3 nacional na categoria juvenil',

    'races.eyebrow': 'Provas',
    'races.title': 'Resultados e participações',
    'races.card4.tag': 'Duatlo',
    'races.card4.title': 'Brasileiro de Duatlo Sprint 2025',
    'races.card4.desc': '1º lugar, Categoria infantil, masculino 12 anos',
    'races.card2.tag': 'Corrida',
    'races.card2.title': 'Etapa Sprint, Lago',
    'races.card2.desc': 'Categoria de base',
    'races.card3.tag': 'Ciclismo',
    'races.card3.title': 'Circuito Regional',
    'races.card3.desc': 'Categoria juvenil',
    'races.card5.tag': 'Natação, Ciclismo, Corrida',
    'races.card5.title': 'Brasileiro de Triatlo Sprint, Etapa 3 (Indaiatuba)',
    'races.card5.desc': '51º geral, Categoria 6',
    'races.card6.tag': 'Ciclismo',
    'races.card6.title': 'Copa Norte Nordeste 2026, Circuito',
    'races.card6.desc': '7º colocado, Categoria infanto-juvenil',
    'races.card7.tag': 'Ciclismo',
    'races.card7.title': 'Copa Norte Nordeste 2026, Resistência',
    'races.card7.desc': '3º colocado, Categoria infanto-juvenil',
    'races.card8.tag': 'Ciclismo',
    'races.card8.title': 'Copa Norte Nordeste 2026, Contra-relógio',
    'races.card8.desc': '2º colocado, Categoria infanto-juvenil',
    'races.card9.tag': 'Ciclismo',
    'races.card9.title': 'Copa Norte Nordeste 2025, Circuito',
    'races.card9.desc': '8º colocado, Categoria infanto-juvenil',
    'races.card10.tag': 'Ciclismo',
    'races.card10.title': 'Copa Norte Nordeste 2025, Resistência',
    'races.card10.desc': '8º colocado, Categoria infanto-juvenil',
    'races.card11.tag': 'Ciclismo',
    'races.card11.title': 'Copa Norte Nordeste 2025, Contra-relógio',
    'races.card11.desc': '8º colocado, Categoria infanto-juvenil',
    'races.table.title': 'Resumo dos resultados',
    'races.table.prova': 'Prova',
    'races.table.modalidade': 'Modalidade',
    'races.table.resultado': 'Resultado',

    'gallery.eyebrow': 'Galeria',
    'gallery.title': 'Momentos das provas e treinos',

    'social.eyebrow': 'Acompanhe o João',
    'social.title': 'Siga a jornada em tempo real',

    'supporters.eyebrow': 'Apoiadores',
    'supporters.title': 'Marcas e pessoas que acreditam no João',
    'supporters.logoAlt': 'Capacete & Cia, apoiador',
    'supporters.logo2Alt': 'Atlética Nacional, apoiadora',
    'supporters.logo3Alt': 'Raphaella Cabral Nutricionista, apoiadora',
    'supporters.logo4Alt': '#Esportes com Jesus, apoiador',
    'supporters.logo5Alt': 'NAT Turismo, apoiador',
    'supporters.ctaText': 'Quer ver a marca da sua empresa aqui também?',
    'supporters.ctaBtn': 'Quero apoiar',

    'cta.title': 'Deseja ser um apoiador?',
    'cta.desc': 'Apoiar o João é investir em disciplina, superação e numa história que está apenas começando. Visibilidade da sua marca ao lado de valores que qualquer comunidade quer ver de perto.',
    'cta.btn': 'Quero apoiar →',

    'footer.contactLabel': 'Contato do responsável',
    'footer.whatsapp': 'WhatsApp',
    'footer.note': 'Todo contato de apoio é intermediado pelo responsável do atleta.',

    'modal.closeLabel': 'Fechar',
    'modal.title': 'Seja um apoiador do João',
    'modal.sub': 'Preencha os dados abaixo e o responsável pelo atleta entrará em contato.',
    'modal.labelTipo': 'Você é',
    'modal.tipoPessoa': 'Pessoa física',
    'modal.tipoEmpresa': 'Empresa',
    'modal.labelEmpresa': 'Empresa/Marca (opcional)',
    'modal.labelNomePF': 'Nome (opcional)',
    'modal.labelEmail': 'E-mail',
    'modal.labelTelefone': 'Telefone',
    'modal.labelMensagem': 'Mensagem',
    'modal.placeholderMensagem': 'O que gostaria de oferecer: patrocínio financeiro, equipamento, inscrição em provas...',
    'modal.submitBtn': 'Enviar mensagem',
    'modal.formNote': 'Como João tem {{age}} anos, todo contato de apoio é intermediado por seu responsável.',
    'modal.successMsg': 'Mensagem enviada! O responsável do João vai entrar em contato em breve.',
  },
  en: {
    'page.title': 'João Fuguete, Triathlon Athlete',
    'nav.sobre': 'About',
    'nav.trajetoria': 'Journey',
    'nav.provas': 'Races',
    'nav.galeria': 'Gallery',
    'nav.apoiadores': 'Supporters',
    'nav.cta': 'Become a supporter',
    'nav.menuLabel': 'Open menu',

    'hero.greeting': 'Hey, I am <span class="wave">👋</span>',
    'hero.name': 'João <span>Fuguete</span>',
    'hero.tag': 'future is now',
    'hero.side': 'road to the race',
    'hero.videoText': 'Follow the journey up close,<br>workout by workout.',
    'hero.videoLink': 'See the journey',
    'hero.inviteTitle': "You're invited<br>to the next race!",
    'hero.inviteStatLabel': 'Races completed',
    'hero.subtitle': 'Triathlon athlete, {{age}} years old, determination, discipline and passion for the sport, workout by workout, race by race.',
    'hero.ctaLink': 'Become a supporter',
    'hero.date': 'September 11, 2026, time TBC',
    'hero.registerBtn': 'Register',
    'hero.photoAlt': 'João Fuguete running by the lake, backlit at sunrise',
    'hero.inviteStatPhotoAlt': 'João running along the lake during a race',
    'nextRace.badgeAlt': 'Brazilian School Games (JEBS)',

    'countdown.days': 'Days',
    'countdown.hours': 'Hours',
    'countdown.min': 'Min',
    'countdown.sec': 'Sec',

    'stats.races.label': 'Races completed',
    'stats.podiums.label': 'Podium finishes',
    'stats.years.label': 'Years training',
    'stats.best.value': '1st',
    'stats.best.label': 'Brazilian Duathlon Champion',

    'about.eyebrow': 'Who is João',
    'about.photoAlt': 'João celebrating during a running race, wearing bib number 170',
    'about.title': 'Who I am',
    'about.p1': "João is {{age}} years old and found in triathlon a way to push his own limits, not anyone else's. Between swimming, cycling and running sessions, he balances a full school routine with a discipline many adults are still trying to learn.",
    'about.p2': "More than results, what drives João is constant progress. Every workout is a step forward, every race proof that he can go further.",
    'about.quote': '"I don\'t just compete against others. I compete against yesterday\'s João."',

    'trajectory.eyebrow': 'Journey',
    'trajectory.title': 'The road so far',
    'trajectory.2021.title': 'Started cycling',
    'trajectory.2021.desc': 'First cycling training sessions.',
    'trajectory.2022.title': 'Started swimming',
    'trajectory.2022.desc': 'First swimming training sessions.',
    'trajectory.2023.title': 'Started running',
    'trajectory.2023.desc': 'First running training sessions.',
    'trajectory.2024.title': 'First official race',
    'trajectory.2024.desc': 'Toed the line in the youth category, focused on learning the transition rhythm between the three disciplines.',
    'trajectory.2025.title': 'Joined the team',
    'trajectory.2025.desc': 'Began training with a structured coaching team, improving times across all three disciplines.',
    'trajectory.2025b.title': 'Brazilian Duathlon Champion',
    'trajectory.2025b.desc': 'Won 1st place at the Brazilian Sprint Duathlon Championship, youth category, boys 12 years old.',
    'trajectory.2026.title': 'JEBS Games',
    'trajectory.2026.desc': 'Competed at the JEBS Games in the youth category, next challenge.',

    'upcoming.eyebrow': 'Upcoming races and goals',
    'upcoming.title': 'Where support turns into results',
    'upcoming.desc': "Every race is a step toward a bigger goal: finishing among the best in the country in the youth category, and continuing to progress toward the elite categories of national triathlon.",
    'upcoming.card1.title': 'Regional Triathlon Circuit',
    'upcoming.card1.date': 'September 2026, Manaus, Brazil',
    'upcoming.card2.title': 'Brazilian School Games (JEBS) 2026',
    'upcoming.card2.date': 'September 11 and 26, 2026',
    'upcoming.card3.title': '2026/2027 Goal',
    'upcoming.card3.date': 'Top 3 nationally in the youth category',

    'races.eyebrow': 'Races',
    'races.title': 'Results and race history',
    'races.card4.tag': 'Duathlon',
    'races.card4.title': '2025 Brazilian Sprint Duathlon',
    'races.card4.desc': '1st place, Youth category, boys 12',
    'races.card2.tag': 'Run',
    'races.card2.title': 'Sprint Stage, Lake',
    'races.card2.desc': 'Youth category',
    'races.card3.tag': 'Bike',
    'races.card3.title': 'Regional Circuit',
    'races.card3.desc': 'Youth category',
    'races.card5.tag': 'Swim, Bike, Run',
    'races.card5.title': 'Brazilian Sprint Triathlon, Stage 3 (Indaiatuba)',
    'races.card5.desc': '51st overall, Category 6',
    'races.card6.tag': 'Bike',
    'races.card6.title': '2026 North-Northeast Cup, Circuit',
    'races.card6.desc': '7th place, Youth category',
    'races.card7.tag': 'Bike',
    'races.card7.title': '2026 North-Northeast Cup, Endurance',
    'races.card7.desc': '3rd place, Youth category',
    'races.card8.tag': 'Bike',
    'races.card8.title': '2026 North-Northeast Cup, Time Trial',
    'races.card8.desc': '2nd place, Youth category',
    'races.card9.tag': 'Bike',
    'races.card9.title': '2025 North-Northeast Cup, Circuit',
    'races.card9.desc': '8th place, Youth category',
    'races.card10.tag': 'Bike',
    'races.card10.title': '2025 North-Northeast Cup, Endurance',
    'races.card10.desc': '8th place, Youth category',
    'races.card11.tag': 'Bike',
    'races.card11.title': '2025 North-Northeast Cup, Time Trial',
    'races.card11.desc': '8th place, Youth category',
    'races.table.title': 'Results summary',
    'races.table.prova': 'Race',
    'races.table.modalidade': 'Discipline',
    'races.table.resultado': 'Result',

    'gallery.eyebrow': 'Gallery',
    'gallery.title': 'Moments from races and training',

    'social.eyebrow': 'Follow João',
    'social.title': 'Follow the journey in real time',

    'supporters.eyebrow': 'Supporters',
    'supporters.title': 'Brands and people who believe in João',
    'supporters.logoAlt': 'Capacete & Cia, supporter',
    'supporters.logo2Alt': 'Atlética Nacional, supporter',
    'supporters.logo3Alt': 'Raphaella Cabral Nutricionista, supporter',
    'supporters.logo4Alt': '#Esportes com Jesus, supporter',
    'supporters.logo5Alt': 'NAT Turismo, supporter',
    'supporters.ctaText': 'Want to see your brand here too?',
    'supporters.ctaBtn': 'I want to support',

    'cta.title': 'Want to become a supporter?',
    'cta.desc': "Supporting João means investing in discipline, perseverance and a story that's just getting started. Your brand's visibility alongside values any community wants to see up close.",
    'cta.btn': 'I want to support →',

    'footer.contactLabel': "Guardian's contact",
    'footer.whatsapp': 'WhatsApp',
    'footer.note': "All sponsorship contact is handled through the athlete's legal guardian.",

    'modal.closeLabel': 'Close',
    'modal.title': 'Become a supporter of João',
    'modal.sub': "Fill in the details below and the athlete's guardian will get in touch.",
    'modal.labelTipo': 'You are',
    'modal.tipoPessoa': 'An individual',
    'modal.tipoEmpresa': 'A company',
    'modal.labelEmpresa': 'Company/Brand (optional)',
    'modal.labelNomePF': 'Name (optional)',
    'modal.labelEmail': 'Email',
    'modal.labelTelefone': 'Phone',
    'modal.labelMensagem': 'Message',
    'modal.placeholderMensagem': 'What you would like to offer: financial sponsorship, equipment, race entry fees...',
    'modal.submitBtn': 'Send message',
    'modal.formNote': "As João is {{age}} years old, all sponsorship contact is handled through his legal guardian.",
    'modal.successMsg': "Message sent! João's guardian will get in touch soon.",
  },
};

const langButtons = document.querySelectorAll('.lang-btn');

// Idade calculada a partir da data de nascimento, sempre atualizada
const BIRTHDATE = new Date('2012-06-21T00:00:00');
function calcAge() {
  const now = new Date();
  let age = now.getFullYear() - BIRTHDATE.getFullYear();
  const hadBirthdayThisYear =
    now.getMonth() > BIRTHDATE.getMonth() ||
    (now.getMonth() === BIRTHDATE.getMonth() && now.getDate() >= BIRTHDATE.getDate());
  if (!hadBirthdayThisYear) age -= 1;
  return age;
}
const AGE = calcAge();

function applyLanguage(lang) {
  const dict = translations[lang];
  if (!dict) return;

  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en-US';
  document.title = dict['page.title'];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key] !== undefined) el.innerHTML = dict[key].replace(/\{\{age\}\}/g, AGE);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (dict[key] !== undefined) el.placeholder = dict[key];
  });
  document.querySelectorAll('[data-i18n-alt]').forEach(el => {
    const key = el.dataset.i18nAlt;
    if (dict[key] !== undefined) el.alt = dict[key];
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
    const key = el.dataset.i18nAriaLabel;
    if (dict[key] !== undefined) el.setAttribute('aria-label', dict[key]);
  });

  langButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
  localStorage.setItem('joao-lang', lang);
}

langButtons.forEach(btn => {
  btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
});

applyLanguage(localStorage.getItem('joao-lang') || 'pt');

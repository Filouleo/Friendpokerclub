const filters = [{ label: 'Tous', value: 'all' }, { label: 'PDF', value: 'pdf' }, { label: 'Sans PDF', value: 'no-pdf' }];
const localPdfFiles = new Set([
  'Cash 24_25.pdf',
  'Five 24_25.pdf',
  'LexiqueFPC.pdf',
  'Regles Five-Card Draw.pdf',
  'Sit 24_25.pdf',
  'Tour des Potes 24_25.pdf',
  'reglement-interieur 2021.pdf',
  'reglement-jeux-et-competitions-202503.pdf'
]);
const memberPdfFiles = [
  'Ac3 Cub3.pdf', 'Albator.pdf', 'As de Pique.pdf', 'Baba.pdf', 'Batman.pdf', 'Bileane.pdf', 'Calcifer.pdf',
  'Chattard.pdf', 'Cracker.pdf', 'Cyrano24.pdf', 'Cyrus.pdf', 'Dabo78.pdf', 'Dan23.pdf', 'Drizz.pdf', 'Droopy.pdf',
  'El Nico.pdf', 'Elmagician.pdf', 'Filou.pdf', 'Fold Airline.pdf', 'Fredoche.pdf', 'Ghost.pdf', 'Grobelix.pdf',
  'Grumpy78.pdf', 'Guiotine.pdf', 'Hio-Tin-Vho.pdf', 'Hub 974.pdf', 'Jackarr.pdf', 'Jardinier.pdf', 'Joce.pdf',
  'Jupiter.pdf', 'Kalvace.pdf', 'Kaplan.pdf', 'KindofAs14.pdf', 'Kiu.pdf', 'Krevet.pdf', 'Kta.pdf', 'Le Heron.pdf',
  'Lephenix.pdf', 'Lio.pdf', 'Lo.pdf', 'Looping.pdf', 'Luis.pdf', 'Lulu.pdf', 'Magic Lolo.pdf', 'Marion.pdf',
  'Mathias PFF.pdf', 'MatiteZoe.pdf', 'Mickey.pdf', 'Micodi.pdf', 'Mig22.pdf', 'MikyB.pdf', 'Milady.pdf',
  'Miss Frane.pdf', 'Mister T.pdf', 'MrPropre.pdf', 'NIN.pdf', 'Niamor7.pdf', 'OCR91.pdf', 'Pape78.pdf', 'Pepito.pdf',
  'Petrusse.pdf', 'Picsou.pdf', 'Pims.pdf', 'RattleSnake.pdf', 'Rdod2.pdf', 'RoyalSprayer.pdf', 'Samben02.pdf',
  'Sigma28.pdf', 'Special K.pdf', 'Starcoco.pdf', 'Startouf.pdf', 'TATA.pdf', 'Taz.pdf', 'The Kid.pdf', 'Tiri91.pdf',
  'Vascolito.pdf', 'Venusia.pdf', 'Vodkamartini.pdf', 'Willydu78.pdf', 'Zorglub.pdf', 'Zorro.pdf'
];
const rulesPdfFiles = new Set([
  'LexiqueFPC.pdf',
  'Regles Five-Card Draw.pdf',
  'demande-adhesion-2025.pdf',
  'reglement-interieur 2021.pdf',
  'reglement-jeux-et-competitions-202503.pdf'
]);
const memberFolderPdfFiles = new Set(['Cash 24_25.pdf', 'Five 24_25.pdf']);

function resolveDocumentUrl(fileName) {
  if (!fileName) return '#';
  if (rulesPdfFiles.has(fileName)) return `./Règlements/${encodeURIComponent(fileName)}`;
  if (memberPdfFiles.includes(fileName) || memberFolderPdfFiles.has(fileName)) return `./Membres/${encodeURIComponent(fileName)}`;
  return `./${encodeURIComponent(fileName)}`;
}

function normalizeName(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function getMemberPdf(member) {
  const aliases = {
    'acecub3': 'Ac3 Cub3.pdf',
    'leheron': 'Le Heron.pdf',
    'lephenix': 'Lephenix.pdf',
    'matitezoe': 'MatiteZoe.pdf',
    'mrpropre': 'MrPropre.pdf',
    'pape78': 'Pape78.pdf',
    'pepito': 'Pepito.pdf',
    'specialk': 'Special K.pdf'
  };
  const normalizedPseudo = normalizeName(member.pseudo);
  return aliases[normalizedPseudo] || memberPdfFiles.find((file) => normalizeName(file.replace(/\.pdf$/i, '')) === normalizedPseudo) || null;
}

async function loadData() {
  const [clubResponse, associationResponse] = await Promise.all([
    fetch('./club-data.json'),
    fetch('./data_friends_poker_club_full.json')
  ]);
  if (!clubResponse.ok || !associationResponse.ok) throw new Error('Impossible de charger les données du club.');
  return { club: await clubResponse.json(), association: await associationResponse.json() };
}

function renderStats(data) {
  const totalMembers = data.club.meta?.total_members ?? 0;
  const totalSeasons = data.club.meta?.total_seasons ?? 0;
  const pdfCount = data.club.members.filter((member) => getMemberPdf(member)).length;
  const withNotes = data.club.members.filter((member) => member.notes).length;

  const stats = [
    { label: 'Membres', value: totalMembers },
    { label: 'Saisons', value: totalSeasons },
    { label: 'Fiches PDF', value: pdfCount },
    { label: 'Notes club', value: withNotes }
  ];

  const statsGrid = document.getElementById('stats-grid');
  if (!statsGrid) return;
  statsGrid.innerHTML = stats
    .map(
      (item) => `
        <article class="stat-card">
          <span class="stat-label">${item.label}</span>
          <strong class="stat-value">${item.value}</strong>
        </article>
      `
    )
    .join('');

  const footerDate = document.getElementById('footer-date');
  if (footerDate) {
    footerDate.textContent = `Export du ${data.club.export_date}`;
  }
}

function renderAssociation(data) {
  const { club_info: info, formats_de_jeu: formats, reglements_et_ethique: rules, documents_source_archives: documents } = data.association;
  const objective = document.getElementById('association-objective');
  if (!objective) return;
  objective.textContent = `${info.objectifs} À ${info.commune}, nous nous retrouvons pour progresser, transmettre et partager une passion commune.`;
  document.getElementById('activities-grid').innerHTML = info.activites_principales.map((activity, index) => {
    const [title, details] = activity.split(' (');
    return `<article class="activity-card"><span>0${index + 1}</span><h3>${title}</h3><p>${details ? `(${details}` : ''}</p></article>`;
  }).join('');
  document.getElementById('formats-list').innerHTML = formats.map((format) => `<article class="format-item"><h3>${format.nom}</h3><p>${format.type} · ${format.format}</p><small>${format.structure}</small></article>`).join('');
  document.getElementById('format-showcase').innerHTML = formats.map((format, index) => `<article class="format-showcase-card"><span class="format-number">0${index + 1}</span><h3>${format.nom}</h3><p>${format.type}</p><small>${format.structure}</small></article>`).join('');
  document.getElementById('ethics-list').innerHTML = rules.charte_ethique_gentleman.slice(0, 5).map((rule) => `<li>${rule}</li>`).join('');
  const documentsList = document.getElementById('documents-list');
  if (!documentsList) return;
  documentsList.innerHTML = documents.map((document) => {
    const isAvailable = localPdfFiles.has(document.fichier) || rulesPdfFiles.has(document.fichier) || memberFolderPdfFiles.has(document.fichier);
    const label = isAvailable ? 'Ouvrir le PDF' : 'PDF à venir';
    return isAvailable
      ? `<a class="document-pill document-available" href="${resolveDocumentUrl(document.fichier)}" target="_blank" rel="noopener"><span>${document.titre}</span><small>${label} ↗</small></a>`
      : `<span class="document-pill document-missing"><span>${document.titre}</span><small>${label}</small></span>`;
  }).join('');
}

function renderFilters(activeValue = 'all') {
  const filtersContainer = document.getElementById('filters');
  if (!filtersContainer) return;
  filtersContainer.innerHTML = filters
    .map(
      (filter) => `
        <button
          class="filter-btn ${filter.value === activeValue ? 'active' : ''}"
          data-filter="${filter.value}"
          type="button"
        >
          ${filter.label}
        </button>
      `
    )
    .join('');

  filtersContainer.querySelectorAll('.filter-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const value = button.dataset.filter;
      renderFilters(value);
      const searchValue = document.getElementById('member-search')?.value.trim().toLowerCase() || '';
      renderMembers(data, value, searchValue);
    });
  });
}

function renderMembers(data, filter = 'all', search = '') {
  let members = [...data.club.members];

  if (filter === 'pdf') {
    members = members.filter((member) => getMemberPdf(member));
  } else if (filter === 'no-pdf') {
    members = members.filter((member) => !getMemberPdf(member));
  }

  if (search) {
    members = members.filter((member) => {
      const haystack = `${member.pseudo} ${member.nom_real}`.toLowerCase();
      return haystack.includes(search);
    });
  }

  const membersGrid = document.getElementById('members-grid');
  if (!membersGrid) return;
  if (!members.length) {
    membersGrid.innerHTML = '<div class="empty-state">Aucun membre ne correspond à votre recherche.</div>';
    return;
  }

  membersGrid.innerHTML = members
    .map((member) => {
      const profilePdf = getMemberPdf(member);
      return `
        <article class="member-card">
          <div class="member-card-header">
            <div>
              <h3>${member.pseudo}</h3>
              <p>${member.nom_real}</p>
            </div>
            ${profilePdf ? `<a class="badge available" href="${resolveDocumentUrl(profilePdf)}" target="_blank" rel="noopener">PDF ↗</a>` : '<span class="badge unavailable">No PDF</span>'}
          </div>
          <div class="member-meta">
            <span class="meta-pill">${profilePdf ? 'Fiche disponible' : 'Fiche absente'}</span>
            ${member.notes ? `<span class="meta-pill">${member.notes}</span>` : ''}
          </div>
          ${profilePdf ? `<a class="member-profile-link" href="${resolveDocumentUrl(profilePdf)}" target="_blank" rel="noopener">Voir la fiche individuelle <span aria-hidden="true">↗</span></a>` : '<span class="member-profile-link member-profile-link-muted">Fiche individuelle à venir</span>'}
        </article>
      `;
    })
    .join('');
}

function renderTimeline(data) {
  const timeline = document.getElementById('timeline');
  if (!timeline) return;
  timeline.innerHTML = data.club.historical_seasons
    .slice()
    .reverse()
    .map(
      (season) => `
        <article class="timeline-item">
          <div class="timeline-year">${season.saison}</div>
          <div class="timeline-content">
            <h3>${season.titre}</h3>
            <p>${season.statut_archivage}</p>
          </div>
        </article>
      `
    )
    .join('');
}

function initBannerCarousel() {
  const carousel = document.querySelector('[data-carousel]');
  if (!carousel) return;

  const slides = [...carousel.querySelectorAll('.site-banner-slide')];
  const dots = carousel.querySelector('.site-banner-dots');
  const previousButton = carousel.querySelector('.site-banner-prev');
  const nextButton = carousel.querySelector('.site-banner-next');
  let activeIndex = 0;
  let timer;

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });
    dots.querySelectorAll('button').forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
      dot.setAttribute('aria-selected', dotIndex === activeIndex ? 'true' : 'false');
    });
  };

  const restartTimer = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => showSlide(activeIndex + 1), 5000);
  };

  dots.innerHTML = slides.map((_, index) => `<button type="button" role="tab" aria-label="Afficher l'image ${index + 1}" aria-selected="${index === 0 ? 'true' : 'false'}" class="${index === 0 ? 'is-active' : ''}"></button>`).join('');
  dots.querySelectorAll('button').forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      restartTimer();
    });
  });
  previousButton.addEventListener('click', () => {
    showSlide(activeIndex - 1);
    restartTimer();
  });
  nextButton.addEventListener('click', () => {
    showSlide(activeIndex + 1);
    restartTimer();
  });
  carousel.addEventListener('mouseenter', () => window.clearInterval(timer));
  carousel.addEventListener('mouseleave', restartTimer);
  carousel.addEventListener('focusin', () => window.clearInterval(timer));
  carousel.addEventListener('focusout', restartTimer);
  restartTimer();
}

let data = null;

(async () => {
  try {
    initBannerCarousel();
    data = await loadData();
    document.title = data.club.club_name || 'Friends Poker Club';
    document.querySelector('.brand-name').textContent = data.club.club_name || 'Friends Poker Club';
    renderStats(data);
    renderAssociation(data);
    renderFilters();
    renderTimeline(data);

    const searchInput = document.getElementById('member-search');
    if (searchInput) {
      searchInput.addEventListener('input', (event) => {
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        renderMembers(data, activeFilter, event.target.value.trim().toLowerCase());
      });
    }

    renderMembers(data, 'all', '');
  } catch (error) {
    const membersGrid = document.getElementById('members-grid');
    if (membersGrid) {
      membersGrid.innerHTML = `<div class="empty-state">${error.message}</div>`;
    }
  }
})();

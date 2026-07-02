const cars = window.carsData || [];
const carColors = ['#FFB020', '#D6483F', '#3E7CB1', '#5B8C5A', '#9C6ADE'];

function carSvg(idx) {
  const color = carColors[idx % carColors.length];
  return `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="55" width="180" height="24" rx="6" fill="${color}"/>
    <path d="M35 55 L55 30 Q60 25 68 25 L132 25 Q140 25 145 30 L165 55 Z" fill="${color}"/>
    <path d="M60 32 L70 30 L98 30 L98 50 L60 50 Z" fill="#15171B" opacity="0.55"/>
    <path d="M102 30 L130 30 L138 50 L102 50 Z" fill="#15171B" opacity="0.55"/>
    <circle cx="55" cy="80" r="14" fill="#15171B"/><circle cx="55" cy="80" r="6" fill="#C8CCD1"/>
    <circle cx="150" cy="80" r="14" fill="#15171B"/><circle cx="150" cy="80" r="6" fill="#C8CCD1"/>
  </svg>`;
}

function getCarMedia(car) {
  const photo = Array.isArray(car.photos) && car.photos.length ? car.photos[0] : car.photo;
  if (photo) {
    return `<img src="${photo}" alt="${car.brand} ${car.model}" loading="lazy">`;
  }
  return carSvg(car.id);
}

function getCarGallery(car) {
  const photos = Array.isArray(car.photos) && car.photos.length ? car.photos : (car.photo ? [car.photo] : []);
  if (!photos.length) {
    return `<div class="detail-photo">${getCarMedia(car)}</div>`;
  }
  return `
    <div class="detail-carousel">
      <div class="detail-carousel-stage">
        <button class="detail-carousel-btn detail-carousel-prev" type="button" aria-label="Previous image">‹</button>
        <img class="detail-carousel-image" src="${photos[0]}" alt="${car.brand} ${car.model}" loading="lazy">
        <button class="detail-carousel-btn detail-carousel-next" type="button" aria-label="Next image">›</button>
      </div>
      <div class="detail-carousel-thumbs">
        ${photos.map((photo, index) => `
          <button class="detail-thumb ${index === 0 ? 'active' : ''}" type="button" data-index="${index}" aria-label="Show image ${index + 1}">
            <img src="${photo}" alt="${car.brand} ${car.model} ${index + 1}" loading="lazy">
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function initCarCarousel(car) {
  const photos = Array.isArray(car.photos) && car.photos.length ? car.photos : (car.photo ? [car.photo] : []);
  if (!photos.length) return;

  const image = document.querySelector('.detail-carousel-image');
  const prevButton = document.querySelector('.detail-carousel-prev');
  const nextButton = document.querySelector('.detail-carousel-next');
  const thumbs = Array.from(document.querySelectorAll('.detail-thumb'));
  let currentIndex = 0;

  function updateCarousel(index) {
    currentIndex = (index + photos.length) % photos.length;
    image.src = photos[currentIndex];
    image.alt = `${car.brand} ${car.model}`;
    thumbs.forEach((thumb, thumbIndex) => thumb.classList.toggle('active', thumbIndex === currentIndex));
  }

  prevButton.addEventListener('click', () => updateCarousel(currentIndex - 1));
  nextButton.addEventListener('click', () => updateCarousel(currentIndex + 1));
  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => updateCarousel(Number(thumb.dataset.index)));
  });
}

function fmtINR(n) {
  if (n >= 100000) {
    return '₹' + (n / 100000).toFixed(2).replace(/\.00$/, '') + ' Lakh';
  }
  return '₹' + n.toLocaleString('en-IN');
}

function fmtFull(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

const grid = document.getElementById('carGrid');
let currentFilter = 'all';
let currentSearch = '';
let currentSort = 'default';

function renderCars() {
  let list = cars.filter((car) => currentFilter === 'all' || car.type === currentFilter);

  if (currentSearch.trim()) {
    const search = currentSearch.toLowerCase();
    list = list.filter((car) => `${car.brand} ${car.model}`.toLowerCase().includes(search));
  }

  if (currentSort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
  if (currentSort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
  if (currentSort === 'year-desc') list = [...list].sort((a, b) => b.year - a.year);

  grid.innerHTML = list.length
    ? list.map((car) => `
      <div class="car-card">
        <div class="car-photo">
          <span class="status-tag ${car.type === 'new' ? 'tag-new' : 'tag-used'}">${car.type === 'new' ? 'New' : 'Used'}</span>
          ${getCarMedia(car)}
        </div>
        <div class="car-body">
          <div class="car-title">${car.brand} ${car.model}</div>
          <div class="car-meta">
            <span>${car.year}</span><span>${car.fuel}</span><span>${car.trans}</span>
            ${car.km ? `<span>${car.km.toLocaleString('en-IN')} km</span>` : '<span>0 km</span>'}
          </div>
          <div class="car-price-row">
            <span class="plate ${car.type === 'new' ? 'amber-plate' : ''}"><span class="flag">IND</span>${fmtINR(car.price)}</span>
          </div>
          <div class="car-actions">
            <button class="btn btn-outline" type="button" onclick="openDetail(${car.id})">View Details</button>
            <button class="btn btn-amber" type="button" onclick="openEnquiryModal('${car.brand} ${car.model}')">Enquire</button>
          </div>
        </div>
      </div>
    `).join('')
    : '<p style="color:#9c9a92; grid-column:1/-1; text-align:center; padding:40px 0;">No cars match your search. Try a different brand or filter.</p>';
}

const valYearSelect = document.getElementById('valYear');
for (let year = 2026; year >= 2011; year -= 1) {
  const option = document.createElement('option');
  option.value = year;
  option.textContent = year;
  valYearSelect.appendChild(option);
}

const brandSelect = document.getElementById('searchBrand');
if (brandSelect) {
  [...new Set(cars.map((car) => car.brand))].forEach((brand) => {
    const option = document.createElement('option');
    option.value = brand;
    option.textContent = brand;
    brandSelect.appendChild(option);
  });
}

renderCars();

document.getElementById('invTabs').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  document.querySelectorAll('#invTabs button').forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  currentFilter = button.dataset.filter;
  renderCars();
});

document.getElementById('invSearch').addEventListener('input', (event) => {
  currentSearch = event.target.value;
  renderCars();
});

document.getElementById('invSort').addEventListener('change', (event) => {
  currentSort = event.target.value;
  renderCars();
});

document.getElementById('modeToggle').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  document.querySelectorAll('#modeToggle button').forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  const mode = button.dataset.mode;
  document.getElementById('buyFields').style.display = mode === 'sell' ? 'none' : 'block';
  document.getElementById('sellFields').style.display = mode === 'sell' ? 'block' : 'none';
});

document.getElementById('searchBtn').addEventListener('click', () => {
  const activeMode = document.querySelector('#modeToggle button.active').dataset.mode;
  const brand = document.getElementById('searchBrand').value;
  const [min, max] = document.getElementById('searchBudget').value.split('-').map(Number);
  currentFilter = activeMode === 'used' ? 'used' : 'all';
  document.querySelectorAll('#invTabs button').forEach((button) => button.classList.toggle('active', button.dataset.filter === currentFilter));
  currentSearch = brand || '';
  document.getElementById('invSearch').value = brand || '';
  let list = cars.filter((car) => (currentFilter === 'all' || car.type === currentFilter) && car.price >= min && car.price <= max && (!brand || car.brand === brand));
  if (!list.length) {
    list = cars.filter((car) => (currentFilter === 'all' || car.type === currentFilter));
  }
  grid.innerHTML = list.length ? list.map((car) => `
    <div class="car-card">
      <div class="car-photo">
        <span class="status-tag ${car.type === 'new' ? 'tag-new' : 'tag-used'}">${car.type === 'new' ? 'New' : 'Used'}</span>
        ${getCarMedia(car)}
      </div>
      <div class="car-body">
        <div class="car-title">${car.brand} ${car.model}</div>
        <div class="car-meta"><span>${car.year}</span><span>${car.fuel}</span><span>${car.trans}</span>${car.km ? `<span>${car.km.toLocaleString('en-IN')} km</span>` : '<span>0 km</span>'}</div>
        <div class="car-price-row"><span class="plate ${car.type === 'new' ? 'amber-plate' : ''}"><span class="flag">IND</span>${fmtINR(car.price)}</span></div>
        <div class="car-actions">
          <button class="btn btn-outline" type="button" onclick="openDetail(${car.id})">View Details</button>
          <button class="btn btn-amber" type="button" onclick="openEnquiryModal('${car.brand} ${car.model}')">Enquire</button>
        </div>
      </div>
    </div>
  `).join('') : '<p style="color:#9c9a92; grid-column:1/-1; text-align:center; padding:40px 0;">No cars matched that search.</p>';
  scrollToSection('inventory');
});

function filterByBrandFooter(event, brand) {
  event.preventDefault();
  currentSearch = brand;
  document.getElementById('invSearch').value = brand;
  currentFilter = 'all';
  document.querySelectorAll('#invTabs button').forEach((button) => button.classList.toggle('active', button.dataset.filter === 'all'));
  renderCars();
  scrollToSection('inventory');
}

function openDetail(id) {
  const car = cars.find((item) => item.id === id);
  document.getElementById('detailModalBody').innerHTML = `
    <button class="modal-close" onclick="closeModal('detailOverlay')">✕</button>
    ${getCarGallery(car)}
    <h3>${car.brand} ${car.model}</h3>
    <p class="sub">${car.type === 'new' ? 'Brand New' : 'Certified Used'} · ${car.color}</p>
    <span class="plate ${car.type === 'new' ? 'amber-plate' : ''}" style="margin-bottom:20px; display:inline-flex;"><span class="flag">IND</span>${fmtINR(car.price)}</span>
    <div class="spec-grid">
      <div class="spec-item"><span>Year</span><b>${car.year}</b></div>
      <div class="spec-item"><span>Fuel Type</span><b>${car.fuel}</b></div>
      <div class="spec-item"><span>Transmission</span><b>${car.trans}</b></div>
      <div class="spec-item"><span>Odometer</span><b>${car.km ? car.km.toLocaleString('en-IN') + ' km' : '0 km'}</b></div>
      <div class="spec-item"><span>Color</span><b>${car.color}</b></div>
      <div class="spec-item"><span>Est. EMI</span><b>${fmtFull(estimateEmi(car.price))}/mo</b></div>
    </div>
    ${car.details ? `<p style="margin-bottom:16px; color:#d4d2c9;">${car.details}</p>` : ''}
    <div style="display:flex; gap:10px;">
      <button class="btn btn-outline" style="flex:1;" type="button" onclick="closeModal('detailOverlay')">Close</button>
      <button class="btn btn-amber" style="flex:1;" type="button" onclick="closeModal('detailOverlay'); openEnquiryModal('${car.brand} ${car.model}')">Enquire About This Car</button>
    </div>
  `;
  document.getElementById('detailOverlay').classList.add('show');
  initCarCarousel(car);
}

function estimateEmi(price) {
  const loan = price * 0.85;
  const rate = 0.095 / 12;
  const n = 60;
  return loan * rate * Math.pow(1 + rate, n) / (Math.pow(1 + rate, n) - 1);
}

function openEnquiryModal(context) {
  document.getElementById('enquiryForm').style.display = 'block';
  document.getElementById('enquirySuccess').style.display = 'none';
  document.getElementById('enquiryForm').reset();
  document.getElementById('enquiryTitle').textContent = context ? `Enquire — ${context}` : 'Get a Quote';
  document.getElementById('enquirySub').textContent = context
    ? `Interested in the ${context}? Leave your number and we'll call you back.`
    : 'Tell us what you are looking for and our team will call you back shortly.';
  document.getElementById('enquirySubjectField').value = context
    ? `New Enquiry — ${context} — Shiva Car Deals`
    : 'New Enquiry — Shiva Car Deals';
  document.getElementById('enquiryOverlay').classList.add('show');
}

async function submitToWeb3Forms(formEl) {
  const response = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    body: new FormData(formEl)
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.message || 'Submission failed');
  return data;
}

document.getElementById('enquiryForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  const button = document.getElementById('enquirySubmitBtn');
  const originalLabel = button.textContent;
  button.textContent = 'Sending…';
  button.disabled = true;
  try {
    await submitToWeb3Forms(form);
    document.getElementById('enquiryForm').style.display = 'none';
    document.getElementById('enquirySuccess').style.display = 'block';
  } catch (error) {
    showToast("Couldn't send — please try again or call us directly.");
  } finally {
    button.textContent = originalLabel;
    button.disabled = false;
  }
});

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}

document.querySelectorAll('.modal-overlay').forEach((overlay) => {
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) overlay.classList.remove('show');
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.show').forEach((overlay) => overlay.classList.remove('show'));
  }
});

document.getElementById('valuationForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  const brand = document.getElementById('valBrand').value;
  const year = parseInt(document.getElementById('valYear').value, 10);
  const km = parseFloat(document.getElementById('valKm').value) || 0;
  const condition = parseFloat(document.getElementById('valCondition').value);
  const brandBase = { 'Maruti Suzuki': 700000, Hyundai: 850000, Tata: 800000, Mahindra: 950000, Honda: 900000, Toyota: 1100000, Kia: 950000, Other: 650000 }[brand] || 650000;
  const age = Math.max(0, 2026 - year);
  const ageDep = Math.pow(0.89, age);
  const kmDep = Math.max(0.55, 1 - (km / 15000) * 0.035);
  const value = brandBase * ageDep * kmDep * condition;
  const low = Math.max(50000, value * 0.9);
  const high = value * 1.1;
  const rangeText = fmtINR(low) + ' – ' + fmtINR(high);

  document.getElementById('valOutput').textContent = rangeText;
  document.getElementById('valResult').classList.add('show');
  document.getElementById('valResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  document.getElementById('valMessageField').value = `Brand: ${brand} | Year: ${year} | KM Driven: ${km} | Condition factor: ${condition} | Estimated Range: ${rangeText}`;

  const submitButton = form.querySelector('button[type=submit]');
  const originalLabel = submitButton.textContent;
  submitButton.textContent = 'Sending…';
  submitButton.disabled = true;
  try {
    await submitToWeb3Forms(form);
    showToast('Your valuation request was sent — we will confirm the final offer shortly.');
  } catch (error) {
    showToast("Estimate shown below, but we couldn't notify our team — please call us directly.");
  } finally {
    submitButton.textContent = originalLabel;
    submitButton.disabled = false;
  }
});

const loanAmt = document.getElementById('loanAmt');
const downPay = document.getElementById('downPay');
const tenure = document.getElementById('tenure');
const rate = document.getElementById('rate');

function updateEmi() {
  const principal = Math.max(0, +loanAmt.value - +downPay.value);
  const months = +tenure.value;
  const monthlyRate = (+rate.value / 100) / 12;
  const emi = monthlyRate === 0 ? principal / months : principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  const total = emi * months;
  const interest = total - principal;

  document.getElementById('loanAmtLabel').textContent = fmtFull(+loanAmt.value);
  document.getElementById('downPayLabel').textContent = fmtFull(+downPay.value);
  document.getElementById('tenureLabel').textContent = months + ' months';
  document.getElementById('rateLabel').textContent = (+rate.value).toFixed(1) + '%';
  document.getElementById('emiOutput').textContent = fmtFull(emi) + '/mo';
  document.getElementById('emiPrincipal').textContent = fmtFull(principal);
  document.getElementById('emiInterest').textContent = fmtFull(interest);
  document.getElementById('emiTotal').textContent = fmtFull(total);
}

[loanAmt, downPay, tenure, rate].forEach((element) => element.addEventListener('input', updateEmi));
updateEmi();

const slides = document.querySelectorAll('.testi-slide');
const dotsWrap = document.getElementById('testiDots');
let testiIndex = 0;

slides.forEach((_, index) => {
  const dot = document.createElement('div');
  dot.className = 'dot' + (index === 0 ? ' active' : '');
  dot.addEventListener('click', () => goTestimonial(index));
  dotsWrap.appendChild(dot);
});

function goTestimonial(index) {
  slides[testiIndex].classList.remove('active');
  dotsWrap.children[testiIndex].classList.remove('active');
  testiIndex = (index + slides.length) % slides.length;
  slides[testiIndex].classList.add('active');
  dotsWrap.children[testiIndex].classList.add('active');
}

document.getElementById('testiPrev').addEventListener('click', () => goTestimonial(testiIndex - 1));
document.getElementById('testiNext').addEventListener('click', () => goTestimonial(testiIndex + 1));
setInterval(() => goTestimonial(testiIndex + 1), 6000);

document.getElementById('contactForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  const button = document.getElementById('contactSubmitBtn');
  const originalLabel = button.textContent;
  button.textContent = 'Sending…';
  button.disabled = true;
  try {
    await submitToWeb3Forms(form);
    showToast('Message sent — we will get back to you within the hour.');
    form.reset();
  } catch (error) {
    showToast("Couldn't send — please try again or call us directly.");
  } finally {
    button.textContent = originalLabel;
    button.disabled = false;
  }
});

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.getElementById('navLinks').classList.remove('open');
}

document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    scrollToSection(link.getAttribute('href').slice(1));
  });
});

document.getElementById('hamburgerBtn').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

function getDirections() {
  window.open('https://www.google.com/maps/dir/?api=1&destination=Model+Town,+Rewari,+Haryana', '_blank');
}

const topButton = document.getElementById('topBtn');
window.addEventListener('scroll', () => {
  topButton.classList.toggle('show', window.scrollY > 600);
});
topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Mobile menu
  const toggle = $('.menu-toggle'), nav = $('#nav');
  const setMenu = open => { nav.classList.toggle('open', open); toggle.setAttribute('aria-expanded', open); };
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));
  addEventListener('resize', () => innerWidth > 860 && setMenu(false));

  // Star ratings
  $$('.rate').forEach(el => {
    const n = +el.dataset.stars;
    el.innerHTML = Array.from({ length: 5 }, (_, i) =>
      `<svg class="${i < n ? 'on' : ''}"><use href="#ico-star"/></svg>`).join('');
  });

  // Dates
  const fmt = d => d.toISOString().slice(0, 10);
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const cin = $('#checkin'), cout = $('#checkout'), result = $('#result');
  const today = new Date();
  cin.min = fmt(today);
  cin.value = fmt(addDays(today, 1));
  cout.min = fmt(addDays(today, 2));
  cout.value = fmt(addDays(today, 4));
  cin.addEventListener('change', () => {
    if (!cin.value) return;
    const min = addDays(new Date(cin.value), 1);
    cout.min = fmt(min);
    if (!cout.value || new Date(cout.value) < min) cout.value = fmt(min);
  });

  // Toast
  const toast = $('#toast'); let timer;
  const say = msg => {
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(timer); timer = setTimeout(() => toast.classList.remove('show'), 3200);
  };

  // Book a room
  let selected = null;
  $$('.book-room').forEach(btn => btn.addEventListener('click', () => {
    const card = btn.closest('.card');
    selected = { name: card.dataset.room, price: +card.dataset.price };
    say(`${selected.name} selected. Choose your dates.`);
    $('#availability').scrollIntoView({ behavior: 'smooth' });
    cin.focus({ preventScroll: true });
  }));

  // Availability
  $('#availForm').addEventListener('submit', e => {
    e.preventDefault();
    result.className = 'result';
    if (!cin.value || !cout.value) { result.classList.add('err'); result.textContent = 'Please choose both check-in and check-out dates.'; return; }
    const a = new Date(cin.value), b = new Date(cout.value);
    const nights = Math.round((b - a) / 864e5);
    if (nights < 1) { result.classList.add('err'); result.textContent = 'Check-out must be after check-in.'; return; }
    const room = selected ? `${selected.name} is` : 'Rooms are';
    const total = selected ? ` Total: $${(nights * selected.price).toLocaleString()} for ${nights} night${nights > 1 ? 's' : ''}.` : ` ${nights} night${nights > 1 ? 's' : ''} selected.`;
    result.classList.add('ok');
    result.textContent = `${room} available from ${a.toDateString()} to ${b.toDateString()}.${total}`;
  });
})();

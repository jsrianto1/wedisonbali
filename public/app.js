(() => {
  'use strict';
  const en = document.documentElement.lang === 'en';
  const t = (id, english) => en ? english : id;
  const number = value => en ? String(value).replace(',', '.') : value;
  const prefix = en ? '/en' : '';
  const phone = '628195693282';
  const money = value => 'Rp' + new Intl.NumberFormat('id-ID').format(value);
  const wa = message => `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.getElementById('mobile-menu');
  function closeMenu() {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', t('Buka menu', 'Open menu'));
    menu.hidden = true;
    document.body.classList.remove('menu-open');
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? t('Tutup menu', 'Close menu') : t('Buka menu', 'Open menu'));
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
  });
  menu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (menu.hidden) return;
    if (event.key === 'Escape') { closeMenu(); menuButton.focus(); }
    if (event.key === 'Tab') {
      const links = [...menu.querySelectorAll('a')];
      if (!event.shiftKey && document.activeElement === links.at(-1)) { event.preventDefault(); menuButton.focus(); }
      if (event.shiftKey && document.activeElement === menuButton) { event.preventDefault(); links.at(-1).focus(); }
    }
  });
  matchMedia('(min-width:821px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  const booking = document.getElementById('booking-form');
  if (booking) {
    const model = document.getElementById('booking-model');
    const names = {bees:'Bees', athena:'Athena', victory:'Victory', edpower:'EdPower'};
    const requested = new URLSearchParams(location.search).get('model');
    if (names[requested]) model.value = names[requested];
    const date = document.getElementById('booking-date');
    const baliToday = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Makassar', year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    date.min = baliToday;
    booking.addEventListener('submit', event => {
      event.preventDefault();
      date.setCustomValidity(date.value && date.value < baliToday ? t('Pilih tanggal hari ini atau setelahnya.', 'Choose today or a later date.') : '');
      if (!booking.reportValidity()) return;
      const name = document.getElementById('booking-name').value.trim();
      let message = t('Halo Wedison Bali, saya ingin menjadwalkan test ride untuk pembelian pribadi.', 'Hello Wedison Bali, I would like to schedule a test ride for a personal purchase.');
      if (name) message += `\n${t("Nama", "Name")}: ${name}`;
      message += `\n${t("Motor", "Motorcycle")}: ${model.value === "Belum menentukan" ? t("Belum menentukan", "Help me choose") : model.value}\n${t("Lokasi", "Location")}: Showroom Wedison Bali, Gatot Subroto Tengah No.93, Denpasar.`;
      const paint = document.getElementById('booking-color');
      if (paint?.value && !paint.disabled) message += `\n${t('Warna pilihan', 'Preferred colour')}: ${paint.selectedOptions[0].textContent}`;
      if (date.value) {
        const [y,m,d] = date.value.split('-');
        message += `\n${t("Rencana tanggal", "Preferred date")}: ${d}/${m}/${y} (WITA).`;
      }
      message += t('\nMohon konfirmasi jadwal, ketersediaan unit, dan persyaratannya. Terima kasih.', '\nPlease confirm the schedule, motorcycle availability and requirements. Thank you.');
      window.open(wa(message), '_blank', 'noopener,noreferrer');
    });
    date.addEventListener('input', () => date.setCustomValidity(''));
  }

  const comparison = document.getElementById('comparison');
  const variant = document.getElementById('variant');
  if (!comparison && !variant) return;
  fetch('/assets/models.json').then(response => {
    if (!response.ok) throw new Error('Catalog unavailable');
    return response.json();
  }).then(models => {
    if (comparison) {
      const first = document.getElementById('compare-a');
      const second = document.getElementById('compare-b');
      const draw = changed => {
        if (first.value === second.value) {
          const other = changed === first ? second : first;
          other.value = models.find(m => m.id !== changed.value).id;
        }
        const chosen = [first.value,second.value].map(id => models.find(m => m.id === id));
        const row = (label, get, cls='') => `<tr><th scope="row">${label}</th>${chosen.map(m => `<td class="${cls}">${get(m)}</td>`).join('')}</tr>`;
        comparison.innerHTML = `<table class="compare-table"><caption>${t("Perbandingan", "Comparison:")} ${chosen[0].name} ${t("dan", "and")} ${chosen[1].name}, ${t("varian Regular", "Regular variants")}</caption><thead><tr><th scope="col"><span class="eyebrow">${t("KENALI<br>PERBEDAANNYA", "SEE THE<br>DIFFERENCE")}</span></th>${chosen.map(m=>`<th scope="col"><img class="compare-bike" src="/assets/${m.id}.webp" alt="Wedison ${m.name}" width="760" height="635"><div class="compare-name">${m.name}<span>${t("Baterai Regular", "Regular battery")}</span></div></th>`).join('')}</tr></thead><tbody>${row(t('Harga OTR Bali', 'Bali OTR price'), m=>money(m.price),'price-cell')}${row(t('Jarak tempuh hingga', 'Range up to'),m=>`${m.range} km*`)}${row(t('Kapasitas baterai', 'Battery capacity'),m=>`${number(m.battery)} kWh`)}${row(t('Daya motor', 'Motor power'),m=>`${number(m.power)} kW`)}${row(t('Kecepatan maksimum', 'Top speed'),m=>`${m.speed} ${t("km/jam", "km/h")}`)}${row('SuperCharge 10-80%',m=>m.supercharge?t('±15 menit*', 'Approx. 15 min*'):t('Tidak tersedia', 'Not available'))}${row('Home charging',()=> t('Tersedia', 'Available'))}${row(t('Kenali lebih dekat', 'Explore the model'),m=>`<a class="text-link" href="${prefix}/motor/${m.id}/">${t("Detail", "Explore")} ${m.name} <span aria-hidden="true">↗</span></a>`)}</tbody></table>`;
      };
      first.addEventListener('change', () => draw(first));
      second.addEventListener('change', () => draw(second));
      draw(first);
    }
    if (variant) {
      const model = models.find(m=>m.id === document.body.dataset.model);
      if (!model) return;
      const updateVariant = () => {
        const extended = variant.value === 'extended' && model.extended;
        const label = extended ? 'Extended' : 'Regular';
        const price = extended ? model.extended : model.price;
        document.getElementById('variant-price').textContent = money(price);
        document.getElementById('variant-range').textContent = extended ? model.rangeExtended : model.range;
        document.getElementById('variant-battery').innerHTML = `${number(extended ? model.batteryExtended : model.battery)}<small>kWh</small>`;
        const paint = document.body.dataset.selectedColorLabel;
        const preference = paint ? (en ? ` Preferred colour: ${paint}.` : ` Warna pilihan: ${paint}.`) : '';
        document.getElementById('product-inquiry').href = wa(en ? `Hello Wedison Bali, I am interested in ${model.name} ${label} at the Bali OTR price of ${money(price)}.${preference} Please share availability and a personal purchase offer.` : `Halo Wedison Bali, saya tertarik ${model.name} ${label}, harga OTR Bali ${money(price)}.${preference} Mohon info ketersediaan dan penawaran pembelian pribadi.`);
      };
      variant.addEventListener('change', updateVariant);
      document.addEventListener('wedison:color', updateVariant);
      updateVariant();
    }
  }).catch(() => {
    if (comparison) comparison.innerHTML = `<p>${t("Perbandingan belum dapat dimuat.", "The comparison could not be loaded.")} <a class="text-link" href="${prefix}/harga/">${t("Lihat semua harga dan varian ↗", "See all prices and variants ↗")}</a></p>`;
    if (variant) {
      variant.disabled = true;
      const message = document.createElement('p');
      message.className = 'fine-print';
      message.textContent = t('Pilihan varian belum dapat dimuat. Lihat daftar harga untuk seluruh varian atau hubungi tim Bali.', 'Battery options could not be loaded. See all variants on the price list or contact the Bali team.');
      variant.after(message);
    }
  });
})();

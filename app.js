(function () {
  'use strict';

  const DENVER_TZ = 'America/Denver';

  function formatPrice(n) {
    if (typeof n !== 'number' || Number.isNaN(n)) return '—';
    return '$' + n.toFixed(3);
  }

  function formatDenverNow(date) {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: DENVER_TZ,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
      }).format(date);
    } catch (_) {
      return date.toLocaleString();
    }
  }

  function fillDeal(prefix, deal) {
    const priceEl = document.getElementById(prefix + '-price');
    const stationEl = document.getElementById(prefix + '-station');
    const addressEl = document.getElementById(prefix + '-address');
    const reportedEl = document.getElementById(prefix + '-reported');
    const linkEl = document.getElementById(prefix + '-link');

    if (!deal) {
      priceEl.textContent = '—';
      stationEl.textContent = 'No data';
      addressEl.textContent = '';
      reportedEl.textContent = '';
      linkEl.hidden = true;
      return;
    }

    const brand = deal.brand ? deal.brand + ' · ' : '';
    priceEl.textContent = formatPrice(deal.price);
    stationEl.textContent = brand + (deal.station || 'Unknown station');
    addressEl.textContent = [deal.address, deal.city].filter(Boolean).join(', ');
    reportedEl.textContent = deal.reported ? 'Reported: ' + deal.reported : '';

    if (deal.url) {
      linkEl.href = deal.url;
      linkEl.hidden = false;
    } else {
      linkEl.hidden = true;
    }
  }

  function renderOthers(stations) {
    const section = document.getElementById('others-section');
    const list = document.getElementById('others-list');
    list.innerHTML = '';

    if (!Array.isArray(stations) || stations.length === 0) {
      section.hidden = true;
      return;
    }

    stations.forEach((s) => {
      const li = document.createElement('li');
      const grade = (s.grade || 'regular').toLowerCase();
      const brand = s.brand ? s.brand + ' · ' : '';
      li.innerHTML =
        '<div class="other-meta">' +
          '<div class="other-name"></div>' +
          '<div class="other-addr"></div>' +
          '<div class="other-grade"></div>' +
        '</div>' +
        '<div class="other-price' + (grade === 'premium' ? ' premium' : '') + '"></div>';
      li.querySelector('.other-name').textContent = brand + (s.station || 'Station');
      li.querySelector('.other-addr').textContent = [s.address, s.city].filter(Boolean).join(', ');
      li.querySelector('.other-grade').textContent = grade + (s.reported ? ' · ' + s.reported : '');
      li.querySelector('.other-price').textContent = formatPrice(s.price);
      list.appendChild(li);
    });

    section.hidden = false;
  }

  async function loadPrices() {
    const meta = document.getElementById('refresh-meta');
    const banner = document.getElementById('sample-banner');
    const err = document.getElementById('error');
    err.hidden = true;

    const viewedAt = formatDenverNow(new Date());

    try {
      const res = await fetch('data/prices.json?t=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();

      fillDeal('regular', data.regular);
      fillDeal('premium', data.premium);
      renderOthers(data.stations);

      const snapshotLabel = data.updatedAtDenver || data.updatedAt || 'unknown';
      meta.textContent = 'Snapshot: ' + snapshotLabel + ' · Viewed: ' + viewedAt;

      if (data.note) {
        banner.textContent = data.note;
        banner.hidden = false;
      } else {
        banner.hidden = true;
      }
    } catch (e) {
      meta.textContent = 'Viewed: ' + viewedAt;
      err.textContent = 'Could not load prices.json. Try refreshing when online.';
      err.hidden = false;
      console.error(e);
    }
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch((e) => {
        console.warn('SW registration failed', e);
      });
    });
  }

  loadPrices();
})();

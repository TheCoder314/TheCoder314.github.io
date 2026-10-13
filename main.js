/* Aarit Dixit — page behaviours. Everything here is progressive:
   without JavaScript the page still reads top to bottom. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $$ = function (sel, root) { return [].slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- header rule on scroll ---------- */
  var top = document.querySelector('.top');
  function onScroll() { if (top) top.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- nav: mark the section on screen ---------- */
  var links = $$('.top nav a[href^="#"]');
  if ('IntersectionObserver' in window && links.length) {
    var map = {};
    links.forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s) map[s.id] = a; });
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id]) {
          links.forEach(function (a) { a.removeAttribute('aria-current'); });
          map[e.target.id].setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { navIO.observe(document.getElementById(id)); });
  }

  /* ---------- count-up numbers ---------- */
  function countUp(el) {
    if (el.dataset.counted) return; el.dataset.counted = '1';
    var end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0);
    var pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    if (reduce) return;
    var t0 = null, dur = 1200;
    function f(t) {
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = pre + (end * e).toFixed(dec) + suf;
      if (k < 1) requestAnimationFrame(f); else el.textContent = pre + end.toFixed(dec) + suf;
    }
    requestAnimationFrame(f);
  }

  /* ---------- scroll reveals ---------- */
  var reveals = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    var rIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        $$('[data-count]', e.target).forEach(countUp);
        rIO.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: .05 });
    reveals.forEach(function (el) { rIO.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- project stages: auto-playing image galleries ---------- */
  $$('[data-stage]').forEach(function (stage) {
    var slides = $$('.slide', stage), bars = stage.querySelector('.bars');
    if (slides.length < 2) return;
    var DUR = 5000, i = 0, timer = null, visible = false, hovering = false;
    stage.style.setProperty('--dur', DUR + 'ms');
    var btns = slides.map(function (s, k) {
      var b = document.createElement('button');
      b.type = 'button';
      var cap = s.querySelector('figcaption');
      b.setAttribute('aria-label', 'Show image ' + (k + 1) + (cap ? ': ' + cap.textContent : ''));
      b.innerHTML = '<i></i>';
      b.addEventListener('click', function () { go(k); });
      bars.appendChild(b);
      return b;
    });
    function go(k) {
      i = (k + slides.length) % slides.length;
      slides.forEach(function (s, n) {
        s.classList.toggle('on', n === i);
        if (s.hasAttribute('data-play')) s.classList.toggle('play', n === i && visible);
      });
      stage.classList.toggle('light-on', slides[i].classList.contains('light'));
      btns.forEach(function (b, n) {
        b.classList.remove('on'); b.classList.toggle('done', n < i);
        if (n === i) { void b.offsetWidth; b.classList.add('on'); }
      });
      b_restart();
    }
    function b_restart() {
      clearTimeout(timer);
      if (reduce || !visible || hovering) return;
      timer = setTimeout(function () { go(i + 1); }, DUR);
    }
    // only play while on screen; pause while the pointer is over it
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      stage.classList.toggle('paused', !visible || hovering || reduce);
      if (visible) { go(i); } else { clearTimeout(timer); }
    }, { threshold: .35 }).observe(stage);
    stage.addEventListener('mouseenter', function () { hovering = true; stage.classList.add('paused'); clearTimeout(timer); });
    stage.addEventListener('mouseleave', function () {
      hovering = false; stage.classList.remove('paused');
      stage.style.transform = ''; go(i);
    });
    if (reduce) stage.classList.add('paused');
    go(0);

    // gentle tilt and glare that follow the pointer
    if (finePointer && !reduce) {
      stage.addEventListener('pointermove', function (ev) {
        var r = stage.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
        stage.style.transform = 'rotateY(' + ((x - .5) * 5).toFixed(2) + 'deg) rotateX(' + ((.5 - y) * 4).toFixed(2) + 'deg)';
        stage.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
        stage.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
      });
    }
  });

  /* ---------- toolbox filter ---------- */
  var list = document.getElementById('tools-list');
  var fbtns = $$('.filter button');
  fbtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.dataset.f;
      fbtns.forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      list.classList.toggle('filtered', f !== 'all');
      $$('.tool', list).forEach(function (t) {
        t.classList.toggle('hit', f !== 'all' && (t.dataset.p || '').split(' ').indexOf(f) > -1);
      });
    });
  });

  /* ---------- contact card: soft light follows the pointer ---------- */
  var card = document.querySelector('.contact');
  if (card && finePointer && !reduce) {
    card.addEventListener('pointermove', function (ev) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
      card.style.setProperty('--my', (ev.clientY - r.top) + 'px');
    });
  }

  /* ---------- plan-view drawing: plot it top to bottom once ---------- */
  var plan = document.getElementById('plan');
  var rect = document.getElementById('planRevealRect');
  var scan = document.getElementById('planScan');
  if (plan && rect) {
    var Y0 = -230, H = 1883, DRAW_H = 1592.7;
    if (reduce) {
      plan.classList.add('drawn');
    } else {
      rect.setAttribute('height', 0);
      var t0 = null, dur = 1700;
      var step = function (t) {
        if (t0 === null) t0 = t;
        var k = Math.min(1, (t - t0) / dur);
        var e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        var y = e * DRAW_H;
        rect.setAttribute('height', (y - Y0).toFixed(1));
        scan.setAttribute('y1', y); scan.setAttribute('y2', y);
        scan.style.opacity = k < 1 ? 1 : 0;
        if (k < 1) requestAnimationFrame(step);
        else { rect.setAttribute('height', H); plan.classList.add('drawn'); }
      };
      setTimeout(function () { requestAnimationFrame(step); }, 250);
    }
    var balloons = $$('.balloon', plan), items = $$('.legend li', plan);
    function mark(k) {
      balloons.forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-k') === k); });
      items.forEach(function (li) { li.classList.toggle('on', li.getAttribute('data-k') === k); });
    }
    balloons.concat(items).forEach(function (el) {
      el.addEventListener('mouseenter', function () { mark(el.getAttribute('data-k')); });
      el.addEventListener('mouseleave', function () { mark(null); });
    });
  }

  /* ---------- standalone animations that play when scrolled into view ---------- */
  var plays = $$('[data-play-on-view]');
  if (plays.length) {
    if ('IntersectionObserver' in window) {
      var pIO = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('play'); pIO.unobserve(e.target); } });
      }, { threshold: .4 });
      plays.forEach(function (el) { pIO.observe(el); });
    } else plays.forEach(function (el) { el.classList.add('play'); });
  }

  /* ---------- copy email ---------- */
  var copy = document.getElementById('copyMail');
  if (copy) copy.addEventListener('click', function () {
    var addr = copy.getAttribute('data-mail');
    var done = function () { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy address'; }, 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText(addr).then(done, function () { copy.textContent = addr; });
    else copy.textContent = addr;
  });

  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();
})();

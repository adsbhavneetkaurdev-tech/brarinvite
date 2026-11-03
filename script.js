/* =========================================================
   Gift-box opening sequence, confetti, calendar menu, replay
   ========================================================= */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const stage = $('stage');
  const wrap = $('giftWrap');
  const gift = $('gift');
  const bow = $('bow');
  const lid = $('lid');
  const ribbonV = $('ribbonV');
  const ribbonLid = $('ribbonLid');
  const peek = $('peekCard');
  const hint = $('hint');
  const card = $('card');
  const frame = card.querySelector('.card__frame');
  const replayBtn = $('replay');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canAnimate = typeof Element.prototype.animate === 'function';

  let state = 'closed';            // closed | opening | open
  let running = [];                // Web Animations to cancel on replay

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const anim = (el, frames, opts) => {
    const a = el.animate(frames, Object.assign({ fill: 'forwards' }, opts));
    running.push(a);
    return a;
  };

  /* ---------------- Open ---------------- */
  async function openGift() {
    if (state !== 'closed') return;
    state = 'opening';
    bow.setAttribute('aria-expanded', 'true');

    if (reduceMotion || !canAnimate) {
      showCardInstant();
      return;
    }

    const w = gift.offsetWidth;
    bow.style.animation = 'none';
    anim(hint, [{ opacity: 1 }, { opacity: 0 }], { duration: 250 });

    // 1) Untie: bow pops up and floats away, ribbons slide off   (0 – 700ms)
    anim(bow, [
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'translateY(-10%) scale(1.18)', opacity: 1, offset: 0.3 },
      { transform: 'translate(30%, -160%) rotate(28deg) scale(.55)', opacity: 0 }
    ], { duration: 700, easing: 'cubic-bezier(.3,.6,.3,1)' });

    anim(ribbonLid, [
      { transform: 'translate(-50%, 0)' },
      { transform: 'translate(-50%, -110%)' }
    ], { duration: 420, delay: 180, easing: 'ease-in' });

    anim(ribbonV, [
      { transform: 'translate(-50%, 0)' },
      { transform: 'translate(-50%, 105%)' }
    ], { duration: 520, delay: 200, easing: 'cubic-bezier(.5,0,.75,0)' });

    // 2) Lid lifts and pops off                                  (550 – 1300ms)
    anim(lid, [
      { transform: 'translate(0, 0) rotate(0)', opacity: 1 },
      { transform: 'translate(0, -40%) rotate(0)', opacity: 1, offset: 0.2 },
      { transform: 'translate(-18%, -230%) rotate(-16deg)', opacity: 1, offset: 0.6 },
      { transform: 'translate(-40%, -380%) rotate(-30deg)', opacity: 0 }
    ], { duration: 750, delay: 550, easing: 'cubic-bezier(.2,.7,.3,1)' });

    // 3) Light burst + confetti                                  (~800ms)
    setTimeout(() => {
      const r = gift.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height * 0.35);
    }, 800);

    // 4) Little card rises out of the box                        (850 – 1750ms)
    peek.style.visibility = 'visible';
    const rise = anim(peek, [
      { transform: 'translateY(0) scale(1)' },
      { transform: `translateY(${-w * 0.86}px) scale(1.06)` }
    ], { duration: 900, delay: 850, easing: 'cubic-bezier(.2,.85,.25,1)' });

    await rise.finished.catch(() => {});
    if (state !== 'opening') return;           // replay hit mid-way

    // 5) Card unfolds into the full invitation                   (1750 – 2650ms)
    const stageRect = stage.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    const peekRect = peek.getBoundingClientRect();
    wrap.style.top = (wrapRect.top - stageRect.top) + 'px';   // freeze box in place
    stage.classList.add('is-open');

    const cardRect = card.getBoundingClientRect();
    const s = peekRect.width / cardRect.width;
    const dx = (peekRect.left + peekRect.width / 2) - (cardRect.left + cardRect.width / 2);
    const dy = peekRect.top - cardRect.top;

    anim(peek, [{ opacity: 1 }, { opacity: 0 }], { duration: 220 });
    anim(wrap, [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(50px)' }
    ], { duration: 550, easing: 'ease-in' });

    anim(frame, [{ opacity: 0 }, { opacity: 0, offset: 0.35 }, { opacity: 1 }], { duration: 900 });
    const grow = anim(card, [
      { transform: `translate(${dx}px, ${dy}px) scale(${s})`, opacity: 0.9 },
      { transform: 'translate(0, 0) scale(1)', opacity: 1 }
    ], { duration: 900, easing: 'cubic-bezier(.2,.8,.2,1)' });

    await grow.finished.catch(() => {});
    if (state !== 'opening') return;
    finishOpen();
  }

  function showCardInstant() {
    stage.classList.add('is-open', 'is-done');
    if (canAnimate) anim(card, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
    finishOpen();
  }

  function finishOpen() {
    stage.classList.add('is-done');
    state = 'open';
    card.focus({ preventScroll: true });
  }

  /* ---------------- Replay ---------------- */
  function replay() {
    running.forEach((a) => a.cancel());
    running = [];
    stopConfetti();
    closeCal();

    stage.classList.remove('is-open', 'is-done');
    wrap.style.top = '';
    peek.style.visibility = '';
    bow.style.animation = '';
    bow.setAttribute('aria-expanded', 'false');
    state = 'closed';

    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });

    if (canAnimate && !reduceMotion) {
      // re-wrap: box drops back in with a soft bounce
      const a = gift.animate([
        { transform: 'translateY(-40px) scale(.92)', opacity: 0 },
        { transform: 'translateY(6px) scale(1.01)', opacity: 1, offset: 0.7 },
        { transform: 'translateY(0) scale(1)', opacity: 1 }
      ], { duration: 650, easing: 'cubic-bezier(.3,.7,.3,1)' });
      hint.animate([{ opacity: 0 }, { opacity: 0, offset: .6 }, { opacity: 1 }], { duration: 900 });
      a.finished.then(() => bow.focus({ preventScroll: true })).catch(() => {});
    } else {
      bow.focus({ preventScroll: true });
    }
  }

  gift.addEventListener('click', openGift);
  replayBtn.addEventListener('click', replay);

  /* ---------------- Calendar menu ---------------- */
  const calToggle = $('calToggle');
  const calMenu = $('calMenu');

  function closeCal() {
    calMenu.hidden = true;
    calToggle.setAttribute('aria-expanded', 'false');
  }
  calToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = calMenu.hidden;
    calMenu.hidden = !open;
    calToggle.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (e) => {
    if (!calMenu.hidden && !calMenu.contains(e.target)) closeCal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !calMenu.hidden) { closeCal(); calToggle.focus(); }
  });

  /* ---------------- Confetti & sparkles (canvas) ---------------- */
  const canvas = $('confetti');
  const ctx = canvas.getContext && canvas.getContext('2d');
  const COLORS = ['#f5e1a4', '#d6b25e', '#b8913c', '#fffaf0', '#2f7a5f', '#e9cf86'];
  let parts = [];
  let flash = null;
  let rafId = 0;

  function sizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function burst(x, y) {
    if (!ctx) return;
    sizeCanvas();
    const scale = Math.min(window.innerWidth / 400, 1.6);
    const count = window.innerWidth < 500 ? 110 : 160;
    for (let i = 0; i < count; i++) {
      const angle = (-90 + (Math.random() - 0.5) * 120) * Math.PI / 180;
      const speed = (5 + Math.random() * 9) * scale;
      const sparkle = Math.random() < 0.28;
      parts.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        w: sparkle ? 0 : 5 + Math.random() * 6,
        h: sparkle ? 0 : 3 + Math.random() * 4,
        r: sparkle ? 3 + Math.random() * 5 : 0,
        sparkle,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        tilt: Math.random() * Math.PI,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        life: 0,
        max: 110 + Math.random() * 70
      });
    }
    flash = { x, y, t: 0 };
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  function drawSparkle(p, alpha) {
    const r = p.r * (0.7 + 0.3 * Math.sin(p.life * 0.4));
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.shadowColor = '#f5e1a4';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {        // 4-point glint
      const a = i * Math.PI / 2;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      ctx.lineTo(Math.cos(a + Math.PI / 4) * r * 0.28, Math.sin(a + Math.PI / 4) * r * 0.28);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (flash) {                          // soft golden light from the box
      flash.t += 1;
      const k = flash.t / 40;
      if (k >= 1) flash = null;
      else {
        const rad = 40 + k * 260;
        const g = ctx.createRadialGradient(flash.x, flash.y, 0, flash.x, flash.y, rad);
        g.addColorStop(0, `rgba(255, 240, 200, ${0.55 * (1 - k)})`);
        g.addColorStop(1, 'rgba(255, 240, 200, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(flash.x - rad, flash.y - rad, rad * 2, rad * 2);
      }
    }

    parts = parts.filter((p) => p.life < p.max);
    for (const p of parts) {
      p.life++;
      p.vx *= 0.975;
      p.vy = p.vy * 0.975 + (p.sparkle ? 0.06 : 0.16);
      p.x += p.vx + (p.sparkle ? 0 : Math.sin(p.tilt + p.life * 0.08) * 0.6);
      p.y += p.vy;
      p.rot += p.vr;
      const alpha = Math.min(1, (p.max - p.life) / 40);
      if (p.sparkle) { drawSparkle(p, alpha); continue; }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, Math.cos(p.life * 0.12 + p.tilt));   // flutter
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (parts.length || flash) rafId = requestAnimationFrame(tick);
    else { rafId = 0; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }

  function stopConfetti() {
    parts = []; flash = null;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
})();

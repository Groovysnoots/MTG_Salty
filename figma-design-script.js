// MTG Salty — Figma Plugin API Script
// Paste this into Figma: Plugins → Development → Open Console
// Creates all pages as top-level frames on the canvas

(async () => {
  // ── Helpers ──────────────────────────────────────────────
  const hex = (h) => {
    const r = parseInt(h.slice(1, 3), 16) / 255;
    const g = parseInt(h.slice(3, 5), 16) / 255;
    const b = parseInt(h.slice(5, 7), 16) / 255;
    return { r, g, b };
  };

  const fill = (h, opacity) => {
    const c = hex(h);
    return [{ type: 'SOLID', color: c, opacity: opacity !== undefined ? opacity : 1 }];
  };

  const gradientFill = (stops) => {
    return [{
      type: 'GRADIENT_LINEAR',
      gradientStops: stops,
      gradientTransform: [[1, 0, 0], [0, 1, 0]]
    }];
  };

  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });

  // ── Colors ──────────────────────────────────────────────
  const C = {
    bg:        '#070707',
    card:      '#0A0A0A',
    cardBg:    '#18181B',  // zinc-900/50
    border:    '#27272A',  // zinc-800
    borderSub: '#3F3F46',  // zinc-700
    emerald:   '#10B981',
    emeraldDk: '#059669',
    emeraldBg: '#064E3B',  // emerald-950/15
    white:     '#FFFFFF',
    zinc50:    '#FAFAFA',
    zinc100:   '#F4F4F5',
    zinc200:   '#E4E4E7',
    zinc300:   '#D4D4D8',
    zinc400:   '#A1A1AA',
    zinc500:   '#71717A',
    zinc600:   '#52525B',
    zinc700:   '#3F3F46',
    zinc800:   '#27272A',
    zinc900:   '#18181B',
    green:     '#22C55E',
    yellow:    '#EAB308',
    orange:    '#F97316',
    red:       '#EF4444',
    redDark:   '#991B1B',
  };

  // ── Text helper ─────────────────────────────────────────
  const txt = (parent, str, x, y, size, color, opts = {}) => {
    const t = figma.createText();
    t.characters = str;
    t.fontSize = size;
    t.fills = fill(color);
    t.fontName = { family: 'Inter', style: opts.style || 'Regular' };
    t.x = x;
    t.y = y;
    if (opts.width) {
      t.resize(opts.width, t.height);
      t.textAutoResize = 'HEIGHT';
    }
    if (opts.lineHeight) {
      t.lineHeight = { value: opts.lineHeight, unit: 'PIXELS' };
    }
    if (opts.letterSpacing) {
      t.letterSpacing = { value: opts.letterSpacing, unit: 'PERCENT' };
    }
    if (opts.uppercase) {
      t.textCase = 'UPPER';
    }
    parent.appendChild(t);
    return t;
  };

  // ── Rectangle helper ────────────────────────────────────
  const rect = (parent, x, y, w, h, color, opts = {}) => {
    const r = figma.createRectangle();
    r.x = x;
    r.y = y;
    r.resize(w, h);
    r.fills = fill(color, opts.opacity);
    if (opts.radius) r.cornerRadius = opts.radius;
    if (opts.stroke) {
      r.strokes = fill(opts.stroke, opts.strokeOpacity || 1);
      r.strokeWeight = opts.strokeWeight || 1;
    }
    parent.appendChild(r);
    return r;
  };

  // ── Pill / badge helper ─────────────────────────────────
  const pill = (parent, str, x, y, bgColor, textColor, opts = {}) => {
    const g = figma.createFrame();
    g.x = x;
    g.y = y;
    g.fills = fill(bgColor, opts.bgOpacity || 0.15);
    g.cornerRadius = 999;
    g.layoutMode = 'HORIZONTAL';
    g.paddingLeft = opts.px || 12;
    g.paddingRight = opts.px || 12;
    g.paddingTop = opts.py || 4;
    g.paddingBottom = opts.py || 4;
    g.primaryAxisAlignItems = 'CENTER';
    g.counterAxisAlignItems = 'CENTER';
    if (opts.ring) {
      g.strokes = fill(opts.ring, opts.ringOpacity || 0.2);
      g.strokeWeight = 1;
    }
    const t = figma.createText();
    t.characters = str;
    t.fontSize = opts.fontSize || 12;
    t.fontName = { family: 'Inter', style: opts.fontStyle || 'Bold' };
    t.fills = fill(textColor);
    if (opts.uppercase) t.textCase = 'UPPER';
    if (opts.letterSpacing) t.letterSpacing = { value: opts.letterSpacing, unit: 'PERCENT' };
    g.appendChild(t);
    g.counterAxisSizingMode = 'AUTO';
    g.primaryAxisSizingMode = 'AUTO';
    parent.appendChild(g);
    return g;
  };

  // ── Button helper ───────────────────────────────────────
  const btn = (parent, label, x, y, bgColor, textColor, opts = {}) => {
    const f = figma.createFrame();
    f.x = x;
    f.y = y;
    f.fills = fill(bgColor, opts.bgOpacity);
    f.cornerRadius = opts.radius || 12;
    f.layoutMode = 'HORIZONTAL';
    f.paddingLeft = opts.px || 20;
    f.paddingRight = opts.px || 20;
    f.paddingTop = opts.py || 10;
    f.paddingBottom = opts.py || 10;
    f.primaryAxisAlignItems = 'CENTER';
    f.counterAxisAlignItems = 'CENTER';
    f.counterAxisSizingMode = 'AUTO';
    f.primaryAxisSizingMode = 'AUTO';
    if (opts.stroke) {
      f.strokes = fill(opts.stroke, opts.strokeOpacity || 1);
      f.strokeWeight = 1;
    }
    const t = figma.createText();
    t.characters = label;
    t.fontSize = opts.fontSize || 14;
    t.fontName = { family: 'Inter', style: opts.fontStyle || 'Semi Bold' };
    t.fills = fill(textColor);
    f.appendChild(t);
    parent.appendChild(f);
    return f;
  };

  // ── Nav bar helper (shared across pages) ────────────────
  const createNav = (parent, pageWidth) => {
    // Nav background
    rect(parent, 0, 0, pageWidth, 64, C.bg, { opacity: 0.9 });
    // Bottom border
    rect(parent, 0, 63, pageWidth, 1, C.border, { opacity: 0.6 });

    const navX = (pageWidth - 1152) / 2;

    // Salt emoji
    txt(parent, '🧂', navX, 18, 24, C.white);

    // Brand text
    const brand1 = txt(parent, 'MTG ', navX + 36, 20, 20, C.zinc100, { style: 'Bold' });
    const brand2 = txt(parent, 'Salty', navX + 76, 20, 20, C.emerald, { style: 'Bold' });

    // Tagline
    txt(parent, 'COUNTER ANY COMMANDER.', navX + 900, 24, 12, C.zinc500, {
      style: 'Medium',
      letterSpacing: 5,
      uppercase: true
    });

    return 64;
  };

  // ── Footer helper ───────────────────────────────────────
  const createFooter = (parent, y, pageWidth) => {
    rect(parent, 0, y, pageWidth, 1, C.border, { opacity: 0.4 });
    const footerY = y + 24;
    const navX = (pageWidth - 1152) / 2;
    txt(parent, 'CARD DATA FROM SCRYFALL. NOT AFFILIATED WITH WIZARDS OF THE COAST.', navX, footerY, 11, C.zinc600, {
      style: 'Medium', letterSpacing: 5, uppercase: true
    });
    txt(parent, 'MTG SALTY', navX + 900, footerY, 11, C.zinc700, {
      style: 'Medium', letterSpacing: 5, uppercase: true
    });
  };

  // ── Card image placeholder ──────────────────────────────
  const cardPlaceholder = (parent, x, y, w, h, opts = {}) => {
    const r = rect(parent, x, y, w, h, C.zinc800, { radius: 12, opacity: 0.8 });
    if (opts.ring) {
      r.strokes = fill(C.borderSub, 0.5);
      r.strokeWeight = 1;
    }
    // Card icon hint
    txt(parent, '🂠', x + w / 2 - 10, y + h / 2 - 12, 24, C.zinc500);
    return r;
  };

  // ════════════════════════════════════════════════════════
  // PAGE 1: HOME PAGE
  // ════════════════════════════════════════════════════════
  const home = figma.createFrame();
  home.name = 'Home Page';
  home.resize(1440, 900);
  home.fills = fill(C.bg);
  home.x = 0;
  home.y = 0;

  // Subtle emerald glow at top
  const glow = figma.createEllipse();
  glow.resize(800, 400);
  glow.x = 320;
  glow.y = -100;
  glow.fills = fill(C.emerald, 0.04);
  glow.effects = [{ type: 'LAYER_BLUR', radius: 200, visible: true }];
  home.appendChild(glow);

  createNav(home, 1440);

  const homeX = (1440 - 1152) / 2;

  // Hero heading
  txt(home, "Who's giving you", homeX + 260, 200, 56, C.zinc50, { style: 'Bold' });
  txt(home, 'trouble', homeX + 460, 270, 56, C.emerald, { style: 'Bold' });
  txt(home, '?', homeX + 600, 270, 56, C.zinc50, { style: 'Bold' });

  // Subtitle
  txt(home, 'Search for the commander dominating your playgroup.', homeX + 260, 350, 18, C.zinc400, {
    width: 480, lineHeight: 28
  });
  txt(home, "We'll find the best ways to shut it down.", homeX + 260, 378, 18, C.zinc400, {
    width: 480, lineHeight: 28
  });

  // Search bar
  const searchBarX = homeX + 200;
  const searchBarY = 440;
  rect(home, searchBarX, searchBarY, 600, 52, C.zinc900, {
    radius: 12, opacity: 0.8, stroke: C.borderSub, strokeOpacity: 0.8
  });
  // Search icon
  txt(home, '🔍', searchBarX + 16, searchBarY + 14, 18, C.zinc500);
  // Placeholder text
  txt(home, 'Search for a commander...', searchBarX + 48, searchBarY + 16, 18, C.zinc500);

  // Feature cards
  const features = [
    { icon: '🎯', title: 'Find Counters', desc: "Get commander and card recommendations that target your opponent's strengths." },
    { icon: '🧂', title: 'Adjust the Salt', desc: 'Dial from a gentle sprinkle to maximum salt. Control how hard you counter.' },
    { icon: '📋', title: 'Import & Export', desc: 'Import your Moxfield deck and get targeted suggestions. Export when done.' },
  ];

  features.forEach((f, i) => {
    const fx = homeX + 100 + i * 340;
    const fy = 560;
    // Card background
    rect(home, fx, fy, 300, 180, C.zinc900, {
      radius: 12, opacity: 0.5, stroke: C.border, strokeOpacity: 0.8
    });
    // Icon
    txt(home, f.icon, fx + 130, fy + 24, 30, C.white);
    // Title
    txt(home, f.title, fx + 20, fy + 72, 16, C.zinc200, { style: 'Semi Bold', width: 260 });
    // Description
    txt(home, f.desc, fx + 20, fy + 100, 14, C.zinc500, { width: 260, lineHeight: 22 });
  });

  createFooter(home, 800, 1440);
  figma.currentPage.appendChild(home);

  // ════════════════════════════════════════════════════════
  // PAGE 2: COUNTER PAGE
  // ════════════════════════════════════════════════════════
  const counter = figma.createFrame();
  counter.name = 'Counter Page';
  counter.resize(1440, 2000);
  counter.fills = fill(C.bg);
  counter.x = 1600;
  counter.y = 0;

  createNav(counter, 1440);

  const cX = (1440 - 1152) / 2;
  let cY = 100;

  // Back link
  txt(counter, '← Back to search', cX, cY, 14, C.zinc500);
  cY += 40;

  // Two-column layout: commander image left, info right
  // Commander image
  cardPlaceholder(counter, cX, cY, 244, 340, { ring: true });

  // Commander info - right column
  const infoX = cX + 290;
  txt(counter, 'Atraxa, Praetors\' Voice', infoX, cY, 40, C.zinc100, { style: 'Bold', width: 600 });
  txt(counter, 'Legendary Creature — Phyrexian Angel Horror', infoX, cY + 52, 16, C.zinc400, { width: 600 });

  // Mana symbols placeholder
  const manaColors = ['W', 'U', 'B', 'G'];
  manaColors.forEach((c, i) => {
    const mf = figma.createEllipse();
    mf.resize(24, 24);
    mf.x = infoX + i * 30;
    mf.y = cY + 86;
    const manaColorMap = { W: '#FFF9C4', U: '#64B5F6', B: '#9E9E9E', G: '#81C784' };
    mf.fills = fill(manaColorMap[c] || C.zinc500);
    counter.appendChild(mf);
    txt(counter, c, infoX + i * 30 + 7, cY + 90, 12, '#000000', { style: 'Bold' });
  });

  // Threat Analysis box
  const threatY = cY + 130;
  rect(counter, infoX, threatY, 660, 100, C.emeraldBg, {
    radius: 12, opacity: 0.15, stroke: C.emeraldDk, strokeOpacity: 0.4
  });
  txt(counter, '⚡ THREAT ANALYSIS', infoX + 20, threatY + 16, 12, C.emerald, {
    style: 'Semi Bold', letterSpacing: 5, uppercase: true
  });
  txt(counter, 'Atraxa excels at proliferating counters and building incremental advantage. She creates oppressive board states through poison, planeswalkers, and +1/+1 counters.', infoX + 20, threatY + 42, 14, C.zinc300, {
    width: 620, lineHeight: 22
  });

  // Hate Slider section
  cY += 380;
  txt(counter, 'SALT LEVEL', cX, cY, 12, C.zinc300, {
    style: 'Medium', letterSpacing: 5, uppercase: true
  });

  // Salt badge
  pill(counter, 'FOCUSED', cX + 120, cY - 4, C.orange, C.orange, {
    bgOpacity: 0.15, ring: C.orange, ringOpacity: 0.2,
    fontSize: 12, uppercase: true, letterSpacing: 5
  });

  // Slider track
  const sliderY = cY + 30;
  const sliderTrack = figma.createRectangle();
  sliderTrack.x = cX;
  sliderTrack.y = sliderY;
  sliderTrack.resize(450, 8);
  sliderTrack.cornerRadius = 999;
  sliderTrack.fills = [{
    type: 'GRADIENT_LINEAR',
    gradientStops: [
      { position: 0, color: { ...hex(C.green), a: 1 } },
      { position: 0.25, color: { ...hex(C.yellow), a: 1 } },
      { position: 0.5, color: { ...hex(C.orange), a: 1 } },
      { position: 0.75, color: { ...hex(C.red), a: 1 } },
      { position: 1, color: { ...hex(C.redDark), a: 1 } },
    ],
    gradientTransform: [[1, 0, 0], [0, 1, 0]]
  }];
  counter.appendChild(sliderTrack);

  // Slider thumb
  const thumb = figma.createEllipse();
  thumb.resize(22, 22);
  thumb.x = cX + 220;
  thumb.y = sliderY - 7;
  thumb.fills = fill(C.white);
  thumb.strokes = fill(C.emeraldDk);
  thumb.strokeWeight = 3;
  thumb.effects = [{
    type: 'DROP_SHADOW', color: { ...hex(C.emeraldDk), a: 0.5 },
    offset: { x: 0, y: 0 }, radius: 12, visible: true, spread: 0
  }];
  counter.appendChild(thumb);

  // Slider numbers
  for (let i = 1; i <= 5; i++) {
    const numX = cX + (i - 1) * 112;
    const isActive = i === 3;
    if (isActive) {
      const numBg = figma.createEllipse();
      numBg.resize(24, 24);
      numBg.x = numX;
      numBg.y = sliderY + 18;
      numBg.fills = fill(C.zinc700);
      counter.appendChild(numBg);
    }
    txt(counter, String(i), numX + 8, sliderY + 22, 12,
      isActive ? C.zinc100 : C.zinc600,
      { style: isActive ? 'Bold' : 'Regular' }
    );
  }

  // Slider description
  txt(counter, 'Targeted removal and specific hate cards. Efficient but not oppressive.', cX, sliderY + 52, 14, C.zinc500, {
    width: 450, lineHeight: 22
  });

  // ── Section divider ──
  cY = sliderY + 100;
  rect(counter, cX, cY, 1152, 1, C.zinc500, { opacity: 0.3 });

  // ── Counter Commanders section ──
  cY += 30;
  txt(counter, 'Counter Commanders', cX, cY, 20, C.zinc100, { style: 'Bold' });
  cY += 40;

  // Commander cards grid (3 columns)
  const cmdNames = [
    { name: 'Solemnity', type: 'Enchantment', reason: 'Prevents all counters from being placed, shutting down Atraxa\'s proliferate entirely.' },
    { name: 'Thalia, Guardian', type: 'Legendary Creature', reason: 'Taxes noncreature spells, slowing Atraxa\'s setup and planeswalker deployment.' },
    { name: 'Torpor Orb', type: 'Artifact', reason: 'Shuts down ETB effects that many Atraxa builds rely on for value.' },
  ];

  cmdNames.forEach((cmd, i) => {
    const cx = cX + i * 380;
    // Card frame
    rect(counter, cx, cY, 352, 380, C.zinc900, {
      radius: 12, opacity: 0.5, stroke: C.border, strokeOpacity: 0.8
    });
    // Card image
    cardPlaceholder(counter, cx + 96, cY + 20, 160, 223);
    // Name
    txt(counter, cmd.name, cx + 20, cY + 260, 16, C.zinc100, { style: 'Bold', width: 312 });
    // Type
    txt(counter, cmd.type, cx + 20, cY + 284, 13, C.zinc500, { width: 312 });
    // Reason
    txt(counter, cmd.reason, cx + 20, cY + 310, 14, C.zinc300, { width: 312, lineHeight: 20 });
  });

  // ── Section divider ──
  cY += 420;
  rect(counter, cX, cY, 1152, 1, C.zinc500, { opacity: 0.3 });

  // ── Counter Cards section ──
  cY += 30;
  txt(counter, 'Counter Cards', cX, cY, 20, C.zinc100, { style: 'Bold' });

  // Total price badge
  pill(counter, 'TOTAL: $24.87', cX + 200, cY - 2, C.emerald, C.emerald, {
    bgOpacity: 0.1, fontSize: 12, uppercase: true, letterSpacing: 5
  });

  cY += 40;

  // Category header
  const catHeader = (parent, label, count, yPos) => {
    rect(parent, cX, yPos + 8, 200, 1, C.zinc800);
    txt(parent, `${label} (${count})`, cX + 210, yPos, 11, C.zinc500, {
      style: 'Semi Bold', letterSpacing: 5, uppercase: true
    });
    rect(parent, cX + 460, yPos + 8, 692, 1, C.zinc800);
  };

  catHeader(counter, 'Removal', 3, cY);
  cY += 24;

  // Card list items
  const cards = [
    { name: 'Swords to Plowshares', price: '$2.49', reason: 'Efficient instant-speed removal for Atraxa before she can accumulate value.' },
    { name: 'Vandalblast', price: '$1.25', reason: 'Overloaded, destroys all artifact-based counter synergies opponents control.' },
    { name: 'Toxic Deluge', price: '$8.99', reason: 'Scales to clear the board regardless of counter-enhanced toughness.' },
  ];

  cards.forEach((card, i) => {
    const iy = cY + i * 80;
    // Row background
    rect(counter, cX, iy, 1152, 70, C.zinc900, {
      radius: 12, opacity: 0.4, stroke: C.border, strokeOpacity: 0.6
    });
    // Thumbnail
    rect(counter, cX + 12, iy + 7, 40, 56, C.zinc800, { radius: 6, opacity: 0.8 });
    // Name
    txt(counter, card.name, cX + 68, iy + 12, 15, C.zinc100, { style: 'Medium' });
    // Price badge
    pill(counter, card.price, cX + 300, iy + 10, C.zinc800, C.zinc400, {
      bgOpacity: 1, fontSize: 11, px: 8, py: 2
    });
    // Reason
    txt(counter, card.reason, cX + 68, iy + 36, 13, C.zinc400, { width: 900, lineHeight: 18 });
  });

  cY += 280;
  catHeader(counter, 'Enchantments', 2, cY);
  cY += 24;

  const enchantments = [
    { name: 'Rest in Peace', price: '$5.49', reason: 'Exiles graveyards, cutting off recursion strategies Atraxa decks often use.' },
    { name: 'Darksteel Mutation', price: '$0.75', reason: 'Neutralizes Atraxa by turning her into a 0/1 indestructible with no abilities.' },
  ];

  enchantments.forEach((card, i) => {
    const iy = cY + i * 80;
    rect(counter, cX, iy, 1152, 70, C.zinc900, {
      radius: 12, opacity: 0.4, stroke: C.border, strokeOpacity: 0.6
    });
    rect(counter, cX + 12, iy + 7, 40, 56, C.zinc800, { radius: 6, opacity: 0.8 });
    txt(counter, card.name, cX + 68, iy + 12, 15, C.zinc100, { style: 'Medium' });
    pill(counter, card.price, cX + 250, iy + 10, C.zinc800, C.zinc400, {
      bgOpacity: 1, fontSize: 11, px: 8, py: 2
    });
    txt(counter, card.reason, cX + 68, iy + 36, 13, C.zinc400, { width: 900, lineHeight: 18 });
  });

  // Export section
  cY += 200;
  rect(counter, cX, cY, 1152, 1, C.zinc500, { opacity: 0.3 });
  cY += 30;
  txt(counter, 'Export Deck', cX, cY, 20, C.zinc100, { style: 'Bold' });
  cY += 10;
  txt(counter, 'YOUR COUNTER COMMANDER', cX, cY + 30, 11, C.zinc400, {
    style: 'Medium', letterSpacing: 5, uppercase: true
  });

  // Commander select dropdown
  rect(counter, cX, cY + 52, 400, 44, C.zinc900, {
    radius: 12, opacity: 0.8, stroke: C.borderSub, strokeOpacity: 0.8
  });
  txt(counter, 'Solemnity', cX + 16, cY + 64, 14, C.zinc100);
  txt(counter, '▾', cX + 370, cY + 64, 14, C.zinc400);

  createFooter(counter, 1920, 1440);
  figma.currentPage.appendChild(counter);

  // ════════════════════════════════════════════════════════
  // PAGE 3: COUNTER PAGE — WITH DECK IMPORT
  // ════════════════════════════════════════════════════════
  const analyze = figma.createFrame();
  analyze.name = 'Counter Page — Deck Import';
  analyze.resize(1440, 1400);
  analyze.fills = fill(C.bg);
  analyze.x = 3200;
  analyze.y = 0;

  createNav(analyze, 1440);

  const aX = (1440 - 1152) / 2;
  let aY = 100;

  txt(analyze, '← Back to search', aX, aY, 14, C.zinc500);
  aY += 40;

  // Commander image + info (same as counter page)
  cardPlaceholder(analyze, aX, aY, 244, 340, { ring: true });

  const aInfoX = aX + 290;
  txt(analyze, 'Korvold, Fae-Cursed King', aInfoX, aY, 40, C.zinc100, { style: 'Bold', width: 600 });
  txt(analyze, 'Legendary Creature — Dragon Noble', aInfoX, aY + 52, 16, C.zinc400, { width: 600 });

  // Threat box
  rect(analyze, aInfoX, aY + 90, 660, 80, C.emeraldBg, {
    radius: 12, opacity: 0.15, stroke: C.emeraldDk, strokeOpacity: 0.4
  });
  txt(analyze, '⚡ THREAT ANALYSIS', aInfoX + 20, aY + 106, 12, C.emerald, {
    style: 'Semi Bold', letterSpacing: 5, uppercase: true
  });
  txt(analyze, 'Korvold generates massive card advantage through sacrifice triggers and grows into a lethal threat rapidly.', aInfoX + 20, aY + 128, 14, C.zinc300, {
    width: 620, lineHeight: 22
  });

  // ── Deck Import section ──
  aY += 400;
  rect(analyze, aX, aY, 560, 380, C.zinc900, {
    radius: 12, opacity: 0.5, stroke: C.border, strokeOpacity: 0.8
  });

  // Import header
  txt(analyze, '📤', aX + 20, aY + 20, 18, C.emerald);
  txt(analyze, 'Import Your Deck', aX + 48, aY + 20, 16, C.zinc100, { style: 'Bold' });
  txt(analyze, 'Import your existing deck to get targeted suggestions for countering this commander.', aX + 20, aY + 50, 14, C.zinc400, {
    width: 520, lineHeight: 20
  });

  // Tab toggle
  const tabY = aY + 90;
  rect(analyze, aX + 20, tabY, 520, 40, C.zinc800, { radius: 8, opacity: 0.5 });
  // Active tab
  rect(analyze, aX + 22, tabY + 2, 256, 36, C.emeraldDk, { radius: 6 });
  txt(analyze, 'Moxfield URL', aX + 90, tabY + 10, 14, C.white, { style: 'Medium' });
  txt(analyze, 'Card List', aX + 350, tabY + 10, 14, C.zinc400, { style: 'Medium' });

  // URL input
  rect(analyze, aX + 20, tabY + 56, 520, 44, C.zinc800, {
    radius: 12, opacity: 0.6, stroke: C.borderSub, strokeOpacity: 0.8
  });
  txt(analyze, 'https://www.moxfield.com/decks/...', aX + 36, tabY + 70, 14, C.zinc500);

  // Import button
  btn(analyze, 'Import from Moxfield', aX + 20, tabY + 116, C.emeraldDk, C.white, { radius: 12 });

  // ── Deck Suggestions section (right side) ──
  const sugX = aX + 590;
  rect(analyze, sugX, aY, 562, 380, C.zinc900, {
    radius: 12, opacity: 0.5, stroke: C.border, strokeOpacity: 0.8
  });

  txt(analyze, '💡', sugX + 20, aY + 20, 18, C.emerald);
  txt(analyze, 'Deck Suggestions', sugX + 48, aY + 20, 16, C.zinc100, { style: 'Bold' });
  txt(analyze, 'Based on your deck against ', sugX + 20, aY + 50, 14, C.zinc400);
  txt(analyze, 'Korvold, Fae-Cursed King', sugX + 210, aY + 50, 14, C.emerald, { style: 'Medium' });

  // Analyze button
  btn(analyze, 'Analyze My Deck', sugX + 360, aY + 16, C.emeraldDk, C.white, { radius: 12 });

  // Cards to Add
  const addY = aY + 90;
  rect(analyze, sugX + 20, addY + 8, 160, 1, '#064E3B', { opacity: 0.4 });
  txt(analyze, 'CARDS TO ADD (3)', sugX + 190, addY, 11, C.green, {
    style: 'Semi Bold', letterSpacing: 5, uppercase: true
  });
  rect(analyze, sugX + 380, addY + 8, 162, 1, '#064E3B', { opacity: 0.4 });

  const addCards = [
    { name: 'Grafdigger\'s Cage', reason: 'Prevents creatures from entering from graveyards, stopping recursion.' },
    { name: 'Rest in Peace', reason: 'Exiles all cards in graveyards, removing sacrifice payoffs.' },
  ];

  addCards.forEach((card, i) => {
    const iy = addY + 24 + i * 64;
    rect(analyze, sugX + 20, iy, 522, 56, '#064E3B', {
      radius: 12, opacity: 0.1, stroke: '#064E3B', strokeOpacity: 0.3
    });
    txt(analyze, '+', sugX + 36, iy + 8, 16, C.green, { style: 'Bold' });
    txt(analyze, card.name, sugX + 56, iy + 10, 14, C.zinc100, { style: 'Medium' });
    txt(analyze, card.reason, sugX + 56, iy + 32, 12, C.zinc400, { width: 470, lineHeight: 16 });
  });

  // Cards to Remove
  const remY = addY + 170;
  rect(analyze, sugX + 20, remY + 8, 160, 1, C.redDark, { opacity: 0.4 });
  txt(analyze, 'CARDS TO REMOVE (2)', sugX + 190, remY, 11, C.red, {
    style: 'Semi Bold', letterSpacing: 5, uppercase: true
  });
  rect(analyze, sugX + 400, remY + 8, 142, 1, C.redDark, { opacity: 0.4 });

  const remCards = [
    { name: 'Llanowar Elves', reason: 'Too slow for this matchup; replace with targeted hate.' },
    { name: 'Mind Stone', reason: 'Ramp is less useful than graveyard disruption here.' },
  ];

  remCards.forEach((card, i) => {
    const iy = remY + 24 + i * 64;
    rect(analyze, sugX + 20, iy, 522, 56, C.redDark, {
      radius: 12, opacity: 0.1, stroke: C.redDark, strokeOpacity: 0.3
    });
    txt(analyze, '−', sugX + 36, iy + 8, 16, C.red, { style: 'Bold' });
    txt(analyze, card.name, sugX + 56, iy + 10, 14, C.zinc100, { style: 'Medium' });
    txt(analyze, card.reason, sugX + 56, iy + 32, 12, C.zinc400, { width: 470, lineHeight: 16 });
  });

  // ── Export section ──
  aY += 420;
  rect(analyze, aX, aY, 1152, 200, C.zinc900, {
    radius: 12, opacity: 0.5, stroke: C.border, strokeOpacity: 0.8
  });

  txt(analyze, '📥', aX + 20, aY + 20, 18, C.emerald);
  txt(analyze, 'Export Deck', aX + 48, aY + 20, 16, C.zinc100, { style: 'Bold' });
  pill(analyze, '47 CARDS', aX + 1060, aY + 18, C.zinc800, C.zinc400, {
    bgOpacity: 1, fontSize: 11, uppercase: true, letterSpacing: 5, px: 10, py: 4
  });

  txt(analyze, 'Export your updated deck list with the suggested changes applied.', aX + 20, aY + 50, 14, C.zinc400, {
    width: 600, lineHeight: 20
  });

  // Show/hide toggle
  txt(analyze, '▸ Show deck list', aX + 20, aY + 80, 14, C.zinc400);

  // Buttons
  btn(analyze, 'Copy to Clipboard', aX + 20, aY + 120, C.emeraldDk, C.white, { radius: 12 });
  btn(analyze, 'Download .txt', aX + 210, aY + 120, C.zinc800, C.zinc300, {
    radius: 12, stroke: C.borderSub, strokeOpacity: 0.8, bgOpacity: 0.6
  });

  createFooter(analyze, 1320, 1440);
  figma.currentPage.appendChild(analyze);

  // ════════════════════════════════════════════════════════
  // PAGE 4: COMPONENT — Commander Card
  // ════════════════════════════════════════════════════════
  const comp = figma.createFrame();
  comp.name = 'Component — Commander Card';
  comp.resize(400, 500);
  comp.fills = fill(C.bg);
  comp.x = 4800;
  comp.y = 0;

  // Card background
  rect(comp, 24, 24, 352, 452, C.zinc900, {
    radius: 12, opacity: 0.5, stroke: C.border, strokeOpacity: 0.8
  });

  // Card image
  cardPlaceholder(comp, 96, 44, 208, 290, { ring: true });

  // Card name
  txt(comp, 'Thalia, Guardian of Thraben', 44, 350, 16, C.zinc100, { style: 'Bold', width: 312 });

  // Type line
  txt(comp, 'Legendary Creature — Human Soldier', 44, 376, 13, C.zinc500, { width: 312 });

  // Mana cost
  const thaliaMana = figma.createEllipse();
  thaliaMana.resize(22, 22);
  thaliaMana.x = 44;
  thaliaMana.y = 400;
  thaliaMana.fills = fill('#FFF9C4');
  comp.appendChild(thaliaMana);
  txt(comp, 'W', 51, 404, 11, '#000000', { style: 'Bold' });

  const thaliaMana2 = figma.createEllipse();
  thaliaMana2.resize(22, 22);
  thaliaMana2.x = 70;
  thaliaMana2.y = 400;
  thaliaMana2.fills = fill(C.zinc600);
  comp.appendChild(thaliaMana2);
  txt(comp, '1', 77, 404, 11, '#000000', { style: 'Bold' });

  // Cost
  txt(comp, '$4.99', 320, 404, 12, C.emerald, { style: 'Semi Bold' });

  // Reason
  txt(comp, 'Taxes noncreature spells, slowing down counter-based strategies and planeswalker deployment.', 44, 432, 13, C.zinc300, {
    width: 312, lineHeight: 18
  });

  figma.currentPage.appendChild(comp);

  // ════════════════════════════════════════════════════════
  // PAGE 5: COMPONENT — Hate Slider
  // ════════════════════════════════════════════════════════
  const sliderComp = figma.createFrame();
  sliderComp.name = 'Component — Hate Slider';
  sliderComp.resize(520, 200);
  sliderComp.fills = fill(C.bg);
  sliderComp.x = 5300;
  sliderComp.y = 0;

  const slX = 35;
  let slY = 24;

  txt(sliderComp, 'SALT LEVEL', slX, slY, 12, C.zinc300, {
    style: 'Medium', letterSpacing: 5, uppercase: true
  });

  // All 5 level badges
  const levels = [
    { label: 'SPRINKLE', color: C.green },
    { label: 'NUDGE', color: C.yellow },
    { label: 'FOCUSED', color: C.orange },
    { label: 'HARD COUNTER', color: C.red },
    { label: 'MAXIMUM SALT', color: C.redDark },
  ];

  levels.forEach((lvl, i) => {
    pill(sliderComp, lvl.label, slX + 110 + i * 80, slY - 4, lvl.color, lvl.color, {
      bgOpacity: 0.15, ring: lvl.color, ringOpacity: 0.2,
      fontSize: 9, uppercase: true, letterSpacing: 5, px: 6, py: 2
    });
  });

  slY += 36;

  // Gradient slider track
  const slTrack = figma.createRectangle();
  slTrack.x = slX;
  slTrack.y = slY;
  slTrack.resize(450, 8);
  slTrack.cornerRadius = 999;
  slTrack.fills = [{
    type: 'GRADIENT_LINEAR',
    gradientStops: [
      { position: 0, color: { ...hex(C.green), a: 1 } },
      { position: 0.25, color: { ...hex(C.yellow), a: 1 } },
      { position: 0.5, color: { ...hex(C.orange), a: 1 } },
      { position: 0.75, color: { ...hex(C.red), a: 1 } },
      { position: 1, color: { ...hex(C.redDark), a: 1 } },
    ],
    gradientTransform: [[1, 0, 0], [0, 1, 0]]
  }];
  sliderComp.appendChild(slTrack);

  // Thumb
  const slThumb = figma.createEllipse();
  slThumb.resize(22, 22);
  slThumb.x = slX + 110;
  slThumb.y = slY - 7;
  slThumb.fills = fill(C.white);
  slThumb.strokes = fill(C.emeraldDk);
  slThumb.strokeWeight = 3;
  slThumb.effects = [{
    type: 'DROP_SHADOW', color: { ...hex(C.emeraldDk), a: 0.5 },
    offset: { x: 0, y: 0 }, radius: 12, visible: true, spread: 0
  }];
  sliderComp.appendChild(slThumb);

  // Numbers
  slY += 20;
  for (let i = 1; i <= 5; i++) {
    const nx = slX + (i - 1) * 112;
    txt(sliderComp, String(i), nx + 4, slY, 13, i === 2 ? C.zinc100 : C.zinc600, {
      style: i === 2 ? 'Bold' : 'Regular'
    });
  }

  // Descriptions for each level
  slY += 30;
  const descs = [
    '1 — Light suggestions, nothing oppressive',
    '2 — Gentle nudge, minor disruption',
    '3 — Focused removal and hate cards',
    '4 — Hard counter with dedicated answers',
    '5 — Maximum salt, full lockdown strategy',
  ];
  descs.forEach((d, i) => {
    txt(sliderComp, d, slX, slY + i * 18, 11, C.zinc500, { width: 450 });
  });

  figma.currentPage.appendChild(sliderComp);

  // ── Done! ───────────────────────────────────────────────
  figma.viewport.scrollAndZoomIntoView([home, counter, analyze, comp, sliderComp]);
  figma.notify('✅ MTG Salty — All pages created!');
})();

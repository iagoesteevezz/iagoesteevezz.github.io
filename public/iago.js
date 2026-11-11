/* Reduced motion: honour the OS setting. The template starts the carousel videos
   with video.play() when they scroll into view; skipping that call keeps the poster. */
(function () {
   var query = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
   window.iagoReducedMotion = function () { return !!(query && query.matches); };
   var play = HTMLMediaElement.prototype.play;
   HTMLMediaElement.prototype.play = function () {
      if (window.iagoReducedMotion()) return Promise.resolve();
      return play.apply(this, arguments);
   };
})();

/* Footer clock in Iago's timezone.
   Dennis' index-new.js keeps writing Amsterdam time into the #timeSpan node it
   grabbed at init (and again after every Barba page swap), so each new node is
   replaced by a clone his interval no longer references. */
(function () {
   var formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Atlantic/Canary',
      timeZoneName: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
   });

   function tick() {
      var span = document.getElementById('timeSpan');
      if (!span) return;
      if (!span.hasAttribute('data-iago')) {
         var clone = span.cloneNode(true);
         clone.setAttribute('data-iago', '');
         span.parentNode.replaceChild(clone, span);
         span = clone;
      }
      span.textContent = formatter.format(new Date());
   }

   setInterval(tick, 500);
   document.addEventListener('DOMContentLoaded', tick);
})();

/* Contact form → Web3Forms. Delegated on document because Barba swaps the page. */
(function () {
   var RESET_DELAY = 4000;

   function setLabel(button, text) {
      button.value = window.iagoI18n ? window.iagoI18n.t(text) : text;
   }

   document.addEventListener('submit', function (event) {
      var form = event.target;
      if (!form.matches('form[data-web3forms]')) return;
      event.preventDefault();

      var button = form.querySelector('input[type="submit"]');
      var idleLabel = 'Send it!';

      if (!form.checkValidity()) {
         form.reportValidity();
         return;
      }
      if (form.hasAttribute('data-sending')) return;
      form.setAttribute('data-sending', '');
      setLabel(button, 'Sending...');

      fetch(form.action, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
         body: JSON.stringify(Object.fromEntries(new FormData(form))),
      })
         .then(function (response) {
            return response.json().then(function (data) {
               if (!response.ok || !data.success) throw new Error(data.message || response.status);
            });
         })
         .then(function () {
            setLabel(button, 'Sent!');
            form.reset();
            form.querySelectorAll('.not-empty').forEach(function (el) {
               el.classList.remove('not-empty');
            });
         })
         .catch(function (error) {
            console.error('Contact form:', error);
            setLabel(button, 'Try again');
         })
         .finally(function () {
            form.removeAttribute('data-sending');
            setTimeout(function () { setLabel(button, idleLabel); }, RESET_DELAY);
         });
   });
})();

/* ES / EN. The HTML is the English source; Spanish swaps exact text nodes in place,
   so names, emails and project titles are never touched. */
(function () {
   var STORAGE_KEY = 'iago-lang';
   var EASE = 'cubic-bezier(0.7, 0, 0.3, 1)';

   var ES = {
      // Page titles
      'Iago Estévez • Software Developer': 'Iago Estévez • Desarrollador de software',
      'Work • Iago Estévez': 'Proyectos • Iago Estévez',
      'About • Iago Estévez': 'Sobre mí • Iago Estévez',
      'Contact • Iago Estévez': 'Contacto • Iago Estévez',

      // Navigation, menu, footer
      'Home': 'Inicio',
      'Work': 'Proyectos',
      'About': 'Sobre mí',
      'Contact': 'Contacto',
      'Menu': 'Menú',
      'Navigation': 'Navegación',
      'Socials': 'Redes',
      'Resume': 'CV',
      'Get in touch': 'Hablemos',
      'Let’s work': 'Trabajemos',
      'together': 'juntos',
      'Version': 'Versión',
      '2026 © Edition': 'Edición 2026 ©',
      'Local time': 'Hora local',
      'Language': 'Idioma',
      'Skip to content': 'Saltar al contenido',
      '(opens in a new tab)': '(se abre en una pestaña nueva)',

      // Home
      'Located': 'Ubicado',
      'in': 'en',
      'Spain': 'España',
      'Software': 'Desarrollador',
      'Developer': 'de software',
      'A passionate Software Developer dedicated to building robust and scalable applications. Specializing in backend development with a focus on cloud technologies. Fluent in English, Spanish, and German.':
         'Desarrollador de software apasionado por crear aplicaciones robustas y escalables. Especializado en desarrollo backend con foco en tecnologías cloud. Hablo inglés, español y alemán.',
      'DAM student and AWS Certified Cloud Practitioner, building with Java, Spring Boot, AWS, React & Python.':
         'Estudiante de DAM y AWS Certified Cloud Practitioner. Desarrollo con Java, Spring Boot, AWS, React y Python.',
      'About me': 'Sobre mí',
      'Recent work': 'Trabajos recientes',
      'More work': 'Más proyectos',
      'View': 'Ver',
      'Design & Development': 'Diseño y desarrollo',
      'Interaction & Development': 'Interacción y desarrollo',

      // Work
      'Creating next level': 'Creando productos',
      'digital products': 'digitales de otro nivel',
      'All': 'Todos',
      'Design': 'Diseño',
      'Development': 'Desarrollo',
      'Apps': 'Apps',
      'Games': 'Juegos',
      'Client': 'Cliente',
      'Project': 'Proyecto',
      'Web': 'Web',
      'Chrome': 'Chrome',
      'Location': 'Ubicación',
      'Services': 'Servicios',
      'Year': 'Año',
      'Archive': 'Archivo',
      'Styleguide': 'Guía de estilo',
      'The Netherlands': 'Países Bajos',
      'United Kingdom': 'Reino Unido',
      'United States': 'Estados Unidos',

      // About
      'Building robust': 'Construyendo software',
      '& scalable software': 'robusto y escalable',
      'Always exploring': 'Siempre explorando',
      'I can help you with': 'Puedo ayudarte con',
      'Robust, scalable backend services and REST APIs built with Java and Spring Boot.':
         'Servicios backend y APIs REST robustos y escalables con Java y Spring Boot.',
      'AWS Certified Cloud Practitioner. I design and deploy applications on AWS with a focus on cloud technologies.':
         'AWS Certified Cloud Practitioner. Diseño y despliego aplicaciones en AWS con foco en tecnologías cloud.',
      'The full package': 'Todo en uno',
      'From backend to interface: complete applications with Java, Spring Boot, AWS, React and Python.':
         'Del backend a la interfaz: aplicaciones completas con Java, Spring Boot, AWS, React y Python.',
      'AWS Jam National': 'Competición nacional',
      'Competition': 'AWS Jam',
      'Barcelona, 2026. Selected to represent my school at the national AWS Jam, a hands-on competition where teams solve real-world cloud architecture and infrastructure challenges on Amazon Web Services.':
         'Barcelona, 2026. Seleccionado para representar a mi centro en el AWS Jam nacional, una competición práctica en la que los equipos resuelven retos reales de arquitectura e infraestructura cloud en Amazon Web Services.',

      // Contact
      "Let's start a": 'Empecemos un',
      'project together': 'proyecto juntos',
      'Contact Details': 'Datos de contacto',
      'Business Details': 'Datos profesionales',
      'Location: Gran Canaria, Spain': 'Ubicación: Gran Canaria, España',
      "What's your name?": '¿Cómo te llamas?',
      "What's your email?": '¿Cuál es tu email?',
      "What's the name of your organization?": '¿Cómo se llama tu organización?',
      'What services are you looking for?': '¿Qué servicios buscas?',
      'Your message': 'Tu mensaje',
      'John Doe *': 'Juan Pérez *',
      'john@doe.com *': 'juan@perez.com *',
      'John & Doe ®': 'Juan & Pérez ®',
      'Web Design, Web Development ...': 'Backend, cloud, desarrollo web ...',
      'Hello, can you help me with ... *': 'Hola, ¿puedes ayudarme con ... *',
      'Phone Number': 'Teléfono',
      'Send it!': '¡Enviar!',
      'Sending...': 'Enviando...',
      'Sent!': '¡Enviado!',
      'Try again': 'Reintentar',
   };

   var EN_BY_ES = {};
   Object.keys(ES).forEach(function (en) { EN_BY_ES[ES[en]] = en; });

   // The logo stays in English: its hover offsets are tuned to "Code by".
   var SKIP = 'script, style, svg, noscript, textarea, #timeSpan, .btn-left-top';
   var ATTRS = ['placeholder', 'value'];
   var SPLIT = '.span-lines';
   var textSources = new WeakMap();
   var splitSources = new WeakMap();

   var lang = 'en';
   try { if (localStorage.getItem(STORAGE_KEY) === 'es') lang = 'es'; } catch (e) {}

   function norm(s) { return s.replace(/\s+/g, ' ').trim(); }

   function t(en) { return lang === 'es' && ES[en] ? ES[en] : en; }

   function keepWhitespace(original, text) {
      var lead = original.match(/^\s*/)[0];
      var trail = original.match(/\s*$/)[0];
      return lead + text + trail;
   }

   // Returns pending edits instead of applying them, so a switch can fade out first.
   function collect(root) {
      var edits = [];
      if (!root || (root.nodeType !== 1 && root.nodeType !== 3)) return edits;
      var el = root.nodeType === 3 ? root.parentElement : root;
      if (!el || el.closest(SKIP)) return edits;

      var block = el.closest(SPLIT);
      var blocks = block ? [block] : Array.prototype.slice.call(root.querySelectorAll ? root.querySelectorAll(SPLIT) : []);
      blocks.forEach(function (b) { collectSplit(b, edits); });
      if (block) return edits;

      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
         acceptNode: function (node) {
            return node.parentElement && node.parentElement.closest(SKIP + ', ' + SPLIT)
               ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
         },
      });
      var node = root.nodeType === 3 ? root : walker.nextNode();
      while (node) {
         var source = textSources.get(node);
         if (source === undefined && ES[norm(node.nodeValue)]) {
            source = node.nodeValue;
            textSources.set(node, source);
         }
         if (source !== undefined) {
            var target = keepWhitespace(source, t(norm(source)));
            if (node.nodeValue !== target) {
               edits.push({ el: node.parentElement, apply: setNodeValue.bind(null, node, target) });
            }
         }
         node = root.nodeType === 3 ? null : walker.nextNode();
      }

      if (root.nodeType === 1) {
         var fields = Array.prototype.slice.call(root.querySelectorAll('[placeholder], input[type="submit"]'));
         if (root.matches('[placeholder], input[type="submit"]')) fields.push(root);
         fields.forEach(function (field) {
            if ((field.tagName !== 'TEXTAREA' && field.closest(SKIP)) || field.closest('form[data-sending]')) return;
            ATTRS.forEach(function (attr) {
               if (attr === 'value' && field.type !== 'submit') return;
               var current = field.getAttribute(attr);
               if (current === null) return;
               var en = ES[current] ? current : EN_BY_ES[current];
               if (!en) return;
               var target = t(en);
               if (current !== target) {
                  edits.push({ el: field, apply: setAttr.bind(null, field, attr, target) });
               }
            });
         });
      }
      return edits;
   }

   // Word-split paragraphs: GSAP animates the original .span-line-inner nodes, so words are
   // redistributed across them instead of rebuilding the markup.
   function collectSplit(block, edits) {
      var inners = Array.prototype.slice.call(block.querySelectorAll('.span-line-inner'));
      if (!inners.length) return;
      var source = splitSources.get(block);
      if (!source) {
         var original = inners.map(function (s) { return s.textContent; });
         if (!ES[norm(original.join(' '))]) return;
         source = original;
         splitSources.set(block, source);
      }
      var words = lang === 'es' ? ES[norm(source.join(' '))].split(' ') : source;
      var chunks = inners.map(function (_, i) {
         var from = Math.floor(i * words.length / inners.length);
         var to = Math.floor((i + 1) * words.length / inners.length);
         return words.length > inners.length ? words.slice(from, to).join(' ') : (words[i] || '');
      });
      var changed = inners.some(function (s, i) { return s.textContent !== chunks[i]; });
      if (!changed) return;
      edits.push({
         el: block,
         apply: function () {
            inners.forEach(function (s, i) {
               if (s.textContent !== chunks[i]) s.textContent = chunks[i];
               s.parentElement.style.display = chunks[i] ? '' : 'none';
            });
         },
      });
   }

   function setNodeValue(node, value) { node.nodeValue = value; }

   function setAttr(el, attr, value) {
      el.setAttribute(attr, value);
      if (attr === 'value') el.value = value;
   }

   function applyTitle() {
      var current = document.title;
      var en = ES[current] ? current : (EN_BY_ES[current] || current);
      var target = t(en);
      if (current !== target) document.title = target;
   }

   function isVisible(el) {
      if (!el.getClientRects().length) return false;
      var r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth) return false;
      return parseFloat(getComputedStyle(el).opacity) > 0;
   }

   function outermost(els) {
      return els.filter(function (el, i) {
         if (els.indexOf(el) !== i) return false;
         return !els.some(function (other) { return other !== el && other.contains(el); });
      });
   }

   function translatePage(animate) {
      if (window.iagoReducedMotion()) animate = false;
      var edits = collect(document.body);
      var visible = animate ? outermost(edits.map(function (e) { return e.el; })).filter(isVisible) : [];

      function commit() {
         edits.forEach(function (e) { e.apply(); });
         applyTitle();
         syncResume();
         syncSwitches();
      }
      if (!visible.length || !visible[0].animate) { commit(); return; }

      var opacities = visible.map(function (el) { return getComputedStyle(el).opacity; });
      var fadeOut = visible.map(function (el, i) {
         return el.animate(
            [{ opacity: opacities[i], filter: 'blur(0px)' }, { opacity: 0, filter: 'blur(6px)' }],
            { duration: 240, easing: EASE, fill: 'forwards' }
         );
      });
      Promise.all(fadeOut.map(function (a) { return a.finished; })).then(function () {
         commit();
         visible.forEach(function (el, i) {
            fadeOut[i].cancel();
            el.animate(
               [{ opacity: 0, filter: 'blur(6px)' }, { opacity: opacities[i], filter: 'blur(0px)' }],
               { duration: 520, easing: 'cubic-bezier(0.19, 1, 0.22, 1)' }
            );
         });
      });
   }

   function setLang(next, animate) {
      if (next === lang) return;
      lang = next;
      try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
      document.documentElement.lang = lang;
      syncResume();
      syncSwitches();
      translatePage(animate);
   }

   /* Selector inside the "Located in Spain" hanger */
   function enhanceHangers() {
      document.querySelectorAll('.home-header .hanger:not([data-lang-ready])').forEach(function (hanger) {
         hanger.setAttribute('data-lang-ready', '');
         var sw = document.createElement('div');
         sw.className = 'lang-switch';
         sw.innerHTML =
            '<span class="lang-caption">Language</span>' +
            '<div class="lang-options" role="group" aria-label="Language">' +
               '<button type="button" class="lang-option" data-lang="es">ES</button>' +
               '<button type="button" class="lang-option" data-lang="en">EN</button>' +
               '<span class="lang-dot" aria-hidden="true"></span>' +
            '</div>';
         hanger.appendChild(sw);

         var ball = hanger.querySelector('.digital-ball');
         if (ball) {
            ball.setAttribute('role', 'button');
            ball.setAttribute('tabindex', '0');
            ball.setAttribute('aria-label', 'Switch language / Cambiar idioma');
         }
      });
      syncSwitches();
   }

   function syncResume() {
      var es = lang === 'es';
      var href = es ? '/assets/cv-iago-estevez.pdf' : '/assets/cv-iago-estevez-en.pdf';
      var file = es ? 'Iago-Estevez-CV-ES.pdf' : 'Iago-Estevez-CV-EN.pdf';
      document.querySelectorAll('a[href*="cv-iago-estevez"]').forEach(function (a) {
         a.setAttribute('href', href);
         a.setAttribute('download', file);
      });
   }

   function syncSwitches() {
      document.querySelectorAll('.lang-options').forEach(function (group) {
         var active = null;
         group.querySelectorAll('.lang-option').forEach(function (btn) {
            var on = btn.getAttribute('data-lang') === lang;
            btn.classList.toggle('is-active', on);
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
            if (on) active = btn;
         });
         var dot = group.querySelector('.lang-dot');
         if (active && dot) {
            dot.style.transform = 'translateX(' + (active.offsetLeft + active.offsetWidth / 2) + 'px)';
         }
      });
   }

   function spinGlobe(ball) {
      var globe = ball.querySelector('.globe');
      if (!globe) return;
      globe.classList.remove('is-spinning');
      void globe.offsetWidth;
      globe.classList.add('is-spinning');
   }

   document.addEventListener('click', function (event) {
      var option = event.target.closest('.lang-option');
      if (option) {
         setLang(option.getAttribute('data-lang'), true);
         return;
      }
      var ball = event.target.closest('.hanger .digital-ball');
      if (ball) {
         spinGlobe(ball);
         setLang(lang === 'es' ? 'en' : 'es', true);
         return;
      }
      // Touch screens have no hover: a tap on the pill opens the selector
      if (!window.matchMedia('(hover: none)').matches) return;
      var hanger = event.target.closest('.home-header .hanger');
      document.querySelectorAll('.hanger.is-open').forEach(function (h) {
         if (h !== hanger) h.classList.remove('is-open');
      });
      if (hanger) hanger.classList.toggle('is-open');
   });

   document.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      var ball = event.target.closest && event.target.closest('.hanger .digital-ball');
      if (!ball) return;
      event.preventDefault();
      spinGlobe(ball);
      setLang(lang === 'es' ? 'en' : 'es', true);
   });

   // The template clones the big name for its marquee: keep a single h1 for assistive tech.
   function hideDuplicateH1() {
      document.querySelectorAll('.name-wrap h1').forEach(function (h, i) {
         if (i > 0 && !h.hasAttribute('aria-hidden')) h.setAttribute('aria-hidden', 'true');
      });
   }

   // Barba swaps containers and rewrites the title: translate whatever comes in.
   function watch() {
      new MutationObserver(function (mutations) {
         var edits = [];
         mutations.forEach(function (m) {
            m.addedNodes.forEach(function (n) { edits = edits.concat(collect(n)); });
         });
         edits.forEach(function (e) { e.apply(); });
         syncResume();
         enhanceHangers();
         hideDuplicateH1();
      }).observe(document.body, { childList: true, subtree: true });

      new MutationObserver(applyTitle).observe(document.head, { childList: true, subtree: true, characterData: true });
   }

   // The skip link lives outside the Barba container, so resolve its target on click.
   document.addEventListener('click', function (event) {
      var link = event.target.closest && event.target.closest('.skip-link');
      if (!link) return;
      event.preventDefault();
      var target = document.querySelector('.main-wrap') || document.querySelector('main');
      if (!target) return;
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
   });

   window.iagoI18n = { t: function (en) { return t(en); }, get lang() { return lang; }, set: setLang };
   document.documentElement.lang = lang;

   document.addEventListener('DOMContentLoaded', function () {
      enhanceHangers();
      translatePage(false);
      hideDuplicateH1();
      watch();
   });
   window.addEventListener('resize', syncSwitches);
})();

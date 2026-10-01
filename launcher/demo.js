// The online demo's own bar: things a visitor cannot do in a browser tab —
// drop a coin, or flip the shop's theme — without the staff panel. Lives only
// in the demo build; the real terminal never loads this file.
(function () {
    'use strict';

    var THEMES = [
        ['Shelf', [['shelf', 'Frost'], ['shelf-amber', 'Amber'], ['shelf-sky', 'Sky'], ['shelf-rose', 'Rose'], ['shelf-mono', 'Mono']]],
        ['Modern', [['modern', 'Modern'], ['ocean', 'Ocean'], ['emerald', 'Emerald'], ['neon', 'Neon'], ['carbon', 'Carbon']]],
        ['Library', [['library', 'Paper'], ['library-sand', 'Sand'], ['library-mint', 'Mint'], ['library-night', 'Night']]],
        ['Arcade', [['arcade', 'Neon'], ['arcade-vapor', 'Vapor'], ['arcade-gameboy', 'Game Boy'], ['arcade-amber', 'Amber CRT']]],
        ['Deck', [['deck', 'Graphite'], ['deck-ice', 'Ice'], ['deck-ember', 'Ember']]],
    ];

    function api() {
        return window.__rt && window.__rt.api;
    }

    // Runs one staff-only call without leaving the panel signed out if the
    // visitor had it open.
    async function asStaff(fn) {
        var a = api();
        if (!a) return;
        var was = await a.AdminActive();
        if (!was) await a.AdminLogin('');
        try {
            await fn(a);
        } finally {
            if (!was) await a.AdminLogout();
        }
    }

    function coin(pesos) {
        return asStaff(function (a) {
            return a.SimulateCoin(pesos);
        });
    }

    function theme(id) {
        return asStaff(async function (a) {
            var s = await a.GetSettings();
            await a.SaveSettings(Object.assign({}, s, {launcherTheme: id}));
        });
    }

    var css = [
        '#rt-demo{position:fixed;left:16px;bottom:40px;z-index:2147483647;font:500 13px/1.3 "Inter",system-ui,sans-serif;color:#fff}',
        '#rt-demo .bar{display:flex;flex-wrap:wrap;align-items:center;gap:8px;max-width:calc(100vw - 32px);padding:10px 12px;border-radius:14px;background:rgba(13,11,28,.92);border:1px solid #332e62;box-shadow:0 18px 40px -12px rgba(0,0,0,.8);backdrop-filter:blur(8px)}',
        '#rt-demo .tag{font:700 11px/1 "Space Grotesk",system-ui,sans-serif;letter-spacing:.12em;color:#0d0b1c;background:linear-gradient(#ffc53d,#ff941f);padding:6px 8px;border-radius:6px}',
        '#rt-demo .lbl{color:#a4a0c8;margin-left:4px}',
        '#rt-demo button,#rt-demo select{font:600 13px/1 "Inter",system-ui,sans-serif;color:#fff;background:#17142e;border:1px solid #332e62;border-radius:8px;padding:8px 10px;cursor:pointer;min-height:34px}',
        '#rt-demo button:hover,#rt-demo select:hover{border-color:#8b7cf6}',
        '#rt-demo button.coin{color:#ffc53d}',
        '#rt-demo .hide{background:transparent;border-color:transparent;color:#a4a0c8}',
        '#rt-demo.closed .bar>*:not(.tag):not(.show){display:none}',
        '#rt-demo:not(.closed) .show{display:none}',
        '#rt-demo .hint{display:none}',
    ].join('');

    function build() {
        var style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);

        var root = document.createElement('div');
        root.id = 'rt-demo';
        var bar = document.createElement('div');
        bar.className = 'bar';
        root.appendChild(bar);

        var tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = 'LIVE DEMO';
        bar.appendChild(tag);

        var lbl = document.createElement('span');
        lbl.className = 'lbl';
        lbl.textContent = 'Drop a coin:';
        bar.appendChild(lbl);
        [1, 5, 10, 20].forEach(function (p) {
            var b = document.createElement('button');
            b.className = 'coin';
            b.type = 'button';
            b.textContent = '₱' + p;
            b.title = 'Drop a ₱' + p + ' coin into this computer’s slot';
            b.onclick = function () { coin(p); };
            bar.appendChild(b);
        });

        var tl = document.createElement('span');
        tl.className = 'lbl';
        tl.textContent = 'Theme:';
        bar.appendChild(tl);
        var sel = document.createElement('select');
        sel.setAttribute('aria-label', 'Launcher theme');
        THEMES.forEach(function (g) {
            var og = document.createElement('optgroup');
            og.label = g[0];
            g[1].forEach(function (t) {
                var o = document.createElement('option');
                o.value = t[0];
                o.textContent = g[0] + ' · ' + t[1];
                og.appendChild(o);
            });
            sel.appendChild(og);
        });
        sel.value = 'modern';
        sel.onchange = function () { theme(sel.value); };
        bar.appendChild(sel);

        var staff = document.createElement('button');
        staff.type = 'button';
        staff.textContent = 'Staff panel';
        staff.title = 'Open the operator panel (the cog). No password on this demo.';
        staff.onclick = function () {
            var cog = document.querySelector('[aria-label="Staff settings"]');
            if (cog) cog.click();
        };
        bar.appendChild(staff);

        var reset = document.createElement('button');
        reset.type = 'button';
        reset.textContent = 'Start over';
        reset.onclick = function () { location.reload(); };
        bar.appendChild(reset);

        var hide = document.createElement('button');
        hide.type = 'button';
        hide.className = 'hide';
        hide.textContent = 'Hide';
        hide.onclick = function () { root.classList.add('closed'); };
        bar.appendChild(hide);

        var show = document.createElement('button');
        show.type = 'button';
        show.className = 'show';
        show.textContent = 'Show';
        show.onclick = function () { root.classList.remove('closed'); };
        bar.appendChild(show);

        var hint = document.createElement('span');
        hint.className = 'hint';
        hint.textContent = 'This is the real RapTech launcher running in your browser with a pretend coin slot. Nothing you do here leaves this tab.';
        bar.appendChild(hint);

        document.body.appendChild(root);
        // The shop's look out of the box for this demo.
        var tries = 0;
        var t = setInterval(function () {
            if (api() || ++tries > 40) {
                clearInterval(t);
                if (api()) theme('modern');
            }
        }, 150);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
    else build();
})();

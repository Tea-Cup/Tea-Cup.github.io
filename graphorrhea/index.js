document.addEventListener('readystatechange', async () => {
    if (document.readyState !== 'complete') return;

    //#region Common
    const main = document.getElementById('main');
    const query = new URLSearchParams(window.location.search);
    document.getElementById('theme').addEventListener('click', () => {
        const dark = document.body.classList.toggle('dark');
        document.body.classList.toggle('light', !dark);
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    });
    function _(tag, props, ...children) {
        const el = document.createElement(tag);
        for(const [key, value] of Object.entries(props ?? {})) {
            if(key === 'class') {
                if(Array.isArray(value)) {
                    for(const cls of value) el.classList.add(cls);
                } else if(typeof(value) === 'object') {
                    for(const [k,n] of Object.entries(value))
                        if(n) el.classList.add(k);
                } else {
                    el.className = String(value);
                }
            } else if(key === 'style') {
                for(const [k,v] of Object.entries(value)) {
                    el.style[k] = String(v);
                }
            } else if(key.startsWith('$')) {
                el.addEventListener(key.substring(1), value);
            } else if(key.startsWith('@')) {
                el.setAttribute(key.substring(1), String(value));
            } else {
                el[key] = value;
            }
        }
        for(const child of children) {
            if(typeof(child) === 'object') {
                el.appendChild(child);
            } else {
                el.appendChild(document.createTextNode(String(child)));
            }
        }
        return el;
    }
    function showError(...text) {
        main.replaceChildren(_(
            'div',
            { 'class': ['error'] },
            ...text
        ));
    }
    function showNavError(text, link, name) {
        showError(text, _('br'), _('br'), 'Please return to ', _('a', { href: link }, name));
    }
    //#endregion

    const list = document.getElementById('list');
    const index = await fetch('./index.json').then(res => res.json());

    for(const [id, item] of Object.entries(index)) {
        list.appendChild(_(
            'li',
            { },
            _('a',
                { href: `./toc.html?id=${id}` },
                _('span', {}, item.name),
                _('div', {}, item.parts)
            ),
        ));
    }
});
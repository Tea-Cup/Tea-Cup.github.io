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
    function kaktovik(num) {
        const str = num.toString(20).split('').map(x => parseInt(x, 20));
        const code = str.map(x => 0x1D2C0 + x);
        return _('span', { 'class': 'kaktovik' }, String.fromCodePoint(...code));
    }
    //#endregion

    const id = query.get('id');
    if(!id) return showNavError('Title not selected', './', 'the beginning');

    const toc = document.getElementById('toc');
    const index = await fetch('./index.json').then(res => res.json());
    const item = index[id];
    if (!item) return showNavError('Unknown title selected', './', 'the beginning');

    if(localStorage.getItem('version') !== '2') {
        localStorage.removeItem(id);
        localStorage.setItem('version', '2');
    }

    const arr = JSON.parse(localStorage.getItem(id) ?? '[]');
    if(query.has('clear')) {
        arr.length = 0;
        localStorage.setItem(id, '[]');
        query.delete('clear');
        const url = new URL(window.location.href);
        url.search = '?' + query.toString();
        history.replaceState(null, '', url.href);
    }

    if(arr.length > 0) {
        const clear = document.getElementById('clear-unread');
        clear.style.display = '';
        clear.href = `./toc.html?id=${id}&clear`;
    }

    const title = document.getElementById('title');
    title.innerText = item.name;
    document.title = `${item.name} | Quiet Writer`;

    for(let i = 1; i <= item.parts; ++i) {
        toc.appendChild(_('li', { 'class': 'list-button' },
            _('a', {
                    href: `./chapter.html?id=${id}&part=${i}`,
                    'class': { read: arr.includes(i) }
                },
                `Chapter `,
                kaktovik(i)
            )
        ));
    }

    document.body.style.display = '';
});
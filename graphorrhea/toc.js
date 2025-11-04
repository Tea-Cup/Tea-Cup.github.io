document.addEventListener('readystatechange', async () => {
    if (document.readyState !== 'complete') return;

    //#region Common
    function $(id) { return document.getElementById(id) }
    function updateTheme() {
        const light = localStorage.getItem('theme') === 'light';
        document.body.parentElement.classList.toggle('light', light);
    }
    function toggleTheme() {
        const dark = localStorage.getItem('theme') === 'light';
        localStorage.setItem('theme', dark ? 'dark' : 'light');
        document.body.parentElement.classList.toggle('light', !dark);
    }
    function _(tag, props, ...children) {
        const el = document.createElement(tag);
        Object.entries(props ?? {}).forEach(([k, v]) => { el[k] = v });
        for(let i = 0; i < children.length; ++i) {
            if(typeof(children[i]) !== 'object') 
                children[i] = document.createTextNode(String(children[i]));
            el.appendChild(children[i]);
        }
        return el;
    }
    function showNavError(text, link, name) {
        $('main').replaceChildren(_(
            'div', { className: 'error' },
            text, _('br'), _('br'), 'Please return to ', _('a', { href: link }, name)
        ));
    }
    function kaktovik(num) {
        const str = num.toString(20).split('').map(x => parseInt(x, 20));
        const code = str.map(x => 0x1D2C0 + x);
        return _('span', { className: 'kaktovik' }, String.fromCodePoint(...code));
    }
    function getChapters(id) {
        const value = JSON.parse(localStorage.getItem(id) ?? '[]');
        return Array.isArray(value) ? value : [];
    }
    function setChapters(id, value) {
        localStorage.setItem(id, JSON.stringify(value));
    }
    const query = new URLSearchParams(window.location.search);
    $('kaktovik-loader').remove();
    $('theme').addEventListener('click', () => toggleTheme());
    updateTheme();
    //#endregion

    const id = query.get('id');
    if(!id) return showNavError('Title not selected', './', 'the beginning');

    const index = await fetch('./index.json').then(res => res.json());
    const item = index[id];
    if (!item) return showNavError('Unknown title selected', './', 'the beginning');

    const arr = getChapters(id);
    if(query.has('clear')) {
        arr.length = 0;
        setChapters(id, []);
        query.delete('clear');
        const url = new URL(window.location.href);
        url.search = '?' + query.toString();
        history.replaceState(null, '', url.href);
    }

    if(arr.length > 0) {
        const clear = $('clear-unread');
        clear.style.display = '';
        clear.href = `./toc.html?id=${id}&clear`;
    }

    $('title').innerText = item.name;
    document.title = `${item.name} | Quiet Writer`;

    const frag = document.createDocumentFragment();
    for(let i = 1; i <= item.parts; ++i) {
        frag.appendChild(_('li', { className: 'list-button' },
            _('a', {
                    href: `./chapter.html?id=${id}&part=${i}`,
                    className: arr.includes(i) ? 'read' : ''
                },
                `Chapter `,
                kaktovik(i)
            )
        ));
    }

    $('loader').remove();
    $('goback').style.display = '';
    $('toc').appendChild(frag);
});
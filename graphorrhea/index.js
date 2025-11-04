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
        for (let i = 0; i < children.length; ++i) {
            if (typeof (children[i]) !== 'object')
                children[i] = document.createTextNode(String(children[i]));
            el.appendChild(children[i]);
        }
        return el;
    }
    function getChapters(id) {
        const value = JSON.parse(localStorage.getItem(id) ?? '[]');
        return new Set(Array.isArray(value) ? value : []);
    }
    $('theme').addEventListener('click', () => toggleTheme());
    updateTheme();
    //#endregion

    const index = await fetch('./index.json').then(res => res.json());

    const frag = document.createDocumentFragment();
    for (const [id, item] of Object.entries(index)) {
        const arr = getChapters(id);
        frag.appendChild(_(
            'li',
            { className: 'list-button' },
            _('a',
                { href: `./toc.html?id=${id}` },
                _('span', {}, item.name),
                _('div', {}, arr.size, ' / ', item.parts)
            ),
        ));
    }

    $('loader').remove();
    $('list').appendChild(frag);
});
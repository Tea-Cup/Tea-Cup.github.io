document.addEventListener('readystatechange', async () => {
    if (document.readyState !== 'complete') return;

    //#region Common
    const main = document.getElementById('main');
    const query = new URLSearchParams(window.location.search);
    function updateTheme() {
        const light = localStorage.getItem('theme') === 'light';
        document.body.parentElement.classList.toggle('light', light);
    }
    function toggleTheme() {
        const dark = localStorage.getItem('theme') === 'light';
        localStorage.setItem('theme', dark ? 'dark' : 'light');
        document.body.parentElement.classList.toggle('light', !dark);
    }
    document.getElementById('theme').addEventListener('click', () => toggleTheme());
    updateTheme();
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
    function showError(...text) {
        main.replaceChildren(_('div', { className: 'error' }, ...text));
    }
    function showNavError(text, link, name) {
        showError(text, _('br'), _('br'), 'Please return to ', _('a', { href: link }, name));
    }
    function getChapters(id) {
        const value = JSON.parse(localStorage.getItem(id) ?? '[]');
        return Array.isArray(value) ? value : [];
    }
    function setChapters(id, value) {
        localStorage.setItem(id, JSON.stringify(value));
    }
    //#endregion

    const index = await fetch('./index.json').then(res => res.json());
    
    const frag = document.createDocumentFragment();
    for(const [id, item] of Object.entries(index)) {
        const arr = getChapters(id);
        frag.appendChild(_(
            'li',
            { className: 'list-button' },
            _('a',
                { href: `./toc.html?id=${id}` },
                _('span', {}, item.name),
                _('div', {},
                    arr.length,
                    ' / ',
                    item.parts
                )
            ),
        ));
    }

    const list = document.getElementById('list');
    document.getElementById('loader').remove();
    list.appendChild(frag);
});
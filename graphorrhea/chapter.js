document.addEventListener('readystatechange', async () => {
    if (document.readyState !== 'complete') return;

    //#region Common
    function $(id) { return document.getElementById(id) }
    $('kaktovik-loader').remove();
    const main = $('main');
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
    $('theme').addEventListener('click', () => toggleTheme());
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
    //#endregion

    const id = query.get('id');
    if (!id) return showNavError('Title not selected', './', 'the beginning');

    const index = await fetch('./index.json').then(res => res.json());
    const item = index[id];
    if (!item) return showNavError('Unknown title selected', './', 'the beginning');

    if (!query.has('part')) return showNavError('Chapter not selected', `./toc.html?id=${id}`, 'the chapter list');
    const part = +query.get('part');
    if (isNaN(part) || !Number.isInteger(part) || part < 1 || part > item.parts)
        return showError('Invalid chapter number', `./toc.html?id=${id}`, 'the chapter list');

    const arr = getChapters(id);
    if (!arr.includes(part)) {
        arr.push(part);
        setChapters(id, arr);
    }

    $('title').innerText = item.name;
    document.title = `${item.name} #${part} | Quiet Writer`;

    $('goback').href = `./toc.html?id=${id}`;
    $('goback-top').href = `./toc.html?id=${id}`;

    const prevtop = $('prev-top');
    const nexttop = $('next-top');
    const prevbot = $('prev-bot');
    const nextbot = $('next-bot');

    if (part === 1) {
        prevtop.style.visibility = 'hidden';
        prevbot.style.visibility = 'hidden';
    } else {
        prevtop.replaceChildren(`≪　Chapter `, kaktovik(part - 1));
        prevbot.replaceChildren(`≪　Chapter `, kaktovik(part - 1));
        prevtop.href = `./chapter.html?id=${id}&part=${part - 1}`;
        prevbot.href = `./chapter.html?id=${id}&part=${part - 1}`;
    }
    if (part === item.parts) {
        nexttop.style.visibility = 'hidden';
        nextbot.style.visibility = 'hidden';
    } else {
        nexttop.replaceChildren(`Chapter `, kaktovik(part + 1), `　≫`);
        nextbot.replaceChildren(`Chapter `, kaktovik(part + 1), `　≫`);
        nexttop.href = `./chapter.html?id=${id}&part=${part + 1}`;
        nextbot.href = `./chapter.html?id=${id}&part=${part + 1}`;
    }

    const text = await fetch(`./${id}/${part}.txt`).then(x => x.text());

    const frag = document.createDocumentFragment();
    for (const line of text.split(/\r?\n/g)) {
        frag.appendChild(_('p', {}, line));
    }

    $('loader').remove();
    $('nav-top').style.display = '';
    $('nav-bot').style.display = '';
    $('content').appendChild(frag);
});
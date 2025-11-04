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

    const index = await fetch('./index.json').then(res => res.json());
    const item = index[id];
    if (!item) return showNavError('Unknown title selected', './', 'the beginning');

    if(!query.has('part')) return showNavError('Chapter not selected', `./toc.html?id=${id}`, 'the chapter list');
    const part = +query.get('part');
    if(isNaN(part) || !Number.isInteger(part) || part < 1 || part > item.parts)
        return showError('Invalid chapter number', `./toc.html?id=${id}`, 'the chapter list');

    const arr = JSON.parse(localStorage.getItem(`chapters-${id}`) ?? '[]');
    arr.push(part);
    localStorage.setItem(`chapters-${id}`, JSON.stringify(arr));

    const title = document.getElementById('title');
    title.innerText = item.name;
    document.title = `${item.name} #${part} | Quiet Writer`;

    const goback = document.getElementById('goback');
    const goback2 = document.getElementById('goback-top');
    goback.href = `./toc.html?id=${id}`;
    goback2.href = `./toc.html?id=${id}`;

    const prevtop = document.getElementById('prev-top');
    const nexttop = document.getElementById('next-top');
    const prevbot = document.getElementById('prev-bot');
    const nextbot = document.getElementById('next-bot');

    if(part === 1) {
        prevtop.style.visibility = 'hidden';
        prevbot.style.visibility = 'hidden';
    } else {
        prevtop.replaceChildren(`≪　Chapter `, kaktovik(part-1));
        prevbot.replaceChildren(`≪　Chapter `, kaktovik(part-1));
        prevtop.href = `./chapter.html?id=${id}&part=${part-1}`;
        prevbot.href = `./chapter.html?id=${id}&part=${part-1}`;
    }
    if(part === item.parts) {
        nexttop.style.visibility = 'hidden';
        nextbot.style.visibility = 'hidden';
    } else {
        nexttop.replaceChildren(`Chapter `, kaktovik(part+1), `　≫`);
        nextbot.replaceChildren(`Chapter `, kaktovik(part+1), `　≫`);
        nexttop.href = `./chapter.html?id=${id}&part=${part+1}`;
        nextbot.href = `./chapter.html?id=${id}&part=${part+1}`;
    }

    const req = await fetch(`./${id}/${part}.txt`);
    const text = await req.text();
    const lines = text.split(/\r?\n/g);
    const content = document.getElementById('content');

    for(const line of lines) {
        content.appendChild(_(
            'p', {}, line
        ));
    }
    
    document.body.style.display = '';
});
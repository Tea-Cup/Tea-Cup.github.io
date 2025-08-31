document.addEventListener('readystatechange', async () => {
    if (document.readyState !== 'complete') return;

    //#region Utils
    const encoder = new TextEncoder();
    function sha512(str) {
        const data = encoder.encode(String(str ?? ''));
        return window.crypto.subtle.digest('SHA-512', data);
    }
    //#endregion

    //#region Theme
    document.getElementById('theme').addEventListener('click', () => {
        const dark = document.body.classList.toggle('dark');
        document.body.classList.toggle('light', !dark);
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    });
    //#endregion

    //#region Title loading
    const main = document.getElementById('main');
    const title = document.getElementById('title');
    const nav = document.getElementById('nav');
    const index = await fetch('./index.json').then(res => res.json());

    async function loadItem(id) {
        const item = index[id];
        main.replaceChildren();
        if(!item) {
            title.innerText = 'Select a title';
            title.classList.add('placeholder');
            return;
        }
        title.innerText = item.name;
        nav.classList.remove('show');
        title.classList.remove('placeholder');
        for (let i = 1; i <= item.parts; ++i) {
            const txt = await fetch(`./${id}/${i}.txt`).then(res => res.text());
            for (const para of txt.split('\n')) {
                const p = document.createElement('p');
                p.innerText = para;
                main.appendChild(p);
            }
            main.appendChild(document.createElement('hr'));
        }
    }

    for(const [id, item] of Object.entries(index)) {
        const a = document.createElement('a');
        a.href = `#${id}`;
        a.innerText = item.name;
        a.addEventListener('click', () => loadItem(id));
        nav.appendChild(a);
    }

    window.addEventListener('hashchange', e => {
        const url = new URL(e.newURL);
        loadItem(url.hash.substring(1));
    });
    
    title.addEventListener('click', () => {
        nav.classList.toggle('show');
    });

    loadItem(window.location.hash.substring(1));
    //#endregion
});
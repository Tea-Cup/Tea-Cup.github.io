document.addEventListener('readystatechange', async () => {
    if (document.readyState !== 'complete') return;

    const encoder = new TextEncoder();
    function sha512(str) {
        const data = encoder.encode(String(str ?? ''));
        return window.crypto.subtle.digest('SHA-512', data);
    }

    document.getElementById('theme').addEventListener('click', () => {
        const dark = document.body.classList.toggle('dark');
        document.body.classList.toggle('light', !dark);
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    });

    const main = document.getElementById('main');
    const title = document.getElementById('title');
    const nav = document.getElementById('nav');
    const index = await fetch('./index.json').then(res => res.json());

    async function loadItem(id) {
        const item = index[id];
        title.innerText = item.name;
        nav.classList.toggle('show');
        title.classList.remove('placeholder');
        main.replaceChildren();
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
        a.href = '#';
        a.innerText = item.name;
        a.addEventListener('click', () => loadItem(id));
        nav.appendChild(a);
    }

    title.addEventListener('click', () => {
        nav.classList.toggle('show');
    });
});
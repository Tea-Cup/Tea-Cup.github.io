document.addEventListener('readystatechange', async () => {
    if (document.readyState !== 'complete') return;

    document.getElementById('theme').addEventListener('click', () => {
        const dark = document.body.classList.toggle('dark');
        document.body.classList.toggle('light', !dark);
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    });

    const main = document.getElementById('main');
    const title = document.getElementById('title');
    const index = await fetch('./index.json').then(res => res.json());

    const key = Object.keys(index)[0];
    title.innerText = key;
    for (let i = 1; i <= index[key]; ++i) {
        const txt = await fetch(`./${key}/1.txt`).then(res => res.text());
        for (const para of txt.split('\n')) {
            const p = document.createElement('p');
            p.innerText = para;
            main.appendChild(p);
        }
        main.appendChild(document.createElement('hr'));
    }
});
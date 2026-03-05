// optional script to populate random values from dataset
async function loadExample() {
    try {
        const resp = await fetch('/static/example.json');
        const data = await resp.json();
        for (let key in data) {
            const el = document.getElementById(key);
            if (el) el.value = data[key];
        }
    } catch (e) {
        console.error('could not load example', e);
    }
}

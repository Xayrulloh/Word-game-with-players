const userId = JSON.parse(window.localStorage.getItem('userId'))


setInterval(() => {
    way()
}, 2000);

async function way() {
    const started = await (await fetch('/isStarted')).json()

    if (!userId) {
        let url = await fetch('/404')
        window.location = url.url
    }

    if (!started.started) {
        let url = await fetch('/game')
        window.location = url.url
    }
}




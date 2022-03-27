const userId = JSON.parse(window.localStorage.getItem('userId'))
let warned = false, gameStarted = false, gone = false, timeShow = 60, replay = false

// error()

setInterval(async() => {
    getUsers()
    isStarted()
    startGameFunc()
    checkGame()
    game()
    changeTime()
    click()
}, 1000);

async function getUsers() {
    const users = await (await fetch('/users')).json()
    
    usersList.innerHTML = null
    for (let user of users) {
        if (user.gaming) {
            usersList.innerHTML += `<li class="players_item">
            <img class="players_img" src="images/${user.profileImg}" alt="">
            <h1 class="players_name">${user.username}</h1>
            </li>`
        }
    }
}

async function startGameFunc() {
    let users = await (await fetch('/users')).json()
    users = users.filter(user => user.gaming)
    
    if (users[0].userId === userId && users.length >= 2 && !warned && !gameStarted) {
        warned = true
        main.innerHTML += `<button class="start_btn" id="clickButton">Start game</button>`
        
        alert("If you won't clicking start button in 3 minute you will be kicking")
        setTimeout(async() => {
            const clicked = await (await fetch('/isStarted')).json()
            if (!clicked.started) {
                try {
                    const test = fetch('/user', {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            userId
                        })
                    })
                    window.location = '/'
                    window.localStorage.setItem('userId', null)
                    
                } catch (error) {
                    console.log(error.message);
                }
            }
        }, 180000);
    }
}

async function isStarted() {
    if (gameStarted) return
    
    const started = await (await fetch('/isStarted')).json()
    if (started.started) {
        gameStarted = true
    }
}

async function click() {
    if (warned && !gone) {
        const started = await (await fetch('/isStarted')).json()
        if (started.started) {
            main.innerHTML = `<h1 style="color: white; margin-left: 10px;">Players</h1>`
            gone = true
        } else {
            clickButton.onclick = async() => {
                try {
                    const test = await fetch('/isStarted', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            "isStarted": true
                        })
                    })
                    
                    main.innerHTML = `<h1 style="color: white; margin-left: 10px;">Players</h1>`
                    gone = true
                    
                } catch (error) {
                    console.log(error.message);
                }
            }
        }
    }
}

// async function error() {
//     let users = await (await fetch('/users')).json()

//     users = users.filter(user => user.userId == userId)

//     if (!users.length) {
//         window.location = '/404'
//     }
// }

async function game() {
    if (gameStarted) {
        let users = await (await fetch('/users')).json()
        const words = await (await fetch('/words')).json()

        users = users.filter(user => user.gaming)
        const me = users.filter(user => user.userId == userId)
        let turn = users.filter(user => user.turn)
        
        if (me[0]?.turn && !replay) {
            replay = true

            board.innerHTML = `<div class="result_content_wrapper last_word_wrapper">
            <h1 class="result_title">Last word: </h1>
            <h1 class="result_name result_last" id="lastWord">${words.word.at(-1) || ''}</h1>
            </div>
            <div class="result_content_wrapper last_word_wrapper">
            <h1 class="result_title">Turn: </h1>
            <h1 class="result_name result_player_name" id="turn">Your turn</h1>
            </div>
            <div class="result_content_wrapper last_word_wrapper">
            <h1 class="result_title">Time: </h1>
            <h1 class="result_name result_player_name" id="time">
            </h1>
            </div>
            <div class="result_content_wrapper last_word_wrapper">
            <h1 class="result_title">Input: </h1>
            <input class="result_input" type="text" id="input">
            </div>`
            
        } else if (!me[0]?.turn) {
            board.innerHTML = `<div class="result_content_wrapper last_word_wrapper">
            <h1 class="result_title">Last word: </h1>
            <h1 class="result_name result_last">${words.word.at(-1) || ''}</h1>
            </div>
            <div class="result_content_wrapper last_word_wrapper">
            <h1 class="result_title">Turn: </h1>
            <h1 class="result_name result_player_name">${turn[0]?.username}</h1>
            </div>
            <div class="result_content_wrapper last_word_wrapper">
            </div>
            <div class="result_content_wrapper last_word_wrapper">
            <h1 class="result_title">Input: </h1>
            <input class="result_input" type="text" id="input" disabled>
            </div>`
        }
        
        input.onkeyup = async(e) => {
            if (e.keyCode === 13) {
                if (input.value.trim().split(' ').length > 1 || !input.value.trim() || input.value.length == 1) {input.value = null; return alert('invalid input')}
                if (!words.word.at(-1)) {
                    try {
                        const test = await fetch('/next', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                "word": input.value,
                                "userId": userId
                            })
                        })

                        input.value = null
                        replay = false
                        timeShow = 60
                        
                    } catch (error) {
                        console.log(error.message);
                    }

                } else if (words.word.at(-1)) {
                    let check = words.word.filter(word => word.toLowerCase() == input.value.toLowerCase())

                    if (words.word.at(-1).at(-1).toLowerCase() != input.value[0].toLowerCase() || check.length) {
                        alert(`you lose. Because last word is '${words.word.at(-1)}' and you entered '${input.value}' or maybe you entered used word`)
                        try {
                            const test = fetch('/user', {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    userId
                                })
                            })
                            window.location = '/'
                            window.localStorage.setItem('userId', null)
                            
                        } catch (error) {
                            console.log(error.message);
                        }
                    } else {
                        try {
                            const test = await fetch('/next', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    "word": input.value,
                                    "userId": userId
                                })
                            })
    
                            input.value = null
                            replay = false
                            timeShow = 60
                            
                        } catch (error) {
                            console.log(error.message);
                        }
                    }
                }
            }
        }

    }
}

async function changeTime() {
    let users = await (await fetch('/users')).json()
    const me = users.filter(user => user.userId == userId)

    if (me[0]?.turn && gameStarted) {
        time.textContent = --timeShow
    
        if (time.textContent == '0') {
            time.textContent = null
            alert('You lose')
            timeShow = 60
    
            try {
                const test = fetch('/user', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId
                    })
                })
                window.location = '/'
                window.localStorage.setItem('userId', null)
            } catch (error) {
                console.log(error.message);
            }
        }
    }
}

async function checkGame() {
    let users = await (await fetch('/users')).json()
    users = users.filter(user => user.gaming)
    
    if (users.length === 1 && gameStarted) {
        alert('You are winner')

        try {
            const test = await fetch('/ended', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "ended":true
                })
            })
            
        } catch (error) {
            console.log(error.message);
        }
    
        window.location = '/'
        window.localStorage.setItem('userId', null)
    }
}






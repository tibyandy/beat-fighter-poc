Script(Game => {
    Game.baseUtils = {
        repeat: (x, fn) => { for (let i = 0; i < x; fn(i++)); }
    }
})

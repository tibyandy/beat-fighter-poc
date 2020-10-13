Script(Game => {
    const { viewUtils: { elem, newElem } } = Game
    return {
        init, show
    }

    function init () {
        elem('view').put('<div id="song_picker" />')
    }

    function show (songs) {
        elem('song_picker').clean()
        elem('view').set('class', 'song_select')
        Object.entries(songs).forEach(([bfsFilename, song], i) => {
            const { title, banner } = song
            const elSong = `song_${i}`
            elem('song_picker')
                .put(`<div id="${elSong}" class="song" />`)
                .then(() => elem(elSong)
                    .put(
                        `<img src="songs/${title}/${banner}"}/>`,
                        `<span>${title}</span>`
                    )
                    .on('click', () => console.log(bfsFilename, JSON.stringify(song, null, 2)))
                )
            })
    }
})
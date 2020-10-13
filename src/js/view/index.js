Script((async () => {
    const [, songpicker] = await Script(
        ['utils'],
        ['songpicker']
    )
    songpicker.init()

    return {
        songpicker: displaySongPicker
    }

    function displaySongPicker (songs) {
        songpicker.show(songs)
    }
})())
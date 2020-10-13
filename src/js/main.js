Script(async () => {
    const [config, parser, scanner, , view] = await Script(
        ['.', 'config'],
        ['bfs/parser'],
        ['bfs/scanner'],
        ['baseutils'],
        ['view/index']
    )

    const bfsFilesText = await scanner.scan(config.songs)
    const bfsFilesData = parser.parse(bfsFilesText)
    view.songpicker(bfsFilesData)
})
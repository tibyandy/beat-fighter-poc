Script(function () {
    const SONGS_SUBDIR = `songs`
    const SONGS_HOME = Script.home

    const bfsBuffers = []
    const bfsBufferPath = () => decodeURI(document.currentScript.src.replace(SONGS_HOME, ''))
    const bfsBufferPush = data => bfsBuffers.push([ bfsBufferPath(), data ])
    const bfsBufferGet = () => bfsBuffers.shift()

    // Creates window.BFS SETTER
    Object.defineProperty(window, 'BFS', { set: bfsBufferPush })

    const getBFSPath = bfsFilename => `${bfsFilename}/${bfsFilename}.bfs`
    const fetchBFSFile = filename => Script(SONGS_SUBDIR, getBFSPath(filename)).then(bfsBufferGet)
    const fetchBFSFiles = filenames => Promise.all(filenames.map(fetchBFSFile))

    return {
        scan: fetchBFSFiles
    }
}())
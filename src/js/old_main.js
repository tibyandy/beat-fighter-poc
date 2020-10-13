const APP2 = (() => {
    
    const jssmFiles = [
        'Awe of She',
        'Vortex Infinium',
        'Zero-One'
    ]
    
    const script = {
        fetch: src => new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.onload = resolve
            script.onerror = reject
            script.src = src
            document.head.append(script)
        })
    }
    
    const scriptsBufferedData = {
        _data: [],
        put (data) { scriptsBufferedData._data.push(data) },
        get () { return scriptsBufferedData._data.shift() }
    }
    Object.defineProperty(window, 'jssm', { set:
        data => scriptsBufferedData.put(data)
    })



    const jssms = {}
    const loadJssmFiles = async () => {
        const jssmsAsText = await Promise.all(jssmFiles.map(
            jssmFile => script.fetch(`songs/${jssmFile}/${jssmFile}.js`)
                .then(scriptsBufferedData.get)
        ))
        const jssmsData = jssmsAsText.map(parseJssm)
        const songPickerDom = document.getElementById('song_picker')
        const jssms = {}
        jssmsData.forEach(jssm => {
            const { title, background, banner, bpms, music, offset, patterns } = jssm
            songPickerDom.innerHTML += `<div class="song" onclick='APP.playSong("${title}")'><img src="songs/${title}/${banner}"}/>${title}</div>`
            jssms[title] = {
                title,
                background,
                banner,
                bpms,
                music,
                offset,
                patterns
            }
        })
        return jssms
    }
    loadJssmFiles().then(loadedJssms => Object.assign(jssms, loadedJssms))
    return { get jssms () { return jssms } }
})()

function currentBeat () {
    return Math.trunc((currentTime + offset) / (60000 / bpms[0]))
}

function getNextNotes (pattern, bpmsMap, millioffset, howManyBeatsBehind, howManyBeatsAhead, currentMillis, firstShownNote = 0) {
    const currentMillibeat = convertMillisToMillibeat(currentMillis, bpmsMap, millioffset)
    while (pattern[firstShownNote++].beat < currentMillibeat - howManyBeatsBehind * 1000) {}
    let lastShownNote = firstShownNote - 1
    try {
        while (pattern[lastShownNote++].beat < currentMillibeat + howManyBeatsAhead * 1000) {}
    } catch (e) { lastShownNote-- }
    return pattern.slice(firstShownNote - 1, lastShownNote)
}

//
function convertMillibeatToMillis (millibeat, bpmsMap, millioffset) {
    const millibpm0 = Object.values(bpmsMap)[0]
    return Math.round(millibeat * (60000 / millibpm0) - millioffset)
}

function convertMillisToMillibeat (millis, bpmsMap, millioffset) {
    const millibpm0 = Object.values(bpmsMap)[0]
    return Math.trunc((millis + millioffset) / (60000 / millibpm0))
}


function convertSmPatternToBeats(patternText, { bpms, offset }) {
    console.log(bpms)
    return patternText.split(',')
        .map(x => x.trim().split('\n').map(x => x === '0000' ? '' : x))
        .map((bar, nBar) => {
            const { length: l } = bar
            return bar
                .map((subBar, i) => [(nBar * 4 + i * 4 / l) * 1000, subBar])
                .filter(subBar => subBar[1])
        }).flat()
        .map(([ beat, step ], i) => ({ step, i, time: convertMillibeatToMillis(beat, bpms, offset), beat }))
}

APP.playSong = songName => {
    const sm = APP.jssms[songName]
    const {
        title,
        background,
        banner,
        bpms,
        music,
        offset
    } = sm
    const { patterns: { 0: { meta, pattern }}, ...debug } = sm
    _sm = sm
    const stepBeats = convertSmPatternToBeats(pattern, { bpms, offset })
    _pattern = stepBeats

    console.log(stepBeats.map(x => JSON.stringify(x)).join('\n'))
    console.log(JSON.stringify({ ...debug, meta }, null, 2))

    document.getElementById('wrapper').className = 'song_play'
    document.getElementById('song_buffer').innerHTML = `
        <img id="song_background" src="songs/${title}/${background}">
        <img id="song_banner" src="songs/${title}/${banner}">
        <audio id="song_music" autoplay="true"><source src="songs/${title}/${music}"></audio>
    `

    let songMusicDom
    let currentTime
    let _ctx
    setTimeout(() => {
        const wrapper = document.getElementById('wrapper')
        const canvas = document.getElementById('canvas')
        const canvH = canvas.height = wrapper.clientHeight
        const canvW = canvas.width = wrapper.clientWidth
        const ctx = canvas.getContext('2d')
        _ctx = ctx
        const songBanner = document.getElementById('song_banner')
        songMusicDom = document.getElementById('song_music')
        songBanner.onload = () => {
            const imageH = canvW * 5 / 16
            const imageY = canvH - imageH
            ctx.drawImage(songBanner, 0, imageY, canvW, imageH)
            const blockH = imageH / 8
            const blockY = imageY + blockH
            const blockW = canvW / 4
            const spaceW = blockW / 12
            ctx.beginPath()
            ctx.rect(0, imageY, canvW, blockH)
            ctx.rect(0, imageY + 2 * blockH, canvW, blockH * 6)
            repeat(4, i => {
                const bX = blockW * i
                ctx.rect(bX, blockY, spaceW, blockH)
                ctx.rect(bX + blockW - spaceW, blockY, spaceW, blockH)
            })
            ctx.fillStyle = 'rgba(0,0,0,0.7)'
            ctx.fill()

            ctx.strokeStyle = '#fff'
            ctx.beginPath()
            repeat(4, i => {
                const bX = blockW * i
                ctx.rect(bX + spaceW, blockY, blockW - 2 * spaceW, blockH)
            })
            ctx.stroke()
            ctx.beginPath()
            ctx.strokeStyle = '#fff'
            repeat(4, i => {
                const bX = blockW * i
                ctx.rect(bX + spaceW, blockY + blockH, blockW - 2 * spaceW, 5 * blockH)
            })
            ctx.stroke()
            drawLoop()
        }
    })

    const debugInfoDom = document.getElementById('debug_info')

    function currentBeat () {
        return Math.trunc((currentTime + offset) / (60000 / bpms[0]))
    }

    let step = { step: '0000', i: -1 }
    let curr = { step: '0000', i: -1 }

    function drawNotes (ctx, nextNotes, currentTime, currentBeat) {
        for (let i = 0; i < 4; i++) {
        }
    }

    function drawLoop () {
        currentTime = Math.trunc(songMusicDom.currentTime * 1000)
        const currBeat = currentBeat()
        const nextNotes = getNextNotes(_pattern, _sm.bpms, _sm.offset, 1, 4, currentTime)
        drawNotes(_ctx, nextNotes, currentTime, currentBeat)
        const next = nextNotes[0]
        if (next.i != curr.i) {
            step = curr
            curr = next
        }
        debugInfoDom.innerHTML = `<div>${JSON.stringify({step: step.step, i: step.i, time:currentTime, beat:currBeat})}</div>${nextNotes.map(JSON.stringify).join('<br>')}`
        setTimeout(drawLoop, 16)
    }
}


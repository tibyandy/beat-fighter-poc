Script((GAME => {
    const COMMENTS_REGEX = /(\/\/[^\n\r]*[\n\r]+)/g

    const SPLIT_ON_COLON_AND_TRIM_MAPPER = x => x.trim().split(':')

    const EMPTY_ARRAY_FILTER = x => x[0]

    const TOLOWERCASE_REMOVEHASH_FROM_KEY_MAPPER = ([key, ...value]) => [
        key.substring(1).toLowerCase(),
        value
    ]

    const KEY_VALUES_MAPPER = ([key, values]) => {
        switch (key) {
            default: return [key, values[0] > 0 || values[0] < 0 ? Math.round(values[0] * 1000) : values[0]]
            case 'bpms': return [key, Object.fromEntries(values[0].split(',').map(s => s.split('=').map(x => x * 1000)))]
            case 'notes':
        }
        const pattern = values.pop()
        return ['pattern', values.map(v => v.trim()).join(':'), pattern.trim()]
    }
    
    const SONG_PATTERNS_REDUCER = (result, [key, values, pattern]) =>
        Object.assign(
            result,
            key === 'pattern'
                ? { patterns: [
                    ...(result.patterns || []), {
                        meta: values,
                        pattern: { ...pattern.split('\n,\n').map(x => {
                            x = x.split('\n').map(x => x.trim().replace(/^[0]+$/, '.'))
                            return `${x.length} `.padStart(3, '0') + x.join(' ')
                        }) }
                    }
                ] }
                : { [key]: values }
        )

    const parseFile = ([bfsFilename, bfsText]) => [
        bfsFilename,
        bfsText
            .replace(COMMENTS_REGEX, '')
            .split(';')
            .map(SPLIT_ON_COLON_AND_TRIM_MAPPER)
            .filter(EMPTY_ARRAY_FILTER)
            .map(TOLOWERCASE_REMOVEHASH_FROM_KEY_MAPPER)
            .map(KEY_VALUES_MAPPER)
            .reduce(SONG_PATTERNS_REDUCER, {})
    ]

    const BFS_REDUCER = (result, [bfsFilename, bfsData]) =>
        Object.assign(result, { [bfsFilename]: bfsData })

    const parseFiles = (arrayOfBFS, parserFn = parseFile) =>
        arrayOfBFS.map(parserFn).reduce(BFS_REDUCER, {})

    return { parse: parseFiles }
})())
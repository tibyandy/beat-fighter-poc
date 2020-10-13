const Script = (() => {
    const extractPathFrom = s => s.substring(0, s.lastIndexOf('/') + 1)

    const DOC = document
    const HOME = extractPathFrom(DOC.location.href)
    const HEAD = DOC.head

    const minPath = p => `"${decodeURI(p.replace(HOME, ''))}"`

    let rootPath
    const APP = {}
    const scripts = {}

    const fetchScript = (path, src) => {
        if (!src.includes('.')) src += '.js'
        src = path ? `${path}/${src}` : src
        const script = DOC.createElement('script')
        script.src = src.replace(/\/\/*/g, '/')
        src = script.src
        console.log(`[get] ${minPath(src)}`)
        return new Promise((resolve, reject) => {
            HEAD.append(script)
            script.onload = () => {
                HEAD.removeChild(script)
                // console.log(`[end] ${minPath(src)}`)
                return resolve(scripts[src])
            }
            script.onerror = reject
        }) 
    }

    const executeScript = fn => {
        const { src } = Script
        console.log(`[RUN] ${minPath(src)}`)
        return scripts[src] = fn(APP)
    }

    const executeScriptObj = (obj) => {
        const { src } = Script
        console.log(`[SET] ${minPath(src)}`)
        return scripts[src] = obj
    }

    const currentScriptPath = () => extractPathFrom((DOC.currentScript || {}).src)

    const script = (...args) => {
        const firstArg = args[0]

        if (Array.isArray(firstArg))
            return Promise.all(args.map((args) => script(...args)))

        const [path, value] = (args.length === 1)
            ? [currentScriptPath() || rootPath, firstArg]
            : [`${HOME}${firstArg}/`, args[1]]

        if (!rootPath) rootPath = path

        switch (typeof firstArg) {
            case 'string': return fetchScript(path, value)
            case 'object': return executeScriptObj(value)
        }
        if ({}.toString.call(firstArg)) return executeScript(value)

        throw Error(`Script: invalid argument of type "${typeof firstArg}"`)
    }

    Object.defineProperty(script, 'src', { get: () => DOC.currentScript.src })
    script.home = HOME

    return script
})()

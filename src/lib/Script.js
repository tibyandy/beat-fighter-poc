const Script = (() => {
    const DOC = document
    const HREF = DOC.location.href
    const HOME = HREF.substring(0, HREF.lastIndexOf('/') + 1)
    const ERR = 'ERR'
    const HEAD = DOC.head

    let rootPath
    const APP = { foo: 'baz' }
    const scripts = {}

    const fetchScript = (path, src) => {
        if (!src.includes('.')) src += '.js'
        src = path ? `${path}/${src}` : src
        const script = DOC.createElement('script')
        script.src = src.replace(/\/\/*/g, '/')
        src = script.src
        console.log(`IMPORT ${src}`)
        return new Promise((resolve, reject) => {
            HEAD.append(script)
            script.onload = () => {
                HEAD.removeChild(script)
                console.log(`  DONE ${src}`)
                return resolve(scripts[src])
            }
            script.onerror = reject
        }) 
    }

    const executeScript = fn => {
        const { src } = Script
        console.log(`   RUN ${src}`)
        const result = fn(APP)
        scripts[src] = result
        return result
    }

    const executeScriptObj = (obj) => {
        const { src } = Script
        console.log('   SET ' + src, obj)
        return scripts[src] = obj
    }

    const currentScriptPath = () => {
        const fullfilepath = (document.currentScript || {}).src
        return fullfilepath.substring(0, fullfilepath.lastIndexOf('/') + 1)
    }

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

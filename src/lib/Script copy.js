const Script = (() => {
    const DOC = document
    const HREF = DOC.location.href
    const ERR = 'ERR'
    const HEAD = DOC.head

    let rootPath
    const ctx = {}

    const scripts = {}

    const fetchScript = (path, src) => {
        if (!src.includes('.')) src += '.js'
        src = path ? `${path}/${src}` : src
        const script = DOC.createElement('script')
        script.src = src.replace(/\/\/*/g, '/')
        src = script.src.replace(BASEPATH, '')
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

    const executeScript = (fn, ctx) => {
        const { src } = Script
        const result = fn(ctx)
        scripts[src] = result
        console.log(`  LOAD ${src}`, result)
        return result
    }

    const executeScriptObj = (obj) => {
        const { src } = Script
        console.log('   SET ' + src, obj)
        return scripts[src] = obj
    }

    const script = (arg, arg2) => {
        let path = rootPath
        if (arg2) {
            path = `${arg}/`
            arg = arg2
            if (!rootPath) rootPath = path
        }
        const result = typeof arg === 'string' ? fetchScript(path, arg)
            : typeof arg === 'object' ? executeScriptObj(arg)
            : {}.toString.call(arg) ? executeScript(arg, ctx)
            : ERR
        if (result === ERR) throw Error(`Script: invalid argument of type "${typeof arg}"`)
        return result
    }

    const BASEPATH = HREF.substring(0, HREF.lastIndexOf('/') + 1)
    Object.defineProperty(script, 'src', {
        get: () => DOC.currentScript.src.replace(BASEPATH, '')
    })
    
    return script
})()

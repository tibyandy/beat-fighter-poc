/**
 * WebModule declarator / getter.
 * With 1 arg (string), gets WebModule with the [arg] name.
 * With 1 arg (function), defines a nameless WebModule.
 * With 2 args (string, function), defines a named WebModule Function.
 * With 2 args (string, object), defines a named WebModule Object.
 * @param {string|function} nameOrFn Name or Function of the WebModule
 * @param {function|object} [fnOrObj] Function or Object of the WebModule
 */
function WebModuleOld (nameOrFn, fnOrObj) {
    let name
    if (fnOrObj) name = nameOrFn
    else if (typeof nameOrFn === 'string') return WebModuleOld.modules[nameOrFn]
    else {
        fnOrObj = nameOrFn
        name = undefined
    }
    
    if ((Promise.resolve(fnOrObj) === fnOrObj) || (fnOrObj && {}.toString.call(fnOrObj))) {
        if (typeof name === 'string')
            WebModuleOld.modules[name] = fnOrObj
        else if (name)
            throw Error(`WebModule: invalid name ${name}`)

        if (typeof fnOrObj === 'object')
            return fnOrObj
        if (fnOrObj && {}.toString.call(fnOrObj))
            return fnOrObj({
                ...WebModuleOld.modules,
                loadAsync: WebModuleOld.loadAsync,
                fetch: WebModuleOld.fetch
            })
    }
    throw Error(`WebModule: invalid function ${fnOrObj}`)
}

(() => {
    WebModuleOld.modules = {}

    const fetcher = (promiseResultFn, src) =>
        new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.onload = () => {
                script.parentNode.removeChild(script)
                return resolve(promiseResultFn())
            }
            script.onerror = reject
            script.src = src
            document.head.append(script)
        }) 

    WebModuleOld.loadAsync = src => fetcher(() => WebModuleOld(src), `${src}.js`)
    WebModuleOld.fetch = src => fetcher(() => {}, src)
})()

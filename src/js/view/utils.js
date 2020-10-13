Script(Game => {
    const cache = {}
    const dom = id => {
        if (cache[id]) return Promise.resolve(cache[id])
        return new Promise(r => setTimeout(() => r(document.getElementById(id)), 1))
    }

    const cPut = (pe, p) => (...htmls) => {
        p.then(e => htmls.forEach(html => e.insertAdjacentHTML('beforeend', html)))
        return pe
    }

    const cSet = (pe, p) => (attr, val) => {
        p.then(e => e.setAttribute(attr, val))
        return pe
    }
    const cAttrs = (pe, p) => (attrValObj) => {
        p.then(e => Object.entries(attrValObj).forEach(([attr, val]) => e.setAttribute(attr, val)))
        return pe
    }
    const cClean = (pe, p) => () => { 
        p.then(e => e.innerHTML = '')
        return pe
    }
    const cThen = (pe, p) => fn => {
        p.then(fn)
        return pe
    }
    const cOn = (pe, p) => (eventName, fn) => {
        p.then(e => e.addEventListener(eventName, fn))
        return pe
    }

    const powerElem = id => {
        const promise = dom(id)
        const self = { domElem: promise }
        self.put = cPut(self, promise)
        self.set = cSet(self, promise)
        self.attrs = cAttrs(self, promise)
        self.clean = cClean(self, promise)
        self.then = cThen(self, promise)
        self.on = cOn(self, promise)
        cache[id] = self
        return self
    }

    function elem (id) {
        return cache[id] = cache[id] || powerElem(id)
    }

    Game.viewUtils = {
        elem
    }
})

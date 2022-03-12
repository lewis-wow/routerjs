/*
    import: 
        npm i diff-dom
        import { DiffDOM } from "diff-dom";

    files:
        https://github.com/fiduswriter/diffDOM/tree/main/browser

*/

const { DiffDOM } = diffDOM;

class Router {
    callbacks = {
        mount: [],
        beforeMount: [],
        beforePop: [],
        pop: [],
        progress: []
    };

    domDiff = new DiffDOM();
    modifyHead = false;

    inject = {
        selector: null,
        attr: null,
        _injected: []
    };

    root = {
        selector: "body",
        el: document.body
    };

    constructor(options) {
        if (options.root) {
            this.root.selector = options.root;
            this.root.el = document.querySelector(options.root);
        }

        const [selector, attr] = options.inject || [null, null];
        Object.assign(this.inject, {
            selector,
            attr
        });

        this.modifyHead = options.head || false;

        window.history.replaceState({
            route: window.location.pathname
        }, null, null);

        window.addEventListener("popstate", (e) => {
            this._callEvent("beforePop", e);
            this._goto(window.history.state.route);
            this._callEvent("pop", e);
        });

        this._inject(this.inject.selector, this.root.el, this.inject.attr);
    }

    goto(route) {
        window.history.pushState({
            route: route
        }, null, route);

        return this._goto(route);
    }

    on(event, callback) {
        this.callbacks[event].push(callback);
        return callback;
    }

    _inject(query, context, routeAttr = (el) => el.href) {
        if (!query) return false;

        this.inject._injected = this.inject._injected.filter((el, i) => {
            if (!el.isConnected) return null;
            return el;
        });

        Array.from(context.querySelectorAll(query)).forEach((el) => {
            if (!this.inject._injected.includes(el)) {
                this.inject._injected.push(el);
                el.addEventListener("click", (e) => {
                    e.preventDefault();
                    this.goto(routeAttr(el));
                });
            }
        });
    }

    _callEvent(event, ...params) {
        if (this.callbacks[event].length) {
            this.callbacks[event].forEach((cb) => cb(...params));
        }
    }

    _patch(a, b) {
        const diff = this.domDiff.diff(a, b);
        const diffresult = this.domDiff.apply(a, diff);
        if (!diffresult) {
            throw new Error('Diff could not be applied.');
        }
    }

    async _goto(route) {
        const response = await fetch(route);
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const elementA = this.root.el;
        const elementB = doc.querySelector(this.root.selector);

        this._callEvent("beforeMount", doc);

        this._patch(elementA, elementB);
        this._inject(this.inject.selector, elementA, this.inject.attr);

        if (this.modifyHead) {
            this._patch(document.head, doc.head);
        }

        this._callEvent("mount", doc);
    }

    static back() {
        return window.history.back();
    }
}

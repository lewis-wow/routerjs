/*
    import: 
        npm i diff-dom
        import { DiffDOM } from "diff-dom";

    files:
        https://github.com/fiduswriter/diffDOM/tree/main/browser

*/

const { DiffDOM } = diffDOM;

class Router {
    constructor(base = "body") {
        this.base = base;
        this.domDiff = new DiffDOM();

        this.callbacks = {
            onMount: null
        };

        window.history.replaceState({
            route: window.location.pathname
        }, null, null);

        window.addEventListener("popstate", (e) => {
            this._goto(window.history.state.route);
        });
    }

    inject(query, routeAttr = "href") {
        Array.from(document.querySelectorAll(query)).forEach((el) => {
            el.addEventListener("click", (e) => {
                e.preventDefault();
                this.goto(el[routeAttr]);
            });
        });
    }

    goto(route) {
        window.history.pushState({
            route: route
        }, null, route);

        return this._goto(route);
    }

    onMount(callback) {
        this.callbacks.onMount = callback;
        return callback;
    }

    _goto(route) {
        return fetch(route).then(res => res.text()).then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const elementA = document.querySelector(this.base);

            if (this.callbacks.onMount) {
                this.callbacks.onMount(doc);
            }

            const diff = this.domDiff.diff(
                elementA,
                doc.querySelector(this.base)
            );

            const diffresult = this.domDiff.apply(elementA, diff);

            if (!diffresult) {
                throw new Error('diff could not be applied');
            }
        });
    }

    static back() {
        return window.history.back();
    }
}

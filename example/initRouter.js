const router = new Router({
    root: "#root", //start diffing from...
    head: false, //true => diff and modify also head node
    inject: ["a", (el) => el.href] //inject selector "a" and pass route named in "href" property
});

router.on("beforeMount", (html) => {
    console.time("router changes time");
    document.title = html.title; //changing title for every page
});

router.on("mount", (html) => {
    console.timeEnd("router changes time");
});

router.on("beforePop", () => {
    console.log("before pop");
});

router.on("pop", () => {
    console.log("pop");
});

console.log("init router file");

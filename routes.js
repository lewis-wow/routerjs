const router = new Router("body");

router.inject("a");

router.onMount(html => {
    document.title = html.title;
});

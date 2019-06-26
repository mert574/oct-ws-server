module.exports = function(router) {
    
    router.get("/:accountId/init", (ctx) => {
        ctx.body = `Hello, ${ctx.params.accountId}!`;
    });

    router.get("/init", (ctx) => {
        ctx.body = `Helloasdd`;
    });

    router.get("*", (ctx) => {
        ctx.body = `404 bro`;
    });

    return router.routes();
};

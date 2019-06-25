module.exports = function(router) {
    
    router.get("/:username", (ctx) => {
        ctx.body = `Hello, ${ctx.params.username}!`;
    });

    return router.routes();
};

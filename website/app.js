// 服务端 koa
let Koa = require('koa');
let path = require('path');
let Server = require('koa-static');

let app = new Koa();

app.use(async (ctx, next) => {
    if (ctx.path === '/app/list') {
        ctx.body = { name: 'mmm', age: 18 }
    } else {
        return next();
    }
})

app.use(Server(path.join(__dirname, 'client')));
app.use(Server(path.join(__dirname, 'node_modules')));
app.listen(3000, () => {
    console.log('server start at 3000')
});
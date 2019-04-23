export default {
    // 监控不到图片404 可以用过window.addEventListener('error', fn, true)来实现
    // 如果是promise失败也不能通过onerror,可以通过unhandledrejection来捕获
    // unhandledrejection 即可捕获到未处理的Promise错误：
    init(cb) {
        window.onerror = function (msg, url, lineNo, columnNo, error) {
            console.dir(error);
            let stack = error.stack;
            let matchUrl = stack.match(/http:\/\/[^\n]*/)[0];
            let fileName = matchUrl.match(/http:\/\/(?:\S*)\.js/)[0];
            let [, row, column] = matchUrl.match(/:(\d+):(\d+)/);
            let info = {
                message: error.message,
                name: error.name,
                matchUrl,
                fileName,
                row,
                column
            };
            cb(info);
        }
    }
}
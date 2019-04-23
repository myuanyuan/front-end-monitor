export default {
    init(cb) {
        // 发送请求 xhr fetch
        let xhr = window.XMLHttpRequest;
        let oldOpen = xhr.prototype.open;
        xhr.prototype.open = function (method, url, async) {
            this.info = {
                method,
                url,
                async,
            };
            return oldOpen.apply(this, arguments);
        }
        let oldSend = xhr.prototype.send;
        xhr.prototype.send = function (value) {
            let start = Date.now();
            // 处理相应信息
            let fn = (type) => () => {
                this.info.time = Date.now() - start;
                this.info.requestSize = value && value.length || 0;
                this.info.responseSize = this.responseText.length;
                this.info.type = type;
                cb(this.info);
            }
            this.addEventListener('load', fn('load'), false);  // 成功
            this.addEventListener('error', fn('error'), false); // 失败
            this.addEventListener('abort', fn('abort'), false); // 终止
            return oldSend.apply(this, arguments);
        }
    }
}
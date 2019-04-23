### 监控什么？为什么要进行监控？
我们对以下一些情况一定不陌生：

 ![](https://user-gold-cdn.xitu.io/2019/4/23/16a47f8e890bedc3?w=2150&h=1598&f=png&s=609510 "监控什么")
在项目开发中我们经常遇到这样的情况，那么我们如何才能保证快速的定位问题并解决问题呢，这时，前端监控可以起到重要作用。
 
#### 前端监控内容

![](https://user-gold-cdn.xitu.io/2019/4/23/16a47fef55c99ea6?w=2154&h=1528&f=png&s=235005 "监控内容")

#### website
安装依赖

```sh
yarn add bootstrap jquery koa koa-static
```

<!-- website/app.js -->
```js
// 服务端 koa
let Koa = require('koa');
let path = require('path');
let Server = require('koa-static');

let app = new Koa();

app.use(Server(path.join(__dirname, 'client')));  // 服务访问入口
app.use(Server(path.join(__dirname, 'node_modules')));  // 静态资源路径
app.listen(3000, () => {
    console.log('server start at 3000')
});
```
<!-- client/index.html -->
```js
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>前端监控</title>
    <script src='/bundle.js'></script>
    <link rel="stylesheet" href='/bootstrap/dist/css/bootstrap.css' />
</head>

<body>
    <div class="text-center text-danger h2">前端监控</div>
    <script src='/jquery/dist/jquery.js'></script>
</body>

</html>
```

#### monitor
安装依赖
```sh
yarn add @babel/core @babel/preset-env rollup rollup-plugin-babel
```

```js
// monitor/rollup.config.js
import babel from 'rollup-plugin-babel';
export default {
    input: './index.js',
    output: {
        file: '../website/client/bundle.js',
        format: 'umd', // amd cmd 都统一支持
    },
    watch: {
        exclude: 'node_modules/**',
    },
    plugins: [
        babel({
            babelrc: false,
            presets: [
                '@babel/preset-env'
            ]
        })
    ]
}
```
#### 性能监控
性能监控 ： 计算时间差 dns解析 dom加载 利用浏览器提供的API performance；IE9+支持的）
我们可以利用浏览器提供的performance来进行计算

![](https://user-gold-cdn.xitu.io/2019/4/23/16a4801fb6ac2c22?w=2900&h=1530&f=png&s=2248889 "监控指标")

```js
// monitor/performance.js
// 专门用来写页面性能监控的

let processData = (p) => {
    let data = {
        prevPage: p.fetchStart - p.navigationStart, // 上一个页面到这个页面的时长
        redirect: p.redirectEnd - p.redirectStart,  // 重定向的时长
        dns: p.domainLookupEnd - p.domainLookupStart,     // dns解析的时长
        connect: p.connectEnd - p.connectStart,       // TCP链接的时长
        send: p.responseEnd - p.requestStart,         // 从请求到响应的时长
        ttfb: p.responseStart - p.navigationStart,  // 首字节接受到的时长 测试服务器快慢
        domready: p.domInteractive - p.domLoading,    // dom准备的时长
        whiteScreen: p.domLoading - p.navigationStart, // 白屏时长
        dom: p.domComplete - p.domLoading,   // dom解析时长
        load: p.loadEventEnd - p.loadEventStart, // onLoad的执行时长
        total: p.loadEventEnd - p.navigationStart, // 总时长
    }
    return data;
}
// dom加载完成
let load = (cb) => {
    let timer;
    let check = () => {
        if (performance.timing.loadEventEnd) {
            clearTimeout(timer);
            cb();
        } else {
            timer = setTimeout(check, 100)
        }
    }
    window.addEventListener('load', check, false);
}
// 解析完成
let domready = (cb) => {
    let timer;
    let check = () => {
        if (performance.timing.loadEventEnd) {
            clearTimeout(timer);
            cb();
        } else {
            timer = setTimeout(check, 100)
        }
    }
    window.addEventListener('DOMContentLoaded', check, false);
}

export default {
    init(cb) {
        domready(() => { // 有可能没有触发onload dom解析完成后先统计一次 （没加载完就关闭页面了）
            let performanceData = processData(performance.timing);
            cb(performanceData)
        })
        load(() => {
            let performanceData = processData(performance.timing);
            cb(performanceData)
        });
    }
}
```


```js
//  monitor/index.js 
import perf from './performance';
perf.init((data) => {
    console.log(data)
});
```

#### 资源监控 
```js
// monitor/resource.js 
let processData = (_) => {
    let data = {
        name: _.name,
        initiatorType: _.initiatorType,
        duration: _.duration,
    }
    return data;
}
export default {
    init(cb) {
        // 使用PerformanceObserver一个一个取
        if (window.PerformanceObserver) {
            let observer = new PerformanceObserver((list) => {
                let data = list.getEntries();
                cb(processData(data[0]))
            })
            observer.observe({ entryTypes: ['resource'] })
        } else {
            window.onload = () => {
                let resourceData = performance.getEntriesByType('resource');
                let data = resourceData.map(_ => processData(_))
                cb(data);
            }
        }
    }
}
```

```js
//  monitor/index.js 
// 资源加载信息
import resource from './resource';

resource.init((data) => {
    console.log(data);
});
```

#### 请求监控

```js
// 以xhr为例
//  monitor/xhr.js 
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
```

```js
//  monitor/index.js 
// 资源加载信息
import xhr from './xhr';

xhr.init((data) => {
    console.log(data);
});
```

```js
// website/client/main.js
$.ajax({
    method: 'GET',
    url: '/app/list',
    data: {
        name: 'mmm',
        age: 18
    }
})
```


#### 错误信息监控

```js
// monitor/errCatch.js
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
```

```js
// monitor/index.js
// 错误信息
import errCatch from './errCatch';

errCatch.init((data) => {
    console.log(data);
});
```

```js
// website/client/main.js
console.log(mmm);
```
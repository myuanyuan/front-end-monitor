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
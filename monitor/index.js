
// dom解析信息
// import perf from './performance';
// let fomateObj = (obj) => {
//     let arr = [];
//     for (let key in obj) {
//         arr.push(`${key}=${obj[key]}`)
//     }
//     return arr.join('&');
// }

// perf.init((data) => {
//     let img = new Image();
//     // 传给服务端performance信息
//     img.src = `/p.gif?${fomateObj(data)}`; // 使用一个小的img 使用img没有跨域问题
//     console.log(fomateObj(data));
// });

// 资源加载信息
// import resource from './resource';

// resource.init((data) => {
//     console.log(data);
// });

// // ajax请求信息
// import xhr from './xhr';

// xhr.init((data) => {
//     console.log(data);
// });

// 错误信息
import errCatch from './errCatch';

errCatch.init((data) => {
    console.log(data);
});


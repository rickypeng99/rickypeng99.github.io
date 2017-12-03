---
layout: post
title: Akiris 的 Koa 杂谈 1
category: Koa
tags: Essay, Koa
keywords: Koa, JavaScript
description: Akiris with Koa
---

如果有错麻烦告诉我，我会很诚恳地纠正 :\) 毕竟只是一个很小的样本，当吐槽看就好啦。

## 自我吐槽

什么？ Koa 是什么你不知道？就是 express 的高大上异步（？）版本啦。

什么？你说我不知道什么是 express ？额，这里是一个写 JavaScript 的。

# Akiris with Koa

不说废话了/- -!

环境（来自`package.json`）：

```javascript
"dependencies": {
  /* ... */
  "koa": "^2.3.0",
  "koa-router": "^7.2.1",
  "koa-static": "^4.0.1",
  "koa-views": "^6.0.2",
  /* ... */
}
```

## koa-guide 的一个小坑

[koa-guide](https://github.com/guo-yu/koa-guide) 里面有些用例似乎好久没有更新了，例如：

```javascript
// response
app.use(function *() {
  // (3) 进入 response 中间件，没有捕获到下一个符合条件的中间件，传递到 upstream
  this.body = 'Hello World';
});
```

如果放进去看的话，只会返回给你一个`Not Found`。对比[官方API](https://github.com/koajs/koa/blob/master/docs/api/index.md)：

```javascript
// response

app.use(ctx => {
  ctx.body = 'Hello World';
});
```

额咳咳（摔桌。后来我一看，在[koa-guide\|应用（Application）](https://github.com/guo-yu/koa-guide#应用application)这一节说到：

> **如果使用 Koa 2 的话**

好吧是在下近视了。混用可不好啊（ ctx.body 对应 Koa 2 ）

## 正确地处理错误

首先是一个十分有现代风格的中间件：

```javascript
async function ( ctx, next ) {
  let start = new Date; // 进入该中间件时的时间
  await next(); // 等待下游
  let timeified = timeify(new Date - start); // 输出对人类和猫友好的时间格式，如 22.5d, 1s, 3.6min
  console.log( `${ctx.method} [${ctx.status}] ${timeified[0]}${timeified[1]} >>> ${ctx.url}` );
  // 输出示例：GET [404] 202ms >>> /api/v0/1
}
```

这个用来记录处理请求所用的时间以及处理的 status （注意中间件先后顺序）。同样是 Koa 版本的问题（那个中文 guide 应该是针对低版本的？），
同样是一个十分简单的中间件：

```javascript
async (ctx, next) => {
  try{
    await next();
  } catch(e){
    console.log('error occurred.', e, e.status);
  }
}
```

这个并没有进行太多的处理，单纯 log 一下就好了。  
最常见的错误是什么？

> 当然是 404 啦

所以我就访问了一个不存在的 URL 。  
可是我在控制台只看到这么一句：  

```
GET [404] 202ms >>> /api/v0/1
```

说明那个错误处理中间件似乎并卵。这样子无论怎么拦截， 404 永远都不会被你抓到（太快了不是吗）  
后来我搜索了一下，在 Koa issues 里面翻到了一个 issue ，说的是： Koa 默认设置 status 为 404 。  
也就是说：什么都不干也是404/- -/什么都不干怎么会抛出错误嘛- -  
在搜索更好的错误处理 [koa-better-error-handler](https://www.npmjs.com/package/koa-better-error-handler#user-friendly-responses) 的时候也发现了这样子的一段代码：

```javascript
// custom 404 handler since it's not already built in 
app.use(async (ctx, next) => {
  try {
    await next();
    if (ctx.status === 404) // 默认为 404 ，所以必须判断一下
      ctx.throw(404);
  } catch (err) {
    ctx.throw(err);
    ctx.app.emit('error', err, ctx); // 触发 koa 内置的错误处理，应该是在控制台打印。
  }
});
```

嗯......在`next()`之后判断 status 然后`ctx.throw(404)`。这样子才是正解(P.S. 有了这个还用什么 onerror 啊)  
那么究竟咋样会 404 呢？

### 404 究竟是因为没有干什么

出现 404 ，应该就是没有覆盖`ctx.status`却又不肯写哪怕一个字的 body 吧。

## 获取一些基本的信息

### 获取 path 里面的参数

例如说这一段 URL：`/verify/:id`, 怎么获得 id 值？我看了不少示例，有用`this.params`的，也有直接加一个参数的（这样子就没有`ctx`参数了- -）  
好吧，既然有`this.params`，那么应该有`ctx.params`吧（手动 replace 。  
果然这样子就出来了。

### 附议：获取 query 里面的参数

那好， query 的参数呢？在[这里](https://github.com/koajs/koa/blob/master/docs/api/request.md)可以找到。看到`request.query`了吗？好，我就试一下`ctx.req.query`。  
好吧……出现`undefined`。  
那我再试一下`ctx.request.query`，好好好，果然是这个，并没有被缩写。  
那么`ctx.req`又是什么鬼？我 dump 了一下（以下是同一个请求）：  

1. `ctx.req`

```javascript
{
  method: 'GET',
  url: '/api/v0/verify/16?token=aaaaa&a=b',
  header: { 
    /* many other headers... */
  }
}
```

2. `ctx.request`: 这就是一个`IncomingMessage`类的对象。超级长。

BTW，`ctx.query`和`ctx.request.query`在获取到的内容上是等价的。
例如说：`token=aaaaa&a=b&json={"a":1,"B":"123"}`会被解析成：

```javascript
{
  token: 'aaaaa',
  a: 'b',
  json: '{"a":1,"B":"123"}'
}
```

## 优雅的错误处理

### 正确的抛出姿势

我加了一个 JWT 的认证，尝试着让他抛出一个错误：`ctx.throw( ... )`，不过我发现他直接被抛出了- -处理中间件一点都没有收到。  
那么我再试一下程序里直接`throw err`……好吧老样子。这个真是让人抓不着头脑。  
那么我来试一下赤裸裸的 404 吧。  
什么啊！`ctx.throw`居然被接收到了！难不成 await 还不能正确处理上升的 Error 么……  
那好我就写一个东西，让它在 router 里面抛出。

```javascript
router.get('/pnova', (ctx) => ctx.throw(426) );
```

很好……试一下。好了居然被接中了。  
可能是 callback 的问题？

```javascript
router.get('/verify/:token', (ctx) => {
  jwt.verify( ctx.params.token, 'key', function(err, decoded){
    if(err) {
      ctx.body = err.toString();
      throw new Error('unauthorized');
    }
    console.log('decoded', decoded);
  } );
});
```

这个是原代码。看来还是得花一些心思啊。

+ 好啦好啦 wrap 的代码我就不贴出来了。

然后 router 那边变成了这样子：

```javascript
router.get('/verify/:token', async (ctx) => {
  let decoded = JWTVerify( ctx.params.token, 'key' );
  console.log('decoded: ', decoded);
});
```

试一下。  
我第一次 attempt ：忘了加 await ，然后看着控制台输出的 pending 一脸傻子）  
第二次 attempt ：把 resolve 和 reject 弄反了（冰封：蠢灯一枚！  
很好，成功了。这次正常抛出了。  
检验是不是没有加`try catch`？是的，方便了不少不是吗（摊手。  
那好，接下来咱们就弄一个错误页面吧。

### 漂亮地输出错误

首先是处理 stacktrace 。我花了好长时间写了一个脚本，下面是其中的一部分：

```javascript
// buildStackTrace.js
/* ... */

let buildModulePath = (match, type) => 
  type === 'html' | !type
  ?  [ `&lt;Module <pre class="m">${match[1].htmlEncode()}</pre>&gt;`, '' ]
  :  [ `<Module ${match[1]}>`, ''];

/* ... */

Array.prototype.ifElse = function(cond, statement, elseStatement) {
  let realCond = typeof cond === 'function' ? !!cond( this ) : cond;
  let realStatement = realCond ? statement : elseStatement;

  return typeof realStatement === 'function' ? realStatement( this ) : realStatement;
}

String.prototype.htmlEncode = function() {
  let str = this;
  let arrEntities={'<':'lt','>':'gt',' ':'nbsp','&':'amp','"':'quot'};
   return str.replace(/(<|>| |&|")/ig, (_,t) => arrEntities[t] );
}

let a;
let buildStackTrace = ( stack, type ) =>
  stack
  .replace( /(\\)/g, '/')
  .replace(/\r/g, '')
  .split('\n')
  .slice(1)
  .map( line => ( a = regGetModuleName.exec( line ) ) ? buildModulePath(a, type) : buildScriptPath(line, type) )
  .ifElse(
    type === 'html' | !type,
    arr => arr.map( result => `<li>&nbsp;&nbsp;&nbsp;&nbsp;at <b>${result[0]}</b> ${result[1]}</li>`).join('\n'),
    arr => JSON.stringify(arr)
  );

module.exports = {
  buildStackTrace: buildStackTrace
}
```

(我在写这个的时候满脑子都是`let in`和`where`......) 用`buildStack(someError.stack, type)`就可以输出半 HTML 列表了。为了看起来有一点 FP 的样子我还给它实现了几个神奇的方法- -跟着冰封学 Haskell 的结果就是， JavaScript 代码变骚了。  
另外还有一个 EJS 模板，用来输出 HTML 形式的错误页面。代码全文待我这个项目完成就可以贴出来啦\~

是不是看见了`[].ifElse()`那里有一个`JSON.stringify()`？很好，接下来我们要做的就是按照浏览器（或者说，客户端）民白的形式漂亮地返回。(没有错字

（文太长了，下面的被我吃掉了。所以后**续**等更新吧/- -...）

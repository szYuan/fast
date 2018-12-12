const http = require('http');
const initRequest = require('./request');
const initRes = require('./response');


function Fast(opt) {
    // 返回自己的实例
    return new Fast.prototype.init(opt);
}

Fast.prototype.init = function(opt) {
    console.log('init');
    this.server = http.createServer((req, res) => {
        this.serverHandler(this, req, res);
    });
    // task是一个对象：{path[String]: middlewares[Array]}
    this.tasks = [];
}
Fast.prototype.init.prototype = Fast.prototype;

Fast.prototype.serverHandler = function(fast, originReq, originRes) {
    // 为res,req对象添加方法
    const request = initRequest(originReq);
    const response = initRes(originRes);

    // 根据请求，执行对应任务（已添加的函数列表）
    fast._runTasks(request, response);
}

// 公开方法 - - - - - - - - - - - - - - - - - - - - - - - - - - - 
Fast.prototype.use = function(path, middlewareFn) {
    // 将路径和执行函数推入函数列表
    this._addTask({
        path: path, 
        fn: middlewareFn
    })
}
Fast.prototype.get = function(path, middlewareFn) {
    // middlewareFn
}

// 私有方法 - - - - - - - - - - - - - - - - - - - - - - - - - - - 
// 增加任务
Fast.prototype._addTask = function(task) {
    let path = task.path;
    let fn = task.fn;
    // path已存在则追加middlewares，没有则新建
    if( !this.tasks[path] ) {
        this.tasks[path] = [];
    }
    this.tasks[path].push(fn);
}
Fast.prototype._runTasks = function(request, response) {
    let requestPath = request.url;
    if( this.tasks[requestPath] ) {
        let middlewares = this.tasks[requestPath];
        for(let i = 0; i < middlewares.length; i++) {
            let middleware = middlewares[i];
            let nextMid = false;
            // 定义next函数
            function next() {
                nextMid = true;
            }
            // 执行中间件
            middleware(request, response, next);
            // 若未执行next函数，则不再继续执行后续中间件
            if(!nextMid) {
                break;
            }
        }
    }else {
        response.status(404);
    }
}

Fast.prototype.listen = function(port) {
    this.server.listen(port);
}


module.exports = Fast;
// 为原始response对象添加方法
module.exports = function response(originResponse) {

    const response = originResponse;

    response.status = status(response);

    return response;

}

function status(res) {
    return function () {
        res.end('xxx');
    }
}
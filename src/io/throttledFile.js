class ThrottledFile {

    constructor(file, rateLimiter) {
        this.file = file
        this.rateLimiter = rateLimiter
    }


    async read(position, length) {

        const file = this.file
        const rateLimiter = this.rateLimiter

        return new Promise(function (fulfill, reject) {
            rateLimiter.limiter(async function (f) {
                try {
                    const result = await f.read(position, length)
                    fulfill(result)
                } catch (e) {
                    reject(e)
                }
            })(file)
        })
    }
}

// let isCalled = false
// let calls = [];
//
// function limiter(fn, wait) {
//
//     let caller = function () {
//         if (calls.length && !isCalled) {
//             isCalled = true;
//             calls.shift().call();
//             setTimeout(function () {
//                 isCalled = false;
//                 caller();
//             }, wait);
//         }
//     };
//
//     return function () {
//         calls.push(fn.bind(this, ...arguments));
//         caller();
//     };
// }


module.exports = ThrottledFile
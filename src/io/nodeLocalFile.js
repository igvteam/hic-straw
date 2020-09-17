const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

let fs;
let fsOpen;
let fsRead;

if (isNode) {
    const util = require('util');
    fs = require('fs');
    fsOpen = fs && util.promisify(fs.open)
    fsRead = fs && util.promisify(fs.read)
}

class NodeLocalFile {

    constructor(args) {
        this.path = args.path
    }


    async read(position, length) {

        const buffer = Buffer.alloc(length)
        const fd = await fsOpen(this.path, 'r')
        const result = await fsRead(fd, buffer, 0, length, position)

        fs.close(fd, function (error) {
            // TODO Do something with error
        })

        //TODO -- compare result.bytesRead with length
        const b = result.buffer;
        const arrayBuffer = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
        return arrayBuffer
    }
}

export default NodeLocalFile

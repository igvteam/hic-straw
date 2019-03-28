const {assert} = require('chai')

const BufferedFile = require("../src/io/bufferedFile")
const LocalFile = require("../src/io/nodeLocalFile")
const RemoteFile = require("../src/io/remoteFile")


suite('BufferedFile', function () {

    test('test local file', async function () {

        const path = require.resolve("./data/BufferedReaderTest.bin")

        const file = new BufferedFile({file: new LocalFile({path: path}), size: 50})

        let nTests = 10000
        while(nTests-- > 0) {

            const start = Math.floor(Math.random() * 256)
            let length =  Math.floor(Math.random() * 100)
            if(length === 0) continue

            const arrayBuffer = await file.read(start, length)
            assert.ok(arrayBuffer);

            const dataView = new DataView(arrayBuffer);

            // Only test to end of file
            const end = Math.min(length, 256 - start)
            for (let i = 0; i < end; i++) {
                const expectedValue = -128 + start + i;
                const value = dataView.getInt8(i);
                assert.equal(expectedValue, value);

            }
        }
    })

    test('test remote file', async function () {

        this.timeout(60000)

        const path = "https://s3.amazonaws.com/igv.org.test/data/BufferedReaderTest.bin"

        const file = new BufferedFile({file: new RemoteFile({url: path}), size: 50})

        let nTests = 50
        while(nTests-- > 0) {

            const start = Math.floor(Math.random() * 256)
            let length =  Math.floor(Math.random() * 100)
            if(length === 0) continue

            const arrayBuffer = await file.read(start, length)
            assert.ok(arrayBuffer);

            const dataView = new DataView(arrayBuffer);

            // Only test to end of file
            const end = Math.min(length, 256 - start)
            for (let i = 0; i < end; i++) {
                const expectedValue = -128 + start + i;
                const value = dataView.getInt8(i);
                assert.equal(expectedValue, value);

            }
        }
    })

})

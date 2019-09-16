import { assert } from 'chai';
import BufferedFile from '../src/io/bufferedFile';
import LocalFile from '../src/io/nodeLocalFile';
import RemoteFile from '../src/io/remoteFile';


suite('BufferedFile', function () {

    test('test local file', async function () {

        const path = require.resolve("./data/BufferedReaderTest.bin")

        const file = new BufferedFile({file: new LocalFile({path: path}), size: 50})

        let nTests = 10000
        while (nTests-- > 0) {

            const start = Math.floor(Math.random() * 256)
            let length = Math.floor(Math.random() * 100)
            if (length === 0) continue

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

        const url = "https://s3.amazonaws.com/igv.org.test/data/BufferedReaderTest.bin"

        const file = new BufferedFile({file: new RemoteFile({url: url}), size: 51})

        // Request > than buffer size
        let start = 10
        let length = 100
        let arrayBuffer = await file.read(start, length)
        assert.ok(arrayBuffer);
        testBuffer(arrayBuffer, length, start)

        // Create buffer from 100 -> 150
        start = 100
        length = 50
        arrayBuffer = await file.read(start, length)
        assert.ok(arrayBuffer);
        testBuffer(arrayBuffer, length, start)

        // Within buffer
        start = 110
        length = 30
        arrayBuffer = await file.read(start, length)
        assert.ok(arrayBuffer);
        testBuffer(arrayBuffer, length, start)

        // Left overlap
        start = 90
        length = 30
        arrayBuffer = await file.read(start, length)
        assert.ok(arrayBuffer);
        testBuffer(arrayBuffer, length, start)

        // Right overlap
        start = 140
        length = 30
        arrayBuffer = await file.read(start, length)
        assert.ok(arrayBuffer);
        testBuffer(arrayBuffer, length, start)

        // Outside of buffer
        start = 205
        length = 50
        arrayBuffer = await file.read(start, length)
        assert.ok(arrayBuffer);
        testBuffer(arrayBuffer, length, start)

        // Past end of file
        start = 240
        length = 50
        arrayBuffer = await file.read(start, length)
        assert.ok(arrayBuffer);
        testBuffer(arrayBuffer, length, start)

        function testBuffer(arrayBuffer, length, start) {
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

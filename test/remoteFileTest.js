import { assert } from 'chai';
import RemoteFile from '../src/io/remoteFile.js';


suite('NodeRemoteFile', function () {

    test('test read range', async function () {
        const range = {start: 25, size: 100};
        const url = "https://s3.amazonaws.com/igv.org.test/data/BufferedReaderTest.bin"

        const file = new RemoteFile({url: url})
        const arrayBuffer = await file.read(range.start, range.size)
        assert.ok(arrayBuffer);

        const dataView = new DataView(arrayBuffer);

        for (let i = 0; i < range.size; i++) {
            const expectedValue = -128 + range.start + i;
            const value = dataView.getInt8(i);
            assert.equal(expectedValue, value);

        }

    })

    test('test read range - floating point', async function () {
        const range = {start: 25.0, size: 100.5};
        const url = "https://s3.amazonaws.com/igv.org.test/data/BufferedReaderTest.bin"

        const file = new RemoteFile({url: url})
        const arrayBuffer = await file.read(range.start, range.size)
        assert.ok(arrayBuffer);

        const dataView = new DataView(arrayBuffer);

        for (let i = 0; i < range.size; i++) {
            const expectedValue = -128 + range.start + i;
            const value = dataView.getInt8(i);
            assert.equal(expectedValue, value);

        }

    })

})
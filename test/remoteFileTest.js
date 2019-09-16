import { assert } from 'chai';
import RemoteFile from '../src/io/remoteFile.js';

const range = {start: 25, size: 100};

suite('NodeRemoteFile', function () {

    test('test read range', async function () {

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
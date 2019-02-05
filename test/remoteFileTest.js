const {assert} = require('chai')

const RemoteFile = require("../src/io/remoteFile")

const range = {start: 25, size: 100};

suite('NodeRemoteFile', function () {

    function testRangeByte(arrayBuffer) {

        assert.ok(arrayBuffer);

        var i;
        var dataView = new DataView(arrayBuffer);

        for (i = 0; i < range.size; i++) {

            var expectedValue = -128 + range.start + i;
            var value = dataView.getInt8(i);
            assert.equal(expectedValue, value);

        }
    }

    test('test load', (done) => {

        const path = "https://s3.amazonaws.com/igv.org.test/data/BufferedReaderTest.bin"
        const file = new RemoteFile(path)
        file.read(range.start, range.size)
            .then(function (arrayBuffer) {
                testRangeByte(arrayBuffer)
                done()
            })


    })

})
const {assert} = require('chai')

const NodeLocalFile = require("../src/io/nodeLocalFile")

const range = {start: 25, size: 100};

suite('NodeLocalFile', function () {

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

        const path = "/Users/jrobinso/igv-team Dropbox/James Robinson/projects/hic-straw/test/data/BufferedReaderTest.bin"
        const file = new NodeLocalFile(path)
        file.read(range.start, range.size)
            .then(function (arrayBuffer) {
                testRangeByte(arrayBuffer)
                done()
            })


    })

// QUnit.test("test loadArrayBuffer", function (assert) {
//
//     var done = assert.async();
//
//     var url = "data/misc/BufferedReaderTest.bin";
//
//     igv.xhr.loadArrayBuffer(url,
//         {
//             range: range
//         })
//
//         .then(function (data) {
//             testRangeByte(data, assert);
//             done();
//         });
// });
//
// QUnit.test("test loadString", function (assert) {
//
//     var done = assert.async();
//
//     var url = "data/json/example.json";
//
//     igv.xhr.loadString(url, {})
//
//         .then(function (result) {
//
//             assert.ok(result);
//
//             assert.ok(result.startsWith("{\"employees\""));
//
//             done();
//         });
// });
//
// QUnit.test("test loadJson", function (assert) {
//
//     var done = assert.async();
//
//     var url = "data/json/example.json";
//
//     igv.xhr.loadJson(url, {})
//
//         .then(function (result) {
//
//             assert.ok(result);
//
//             assert.ok(result.hasOwnProperty("employees"));
//
//             done();
//         });
// });
//
// QUnit.test("test loadString gzipped", function (assert) {
//
//     var done = assert.async();
//
//     var url = "data/json/example.json.gz";
//
//     igv.xhr.loadString(url, {})
//
//         .then(function (result) {
//
//             assert.ok(result);
//
//             assert.ok(result.startsWith("{\"employees\""));
//
//             done();
//         });
// });
//
//
// QUnit.test("test loadString bg-zipped", function (assert) {
//
//     var done = assert.async();
//
//     var url = "data/json/example.json.bgz";
//
//     igv.xhr.loadString(url, {bgz: true})
//
//         .then(function (result) {
//
//             assert.ok(result);
//
//             assert.ok(result.startsWith("{\"employees\""));
//
//             done();
//         });
//
// });
})
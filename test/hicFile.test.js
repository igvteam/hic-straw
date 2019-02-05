const {assert} = require('chai')

const HicFile = require('../src/hicFile')

suite('HicFile', function () {

    test('local file read header', async function () {

        const hicFile = new HicFile({
            "path": require.resolve("./data/test_chr22.hic"),
        })

        await hicFile.readHeader()
        assert.equal(hicFile.magic, "HIC")
    })

    test('local file read matrix', async function () {

        const hicFile = new HicFile({
            "path": require.resolve("./data/test_chr22.hic"),
        })

        const matrix = await hicFile.readMatrix("22", "22")
        assert.ok(matrix)
    })

    test('local file read matrix -- alt chr name', async function () {

        const hicFile = new HicFile({
            "path": require.resolve("./data/test_chr22.hic"),
        })

        const matrix = await hicFile.readMatrix("chr22", "chr22")
        assert.ok(matrix)
    })


    test('local file read norm vector index', async function () {

        const hicFile = new HicFile({
            "path": require.resolve("./data/test_chr22.hic"),
        })

        const normVectorIndex = await hicFile.getNormVectorIndex()
        assert.ok(normVectorIndex)

    })

    // getNormalizationVector(type, chrIdx, unit, binSize)

    test('local file read norm vector', async function () {

        const hicFile = new HicFile({
            "path": require.resolve("./data/test_chr22.hic"),
        })

        const type = "KR"
        const chr = "22"
        const unit = "BP"
        const binSize = 100000
        const normVector = await hicFile.getNormalizationVector(type, chr, unit, binSize)
        assert.equal(normVector.data.length, 515)
        assert.ok(normVector)

    })

    test('remote file read header', async function () {

        const hicFile = new HicFile({
            "path": "https://s3.amazonaws.com/igv.broadinstitute.org/data/hic/intra_nofrag_30.hic",
            "loadFragData": false
        })

        await hicFile.readHeader()
        assert.equal(hicFile.magic, "HIC")

    })

    test('remote file norm vector index', async function () {

        const hicFile = new HicFile({
            "path": "https://s3.amazonaws.com/igv.broadinstitute.org/data/hic/intra_nofrag_30.hic"
        })
        const type = "KR"
        const chr = "22"
        const unit = "BP"
        const binSize = 100000

        const normVector = await hicFile.getNormalizationVector(type, chr, unit, binSize)
        assert.equal(normVector.data.length, 515)
        assert.ok(normVector)

    })

})

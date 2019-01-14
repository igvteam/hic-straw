const {assert} = require('chai')

const Straw = require('../src/straw')

suite('Straw', function () {

    test('remote file contact records', async function () {

        this.timeout(60000);
        const straw = new Straw({
            "path": "https://s3.amazonaws.com/igv.broadinstitute.org/data/hic/intra_nofrag_30.hic",
            "nvi": "863389571,18679"
        })

        const contactRecords = await straw.getContactRecords(
            "KR",
            {chr: "8", start: 48700000, end: 48900000},
            {chr: "8", start: 48700000, end: 48900000},
            "BP",
            10000
        )

        assert.equal(contactRecords.length, 341)

    })

    test('local file meta data', async function () {

        const straw = new Straw({
            "path": require.resolve("./data/test_chr22.hic")
        })

        const meta = await straw.getMetaData()
        assert.ok(meta)
        assert.equal(meta.version, 8)
        assert.equal(meta.genome, "hg19")
        assert.equal(meta.chromosomes.length, 26)
        assert.equal(meta.resolutions.length, 9)

    })

    test('local file norm vector options', async function () {

        const straw = new Straw({
            "path": require.resolve("./data/test_chr22.hic")
        })

        const normalizationOptions = await straw.getNormalizationOptions()
        assert.ok(normalizationOptions)
        assert.equal(normalizationOptions.length, 4)
    })

    test('local file nvi', async function () {

        const straw = new Straw({
            "path": require.resolve("./data/test_chr22.hic")
        })

        const nvi = await straw.getNVI()
        assert.equal(nvi, "1720269,751")
    })

    test('local file contact records', async function () {

        const straw = new Straw({
            "path": require.resolve("./data/test_chr22.hic")
        })

        const contactRecords = await straw.getContactRecords(
            "KR",
            {chr: "22", start: 50000000, end: 100000000},
            {chr: "22", start: 50000000, end: 100000000},
            "BP",
            100000
        )

        assert.ok(contactRecords)
        assert.equal(contactRecords.length, 70)
    })

    test('local file contact records - with NVI', async function () {

        const straw = new Straw({
            "path": require.resolve("./data/test_chr22.hic"),
        })

        const contactRecords = await straw.getContactRecords(
            "KR",
            {chr: "22", start: 50000000, end: 100000000},
            {chr: "22", start: 50000000, end: 100000000},
            "BP",
            100000
        )

        assert.ok(contactRecords)
        assert.equal(contactRecords.length, 70)
    })
})


//8:57,482,012-115,882,011 8:55,082,012-113,482,011
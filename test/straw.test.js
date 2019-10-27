import { assert } from 'chai';
import Straw from '../src/straw';
import NodeLocalFile from '../src/io/nodeLocalFile';

suite('Straw', function () {

    test('local file meta data', async function () {

        const file = new NodeLocalFile({
            "path": require.resolve("./data/test_chr22.hic")
        })
        const straw = new Straw({file: file})

        const meta = await straw.getMetaData()
        assert.ok(meta)
        assert.equal(meta.version, 8)
        assert.equal(meta.genome, "hg19")
        assert.equal(meta.chromosomes.length, 26)
        assert.equal(meta.resolutions.length, 9)

    })

    test('local file norm vector options', async function () {

        const file = new NodeLocalFile({
            "path": require.resolve("./data/test_chr22.hic")
        })
        const straw = new Straw({file: file})

        const normalizationOptions = await straw.getNormalizationOptions()
        assert.ok(normalizationOptions)
        assert.equal(normalizationOptions.length, 4)
    })

    test('local file nvi', async function () {

        const file = new NodeLocalFile({
            "path": require.resolve("./data/test_chr22.hic")
        })
        const straw = new Straw({file: file})

        const nvi = await straw.getNVI()
        assert.equal(nvi, "1720269,751")
    })

    test('local file contact records', async function () {

        const file = new NodeLocalFile({
            "path": require.resolve("./data/test_chr22.hic")
        })
        const straw = new Straw({file: file})

        const contactRecords = await straw.getContactRecords(
            "KR",
            {chr: "chr22", start: 50000000, end: 100000000},
            {chr: "22", start: 50000000, end: 100000000},
            "BP",
            100000
        )

        assert.ok(contactRecords)
        assert.equal(contactRecords.length, 70)
    })

    test('local file contact records - with NVI', async function () {

        const file = new NodeLocalFile({
            "path": require.resolve("./data/test_chr22.hic")
        })
        const straw = new Straw({file: file})

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

    test('remote file contact records', async function () {

        this.timeout(60000);
        const straw = new Straw({
            "url": "https://s3.amazonaws.com/igv.broadinstitute.org/data/hic/intra_nofrag_30.hic",
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

    test('Version 7 file', async function () {

        this.timeout(60000);
        const straw = new Straw({
            "url": "https://data.broadinstitute.org/igvdata/test/data/hic/inter.hic"
        })

        const contactRecords = await straw.getContactRecords(
            "NONE",
            {chr: "1", start: 0, end: 1000000},
            {chr: "1", start: 0, end: 1000000},
            "BP",
            250000
        )

        assert.ok (contactRecords.length > 0)

    })

    test('norm vectors', async function () {

        const straw = new Straw({
            "url": "https://s3.amazonaws.com/igv.broadinstitute.org/data/hic/intra_nofrag_30.hic"
        })

        const getNormOptions = async () => {
            const normOptions = await straw.getNormalizationOptions();
            assert.equal(normOptions.length, 4)
        }

        getNormOptions()

    })

    test('norm vectors - no NVI', async function () {

        this.timeout(60000);
        const straw = new Straw({
            "url": "https://hicfiles.s3.amazonaws.com/hiseq/gm12878/in-situ/combined_30.hic"
        })

        const getNormOptions = async () => {
            const normOptions = await straw.getNormalizationOptions();
            assert.equal(normOptions.length, 8)
        }

        getNormOptions()

    })

    test('GEO file', async function () {

        this.timeout(60000);
        const straw = new Straw({
            "url": "https://ftp.ncbi.nlm.nih.gov/geo/samples/GSM2583nnn/GSM2583729/suppl/GSM2583729_H3K27ac_HiChIP_2.hic"
        })

        const contactRecords = await straw.getContactRecords(
            "KR",
            {chr: "arm_2L", start: 0, end: 1000000},
            {chr: "arm_2L", start: 0, end: 1000000},
            "BP",
            100000
        )

        assert.ok (contactRecords.length > 0)

    })

})

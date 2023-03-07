import {assert} from 'chai';
import Straw from '../src/straw.js';
import NodeLocalFile from '../src/io/nodeLocalFile.js';

suite('Straw', function () {

    test('local file meta data', async function () {

        const file = new NodeLocalFile({
            "path": "test/data/test_chr22.hic"
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
            "path": "test/data/test_chr22.hic"
        })
        const straw = new Straw({file: file})

        const normalizationOptions = await straw.getNormalizationOptions()
        assert.ok(normalizationOptions)
        assert.equal(normalizationOptions.length, 4)
    })

    test('local file nvi', async function () {

        const file = new NodeLocalFile({
            "path": "test/data/test_chr22.hic"
        })
        const straw = new Straw({file: file})

        const nvi = await straw.getNVI()
        assert.equal(nvi, "1720269,751")
    })

    test('local file contact records', async function () {

        const file = new NodeLocalFile({
            "path": "test/data/test_chr22.hic"
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
            "path": "test/data/test_chr22.hic"
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

        this.timeout(100000);
        const straw = new Straw({
            "url": "https://s3.amazonaws.com/igv.org.test/data/hic/intra_nofrag_30.hic",
            "nvi": "863389571,18679"
        })

        const contactRecords = await straw.getContactRecords(
            "KR",
            {chr: "8", start: 48700000, end: 48900000},
            {chr: "8", start: 48700000, end: 48900000},
            "BP",
            10000
        )

        assert.equal(contactRecords.length, 210)  // Earlier versions contained 110 duplicates

    })

    test('Version 7 file', async function () {

        this.timeout(100000);
        const straw = new Straw({
            "url": "https://s3.amazonaws.com/igv.org.test/data/hic/intra_nofrag_30.hic"
        })
        const contactRecords = await straw.getContactRecords(
            "NONE",
            {chr: "1", start: 0, end: 1000000},
            {chr: "1", start: 0, end: 1000000},
            "BP",
            250000
        )

        assert.ok(contactRecords.length > 0)

    })

    test('norm vectors', async function () {

        this.timeout(100000);
        const straw = new Straw({
            "url": "https://s3.amazonaws.com/igv.org.test/data/hic/intra_nofrag_30.hic"
        })
        const normOptions = await straw.getNormalizationOptions();
        assert.equal(normOptions.length, 4)
    })

    test('norm vectors - with NVI', async function () {

        this.timeout(100000);
        const straw = new Straw({
            "url": "https://s3.amazonaws.com/igv.org.test/data/hic/intra_nofrag_30.hic",
            "nvi": "863389571,18679"
        })
        const normOptions = await straw.getNormalizationOptions();
        assert.equal(normOptions.length, 4)

    })

    test('GEO file', async function () {

        this.timeout(100000);
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

        assert.ok(contactRecords.length > 0)

    })


    test('remote file transpose', async function () {
        this.timeout(100000);
        const straw = new Straw({
            "url": "https://hicfiles.s3.amazonaws.com/hiseq/gm12878/in-situ/primary.hic",
            "nvi": "33860030033,37504"
        })

        const blockBinCount = 685;
        const binSize = 25000;

        // cell [1,1]
        const start = 2 * blockBinCount * binSize;
        const contactRecords = await straw.getContactRecords(
            "KR",
            {chr: "22", start: start, end: start + 3 * binSize},
            {chr: "22", start: start, end: start + 3 * binSize},
            "BP",
            binSize
        )
        assert.equal(contactRecords.length, 6);

        // convention is bin2 > bin1,  other diagonal can be inferred by transposition
        for(let record of contactRecords) {
            assert.ok(record.bin2 >= record.bin1)
        }
    })

    test('remote file transpose 2', async function () {
        this.timeout(100000);
        const straw = new Straw({
            "url": "https://hicfiles.s3.amazonaws.com/hiseq/gm12878/in-situ/primary.hic",
            "nvi": "33860030033,37504"
        })

        const blockBinCount = 685;
        const binSize = 25000;

        // cell [1,2]
        const region1 = {chr: "8", start: 2 * blockBinCount * binSize, end: (2 * blockBinCount + 5) * binSize};
        const region2 = {chr: "8", start: 3 * blockBinCount * binSize, end: (3 * blockBinCount + 5)  * binSize};
        const contactRecords = await straw.getContactRecords(
            "NONE",
            region1,
            region2,
            "BP",
            binSize
        )

        const contactRecordsTranposed = await straw.getContactRecords(
            "NONE",
            region2,
            region1,
            "BP",
            binSize
        )
        assert.equal(contactRecordsTranposed.length, contactRecords.length);
    })

    test('contact records - inter chr', async function () {

        this.timeout(100000);
        const straw = new Straw({
            "url": "https://hicfiles.s3.amazonaws.com/hiseq/gm12878/in-situ/primary.hic"
        })

        let region1 = {chr: "22", start: 0, end: 342500000}
        let region2 = {chr: "X", start: 0, end: 342500000}

        const contactRecords = await straw.getContactRecords(
            "NONE",
            region1,
            region2,
            "BP",
            500000
        )
        assert.equal(21720, contactRecords.length)

        const contactRecordsTransposed = await straw.getContactRecords(
            "NONE",
            region2,
            region1,
            "BP",
            500000
        )
        assert.equal(contactRecords.length, contactRecordsTransposed.length)


    })


})

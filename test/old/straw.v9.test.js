import {assert} from 'chai';
import Straw from '../../src/straw';
import HicFile from "../../src/hicFile.js";

suite('Straw v9', function () {

    test('meta data', async function () {

        this.timeout(100000);
        const straw = new Straw({
            "url": "https://adam.3dg.io/suhas_juicebox/libs/corrected_combined_maps_v9/GM12878/GM12878_intact_18.7B_8.15.20_30.hic"
        })

        const meta = await straw.getMetaData()
        assert.ok(meta)
        assert.equal(meta.version, 9)
        assert.equal(meta.genome, "hg19")
        assert.equal(meta.chromosomes.length, 26)
        assert.equal(meta.resolutions.length, 17)

    })

    test('contact records', async function () {

        this.timeout(100000);
        const straw = new Straw({
            "url": "https://adam.3dg.io/suhas_juicebox/libs/corrected_combined_maps_v9/GM12878/GM12878_intact_18.7B_8.15.20_30.hic"
        })

        const contactRecords = await straw.getContactRecords(
            "NONE",
            {chr: "8", start: 48700000, end: 48900000},
            {chr: "8", start: 48700000, end: 48900000},
            "BP",
            10000
        )
        assert.equal(210, contactRecords.length)

        // This is an on-diagonal block,  convention is 1 diagonal is returned only, other can be inferred by transposition
        for(let record of contactRecords) {
            assert.ok(record.bin2 >= record.bin1)
        }


        // Test cache
        console.log("cache")
        const contactRecordsCached = await straw.getContactRecords(
            "NONE",
            {chr: "8", start: 48700000, end: 48900000},
            {chr: "8", start: 48700000, end: 48900000},
            "BP",
            10000
        )
        assert.equal(contactRecords.length, contactRecordsCached.length);
    })

    test('contact records - off diagonal', async function () {

        this.timeout(100000);
        const straw = new Straw({
            "url": "https://adam.3dg.io/suhas_juicebox/libs/corrected_combined_maps_v9/GM12878/GM12878_intact_18.7B_8.15.20_30.hic"
        })

        let region1 = {chr: "8", start: 0, end: 900000}
        let region2 = {chr: "8", start: 58700000, end: 58900000}
        const contactRecords = await straw.getContactRecords(
            "NONE",
            region1,
            region2,
            "BP",
            10000
        )
        const nRecords = contactRecords.length
        assert.ok(nRecords > 0)

        const contactRecordsTransposed = await straw.getContactRecords(
            "NONE",
            region2,
            region1,
            "BP",
            10000
        )
        assert.equal(nRecords, contactRecordsTransposed.length)


    })

    test('contact records - inter chr', async function () {

        this.timeout(100000);
        const straw = new Straw({
            "url": "https://adam.3dg.io/suhas_juicebox/libs/corrected_combined_maps_v9/GM12878/GM12878_intact_18.7B_8.15.20_30.hic"
        })

        let region1 = {chr: "22", start: 0, end: 51304566}
        let region2 = {chr: "X", start: 0, end: 155270560}

        const contactRecords = await straw.getContactRecords(
            "SCALE",
            region1,
            region2,
            "BP",
            500000
        )
        assert.equal(21684, contactRecords.length)

        const contactRecordsTransposed = await straw.getContactRecords(
            "SCALE",
            region2,
            region1,
            "BP",
            500000
        )
        assert.equal(contactRecords.length, contactRecordsTransposed.length)


    })

    test('contact records - transposed', async function () {

        this.timeout(100000);
        const straw = new Straw({
            "url": "https://adam.3dg.io/suhas_juicebox/libs/corrected_combined_maps_v9/GM12878/GM12878_insitu_quadRE_8.15.20.hic"
        })

        let region1 = {chr: "1", start: 20550000, end: 23975000}
        let region2 = {chr: "1", start: 17125000, end: 20550000}

        const contactRecords = await straw.getContactRecords(
            "SCALE",
            region1,
            region2,
            "BP",
            5000
        )
        assert.equal(27579, contactRecords.length)

        const contactRecordsTransposed = await straw.getContactRecords(
            "SCALE",
            region2,
            region1,
            "BP",
            5000
        )
        assert.equal(contactRecords.length, contactRecordsTransposed.length)


    })

    test('norm vector index', async function () {
        this.timeout(100000);
        const straw = new Straw({
            "url": "https://adam.3dg.io/suhas_juicebox/libs/corrected_combined_maps_v9/GM12878/GM12878_intact_18.7B_8.15.20_30.hic"
        })
        const normOptions = await straw.getNormalizationOptions();
        assert.equal(normOptions.length, 3)
    })

    test('norm vector index - with nvi', async function () {
        this.timeout(100000);
        const straw = new Straw({
            "url": "https://adam.3dg.io/suhas_juicebox/libs/corrected_combined_maps_v9/GM12878/GM12878_intact_18.7B_8.15.20_30.hic",
            "nvi": "201983310862,26779"
        })
        const normOptions = await straw.getNormalizationOptions();
        assert.equal(normOptions.length, 3)
    })

    test('norm vector', async function () {

        const hicFile = new HicFile({
            "url": "https://adam.3dg.io/suhas_juicebox/libs/corrected_combined_maps_v9/GM12878/GM12878_intact_18.7B_8.15.20_30.hic",
            "nvi": "201983310862,26779"
        })

        const type = "VC"
        const chr = "22"
        const unit = "BP"
        const binSize = 100000
        const normVector = await hicFile.getNormalizationVector(type, chr, unit, binSize)
        assert.equal(normVector.nValues, 515)

    })
})

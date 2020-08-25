import {assert} from 'chai';
import Straw from '../src/straw';
import HicFile from "../src/hicFile.js";

suite('Straw', function () {

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
        assert.equal(231, contactRecords.length)
    })

    test('contact records - off diagonal', async function () {

        this.timeout(100000);
        const straw = new Straw({
            "url": "https://adam.3dg.io/suhas_juicebox/libs/corrected_combined_maps_v9/GM12878/GM12878_intact_18.7B_8.15.20_30.hic"
        })

        const contactRecords = await straw.getContactRecords(
            "NONE",
            {chr: "8", start: 0, end: 900000},
            {chr: "8", start: 58700000, end: 58900000},
            "BP",
            10000
        )
        assert.equal(344, contactRecords.length)
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
        assert.equal(normVector.data.length, 515)
        assert.ok(normVector)

    })
})

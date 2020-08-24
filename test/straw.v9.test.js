import { assert } from 'chai';
import Straw from '../src/straw';
import NodeLocalFile from '../src/io/nodeLocalFile';

suite('Straw', function () {

    // test('meta data', async function () {
    //
    //     this.timeout(100000);
    //     const straw = new Straw({
    //         "url": "https://adam.3dg.io/suhas_juicebox/libs/corrected_combined_maps_v9/GM12878/GM12878_intact_18.7B_8.15.20_30.hic"
    //     })
    //
    //     const meta = await straw.getMetaData()
    //     assert.ok(meta)
    //     assert.equal(meta.version, 9)
    //     assert.equal(meta.genome, "hg19")
    //     assert.equal(meta.chromosomes.length, 26)
    //     assert.equal(meta.resolutions.length, 17)
    //
    // })



    test('contact records', async function () {

        this.timeout(100000);
        const straw = new Straw({
            "url": "https://adam.3dg.io/suhas_juicebox/libs/corrected_combined_maps_v9/GM12878/GM12878_intact_18.7B_8.15.20_30.hic"
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
    //
    // test('Version 7 file', async function () {
    //
    //     this.timeout(100000);
    //     const straw = new Straw({
    //         "url": "https://s3.amazonaws.com/igv.org.test/data/hic/intra_nofrag_30.hic"
    //     })
    //     const contactRecords = await straw.getContactRecords(
    //         "NONE",
    //         {chr: "1", start: 0, end: 1000000},
    //         {chr: "1", start: 0, end: 1000000},
    //         "BP",
    //         250000
    //     )
    //
    //     assert.ok (contactRecords.length > 0)
    //
    // })
    //
    // test('norm vectors', async function () {
    //
    //     this.timeout(100000);
    //     const straw = new Straw({
    //         "url": "https://s3.amazonaws.com/igv.org.test/data/hic/intra_nofrag_30.hic"
    //     })
    //     const getNormOptions = async () => {
    //         const normOptions = await straw.getNormalizationOptions();
    //         assert.equal(normOptions.length, 4)
    //     }
    //
    //     getNormOptions()
    //
    // })
    //
    // test('norm vectors - no NVI', async function () {
    //
    //     this.timeout(100000);
    //     const straw = new Straw({
    //         "url": "https://s3.amazonaws.com/igv.org.test/data/hic/intra_nofrag_30.hic"
    //     })
    //     const getNormOptions = async () => {
    //         const normOptions = await straw.getNormalizationOptions();
    //         assert.equal(normOptions.length, 4)
    //     }
    //
    //     getNormOptions()
    //
    // })
    //
    // test('GEO file', async function () {
    //
    //     this.timeout(100000);
    //     const straw = new Straw({
    //         "url": "https://ftp.ncbi.nlm.nih.gov/geo/samples/GSM2583nnn/GSM2583729/suppl/GSM2583729_H3K27ac_HiChIP_2.hic"
    //     })
    //     const contactRecords = await straw.getContactRecords(
    //         "KR",
    //         {chr: "arm_2L", start: 0, end: 1000000},
    //         {chr: "arm_2L", start: 0, end: 1000000},
    //         "BP",
    //         100000
    //     )
    //
    //     assert.ok (contactRecords.length > 0)
    //
    // })

})

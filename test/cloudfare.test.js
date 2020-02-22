import { assert } from 'chai';

import HicFile from '../src/hicFile'
import NodeLocalFile from '../src/io/nodeLocalFile'

suite('Cloudfare', function () {


    test('remote file read header', async function () {

        this.timeout(60000);

        const hicFile = new HicFile({
            "url": "http://adam.3dg.io/suhas_juicebox/libs/GM12878_ultra/GM12878_ultra_42B_1k.hic",
        })

        await hicFile.readHeader()
        assert.equal(hicFile.magic, "HIC")

        await hicFile.readNormExpectedValuesAndNormVectorIndex();
        const nvi = hicFile.config.nvi;
        assert.equal(nvi, "73375209496,20754");
    })

})

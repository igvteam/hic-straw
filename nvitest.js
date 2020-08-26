const fs = require('fs');
import Straw from "./src/straw.js";

//getNVI();

indexStats("/Users/jrobinso/igv-team Dropbox/James Robinson/projects/igv-data/nvi/populate-db/hicfiles.txt")

async function getNVI() {
    //const url = "https://adam.3dg.io/suhas_juicebox/libs/combined_maps/GM12878/GM12878_intact_16B_5.11.20_1bpRes.hic";
    //const url = "https://adam.3dg.io/suhas_juicebox/libs/corrected_combined_maps_v9/GM12878/GM12878_intact_18.7B_8.15.20_30.hic"
    const url = "https://s3.amazonaws.com/igv.org.test/data/hic/intra_nofrag_30.hic"
    const straw = new Straw({url: url});

    try {
        await straw.getMetaData();
        const nvi = await straw.getNVI();
        console.log(nvi);
    } catch (e) {
        console.error(e)
    }
}

async function indexStats(path) {

    const contents = fs.readFileSync(path, 'utf8')
    const lines = contents.split(/\r?\n/)

    for (let line of lines) {
        const tokens = line.split(/(\s+)/)
        if (tokens.length > 0 && tokens[0].length > 0) {
            try {
                const url = tokens[0]
                const straw = new Straw({url});
                straw.printIndexStats();
            } catch (e) {
            }
        }
    }
}


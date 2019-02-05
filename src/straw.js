const HicFile = require("./hicFile")
const ContactRecord = require("./contactRecord")

class Straw {

    constructor(config) {

        this.config = config;
        this.hicFile = new HicFile(config)

    }

    async getMetaData() {
        return await this.hicFile.getMetaData()
    }


    //straw <NONE/VC/VC_SQRT/KR> <ile> <chr1>[:x1:x2] <chr2>[:y1:y2] <BP/FRAG> <binsize>
    async getContactRecords(normalization, region1, region2, units, binsize) {

        try {
            await this.hicFile.init()

            const chr1 = this.getFileChrName(region1.chr)
            const chr2 = this.getFileChrName(region2.chr)
            const x1 = (region1.start === undefined) ? undefined : region1.start / binsize
            const x2 = (region1.end === undefined) ? undefined : region1.end / binsize
            const y1 = (region2.start === undefined) ? undefined : region2.start / binsize
            const y2 = (region2.end === undefined) ? undefined : region2.end / binsize

            const matrix = await this.hicFile.readMatrix(chr1, chr2)

            // Find the requested resolution
            const z = undefined === binsize ? 0 : this.hicFile.getZoomIndexForBinSize(binsize, units);
            if (z === -1) {
                throw new Error("Invalid bin size");
            }

            const zd = matrix.bpZoomData[z]
            const blockBinCount = zd.blockBinCount   // Dimension in bins of a block (width = height = blockBinCount)
            const col1 = x1 === undefined ? 0 : Math.floor(x1 / blockBinCount)
            const col2 = x1 === undefined ? zd.blockColumnCount : Math.floor(x2 / blockBinCount)
            const row1 = y1 === undefined ? 0 : Math.floor(y1 / blockBinCount)
            const row2 = y2 === undefined ? zd.blockColumnCount : Math.floor(y2 / blockBinCount)

            const promises = [];
            const sameChr = chr1 === chr2;
            for (let row = row1; row <= row2; row++) {
                for (let column = col1; column <= col2; column++) {
                    let blockNumber
                    if (sameChr && row < column) {
                        blockNumber = column * zd.blockColumnCount + row;
                    }
                    else {
                        blockNumber = row * zd.blockColumnCount + column;
                    }
                    promises.push(this.hicFile.readBlock(blockNumber, zd))
                }
            }

            const blocks = await Promise.all(promises);

            let normVector1
            let normVector2
            const isNorm = normalization && normalization !== "NONE"
            if (isNorm) {
                normVector1 = await this.hicFile.getNormalizationVector(normalization, chr1, units, binsize)
                if (chr1 === chr2) {
                    normVector2 = normVector1
                } else {
                    normVector2 = await this.hicFile.getNormalizationVector(normalization, chr2, units, binsize)
                }
            }


            const contactRecords = [];
            blocks.forEach(function (block) {
                if (!block) { // This is most likely caused by a base pair range outside the chromosome
                    return;
                }
                block.records.forEach(function (rec) {

                    // TODO -- transpose?
                    if (x1 === undefined || (rec.bin1 >= x1 && rec.bin1 <= x2 && rec.bin2 >= y1 && rec.bin2 <= y2)) {

                        if (isNorm) {
                            const x = rec.bin1
                            const y = rec.bin2
                            const nvnv = normVector1.data[x] * normVector2.data[y];
                            if (nvnv[x] !== 0 && !isNaN(nvnv)) {
                                const counts = rec.counts / nvnv;
                                contactRecords.push(new ContactRecord(x, y, counts));
                            }

                        } else {
                            contactRecords.push(rec);
                        }
                    }
                });
            });

            return contactRecords;
        } catch (error) {
            console.error(error)
        }

    }

    async getNormalizationOptions() {
        // Normalization types are computed as a side effect of loading the index.  A bit
        // ugly but alternatives are worse.
        await this.hicFile.getNormVectorIndex()
        return this.hicFile.normalizationTypes;
    }

    async getNVI() {
        await this.hicFile.getNormVectorIndex()
        return this.hicFile.config.nvi;
    }

    getFileChrName(name) {
        let found = this.hicFile.chromosomes.find(chromosome => chromosome.name === name);
        if (found !== undefined) {
            return found.name;
        }
        let alias = name.replace("chrM", "MT");
        alias = alias.replace("chr", "");
        found = this.hicFile.chromosomes.find(chromosome => chromosome.name.toUpperCase() === alias.toUpperCase());
        return found !== undefined ? found.name : name;
    }
}


module.exports = Straw

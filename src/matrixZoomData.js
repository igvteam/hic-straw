

class MatrixZoomData {

    constructor(chr1, chr2, zoom, blockBinCount, blockColumnCount, chr1Sites, chr2Sites) {

        this.chr1 = chr1;    // chromosome index
        this.chr2 = chr2;
        this.zoom = zoom;
        this.blockBinCount = blockBinCount;
        this.blockColumnCount = blockColumnCount;
        this.chr1Sites = chr1Sites;
        this.chr2Sites = chr2Sites;
    }

    getKey () {
        return this.chr1.name + "_" + this.chr2.name + "_" + this.zoom.unit + "_" + this.zoom.binSize;
    }
}

module.exports = MatrixZoomData
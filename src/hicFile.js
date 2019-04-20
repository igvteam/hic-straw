const zlib = require('zlib')
const fetch = require('cross-fetch')

const BrowserLocalFile = require("./io/browserLocalFile")
const NodeLocalFile = require("./io/nodeLocalFile")
const RemoteFile = require("./io/remoteFile")
const ThrottledFile = require("./io/throttledFile")
const RateLimiter = require("./io/rateLimiter")
const BufferedFile = require("./io/bufferedFile")
const BinaryParser = require("./binary")
const Matrix = require("./matrix")
const MatrixZoomData = require("./matrixZoomData")
const NormalizationVector = require("./normalizationVector")
const ContactRecord = require("./contactRecord")

const Short_MIN_VALUE = -32768;

const googleRateLimiter = new RateLimiter(100)

class Block {
    constructor(blockNumber, zoomData, records, idx) {
        this.blockNumber = blockNumber;
        this.zoomData = zoomData;
        this.records = records;
        this.idx = idx
    }
}

class HicFile {

    constructor(args) {

        this.config = args

        this.loadFragData = args.loadFragData

        this.fragmentSitesCache = {}
        this.normVectorCache = {}
        this.normalizationTypes = ['NONE'];

        // args may specify an io.File objec, a local path (Node only), or a url
        if (args.file) {
            this.file = args.file
        } else if (args.blob) {
            this.file = new BrowserLocalFile(args.blob)
        }  else {
            this.path = args.path || args.url

            if (this.path.startsWith("http://") || this.path.startsWith("https://")) {
                this.remote = true

                // Google drive must be rate limited.  Perhaps all
                const remoteFile = new RemoteFile(args)
                if(isGoogle(this.path)) {
                    this.file = new ThrottledFile(remoteFile, googleRateLimiter)
                } else {
                    this.file = remoteFile
                }

            } else {
                this.file = new NodeLocalFile(args)
            }
        }
    };

    async init() {

        if (this.initialized) {
            return;
        } else {
            await this.readHeader()
            await this.readFooter()
            this.initialized = true
        }
    }

    async getMetaData() {
        await this.init()
        return this.meta
    }

    async readHeader() {

        const data = await this.file.read(0, 64000)

        if (!data) {
            return undefined;
        }

        const binaryParser = new BinaryParser(new DataView(data));

        this.magic = binaryParser.getString();
        this.version = binaryParser.getInt();
        this.masterIndexPos = binaryParser.getLong();
        this.genomeId = binaryParser.getString();

        this.attributes = {};
        let nAttributes = binaryParser.getInt();
        while (nAttributes-- > 0) {
            this.attributes[binaryParser.getString()] = binaryParser.getString();
        }

        this.chromosomes = [];
        this.chromosomeIndexMap = {}
        let nChrs = binaryParser.getInt();
        let i = 0
        while (nChrs-- > 0) {
            const chr = {
                index: i,
                name: binaryParser.getString(),
                size: binaryParser.getInt()
            };
            if (chr.name.toLowerCase() === "all") {
                this.wholeGenomeChromosome = chr;
                this.wholeGenomeResolution = Math.round(chr.size * (1000 / 500));    // Hardcoded in juicer
            }
            this.chromosomes.push(chr);
            this.chromosomeIndexMap[chr.name] = chr.index
            i++;
        }

        this.bpResolutions = [];
        let nBpResolutions = binaryParser.getInt();
        while (nBpResolutions-- > 0) {
            this.bpResolutions.push(binaryParser.getInt());
        }

        if (this.loadFragData) {
            this.fragResolutions = [];
            let nFragResolutions = binaryParser.getInt();
            while (nFragResolutions-- > 0) {
                this.fragResolutions.push(binaryParser.getInt());
            }

            if (nFragResolutions > 0) {
                this.sites = [];
                let nSites = binaryParser.getInt();
                while (nSites-- > 0) {
                    this.sites.push(binaryParser.getInt());
                }
            }
        }

        // Build lookup table for well-known chr aliases
        this.chrAliasTable = {}
        for (let chrName of Object.keys(this.chromosomeIndexMap)) {

            if (chrName.startsWith("chr")) {
                this.chrAliasTable[chrName.substr(3)] = chrName
            } else if (chrName === "MT") {
                this.chrAliasTable["chrM"] = chrName
            } else {
                this.chrAliasTable["chr" + chrName] = chrName
            }
        }


        // Meta data for the API
        this.meta = {
            "version": this.version,
            "genome": this.genomeId,
            "chromosomes": this.chromosomes,
            "resolutions": this.bpResolutions,
        }


    }

    async readFooter() {


        let data = await this.file.read(this.masterIndexPos, 8)
        if (!data) {
            return null;
        }

        let binaryParser = new BinaryParser(new DataView(data))
        const nBytes = binaryParser.getInt()   // Total size, master index + expected values
        let nEntries = binaryParser.getInt()

        // Estimate the size of the master index. String length of key is unknown, be conservative (100 bytes)
        const miSize = nEntries * (100 + 64 + 32)
        let range = {start: this.masterIndexPos + 8, size: Math.min(miSize, nBytes - 4)}
        data = await this.file.read(this.masterIndexPos + 8, Math.min(miSize, nBytes - 4))
        binaryParser = new BinaryParser(new DataView(data));

        this.masterIndex = {}
        while (nEntries-- > 0) {
            const key = binaryParser.getString()
            const pos = binaryParser.getLong()
            const size = binaryParser.getInt()
            this.masterIndex[key] = {start: pos, size: size}
        }

        this.expectedValueVectors = {}

        nEntries = binaryParser.getInt()

        // Expected values
        // while (nEntries-- > 0) {
        //     type = "NONE";
        //     unit = binaryParser.getString();
        //     binSize = binaryParser.getInt();
        //     nValues = binaryParser.getInt();
        //     values = [];
        //     while (nValues-- > 0) {
        //         values.push(binaryParser.getDouble());
        //     }
        //
        //     nChrScaleFactors = binaryParser.getInt();
        //     normFactors = {};
        //     while (nChrScaleFactors-- > 0) {
        //         normFactors[binaryParser.getInt()] = binaryParser.getDouble();
        //     }
        //
        //     // key = unit + "_" + binSize + "_" + type;
        //     //  NOT USED YET SO DON'T STORE
        //     //  dataset.expectedValueVectors[key] =
        //     //      new ExpectedValueFunction(type, unit, binSize, values, normFactors);
        // }

        this.normExpectedValueVectorsPosition = this.masterIndexPos + 4 + nBytes;

        return this;
    };

    async readMatrix(chrIdx1, chrIdx2) {

        await this.init()

        if (chrIdx1 > chrIdx2) {
            const tmp = chrIdx1
            chrIdx1 = chrIdx2
            chrIdx2 = tmp
        }

        const key = "" + chrIdx1 + "_" + chrIdx2

        const idx = this.masterIndex[key]
        if (!idx) {
            return undefined
        }

        const data = await this.file.read(idx.start, idx.size)
        if (!data) {
            return undefined
        }

        const dis = new BinaryParser(new DataView(data));
        const c1 = dis.getInt();     // Should equal chrIdx1
        const c2 = dis.getInt();     // Should equal chrIdx2

        // TODO validate this
        const chr1 = this.chromosomes[c1];
        const chr2 = this.chromosomes[c2];

        // # of resolution levels (bp and frags)
        let nResolutions = dis.getInt();
        const zdList = [];

        const sites1 = await this.getSites.call(this, chr1.name)
        const sites2 = await this.getSites.call(this, chr2.name)

        let bytesAvailable = dis.available()
        let z = 0
        let filePosition = idx.start
        while (nResolutions-- > 0) {

            const zd = parseMatixZoomData(chr1, chr2, sites1, sites2, dis);
            const bytesUsed = bytesAvailable - dis.available()
            zd.idx = {
                start: filePosition,
                size: bytesUsed
            }
            bytesAvailable = dis.available()
            zdList.push(zd);
            //console.log(`zd${z++}: ${bytesUsed}`)
        }
        return new Matrix(chrIdx1, chrIdx2, zdList);

    }

    /***
     * Return the raw data for the block.  Function provided for testing and development
     * @param blockNumber
     * @param zd
     * @returns {Promise<void>}
     */
    async readBlockData(blockNumber, zd) {

        var self = this,
            idx = null,
            i, j;

        var blockIndex = zd.blockIndexMap;
        if (blockIndex) {
            var idx = blockIndex[blockNumber];
        }
        if (!idx) {
            return undefined
        }
        else {

            return this.file.read(idx.filePosition, idx.size)
        }
    }

    async readBlock(blockNumber, zd) {

        var self = this,
            idx = null,
            i, j;

        var blockIndex = zd.blockIndexMap;
        if (blockIndex) {
            var idx = blockIndex[blockNumber];
        }
        if (!idx) {
            return undefined
        }
        else {

            let data = await this.file.read(idx.filePosition, idx.size)

            if (!data) {
                return undefined;
            }

            //var inflate = new Zlib.Inflate(new Uint8Array(data));
            var plain = zlib.inflateSync(Buffer.from(data))   //.decompress();
            data = plain.buffer;


            var parser = new BinaryParser(new DataView(data));
            var nRecords = parser.getInt();
            var records = [];

            if (self.version < 7) {
                for (i = 0; i < nRecords; i++) {
                    var binX = parser.getInt();
                    var binY = parser.getInt();
                    var counts = parser.getFloat();
                    records.push(new ContactRecord(binX, binY, counts));
                }
            } else {

                var binXOffset = parser.getInt();
                var binYOffset = parser.getInt();

                var useShort = parser.getByte() == 0;
                var type = parser.getByte();

                if (type === 1) {
                    // List-of-rows representation
                    var rowCount = parser.getShort();

                    for (i = 0; i < rowCount; i++) {

                        binY = binYOffset + parser.getShort();
                        var colCount = parser.getShort();

                        for (j = 0; j < colCount; j++) {

                            binX = binXOffset + parser.getShort();
                            counts = useShort ? parser.getShort() : parser.getFloat();
                            records.push(new ContactRecord(binX, binY, counts));
                        }
                    }
                } else if (type == 2) {

                    var nPts = parser.getInt();
                    var w = parser.getShort();

                    for (i = 0; i < nPts; i++) {
                        //int idx = (p.y - binOffset2) * w + (p.x - binOffset1);
                        var row = Math.floor(i / w);
                        var col = i - row * w;
                        var bin1 = binXOffset + col;
                        var bin2 = binYOffset + row;

                        if (useShort) {
                            counts = parser.getShort();
                            if (counts != Short_MIN_VALUE) {
                                records.push(new ContactRecord(bin1, bin2, counts));
                            }
                        } else {
                            counts = parser.getFloat();
                            if (!isNaN(counts)) {
                                records.push(new ContactRecord(bin1, bin2, counts));
                            }
                        }

                    }

                } else {
                    throw new Error("Unknown block type: " + type);
                }

            }

            return new Block(blockNumber, zd, records, idx);


        }
    };

    async getSites(chrName) {

        return undefined

        // var self = this;
        // var sites, entry;
        //
        // sites = self.fragmentSitesCache[chrName];
        //
        // if (sites) {
        //     return Promise.resolve(sites);
        //
        // } else if (self.fragmentSitesIndex) {
        //
        //     entry = self.fragmentSitesIndex[chrName];
        //
        //     if (entry !== undefined && entry.nSites > 0) {
        //
        //         return readSites(entry.position, entry.nSites)
        //             .then(function (sites) {
        //                 self.fragmentSitesCache[chrName] = sites;
        //                 return sites;
        //
        //             })
        //     }
        // }
        // else {
        //     return Promise.resolve(undefined);
        // }

    }

    async getNormalizationVector(type, chr, unit, binSize) {

        await this.init()

        let chrIdx
        if (Number.isInteger(chr)) {
            chrIdx = chr
        } else {
            const canonicalName = this.getFileChrName(chr)
            chrIdx = this.chromosomeIndexMap[canonicalName]
        }


        const key = getNormalizationVectorKey(type, chrIdx, unit.toString(), binSize);

        if (this.normVectorCache.hasOwnProperty(key)) {
            return Promise.resolve(this.normVectorCache[key]);
        }

        const normVectorIndex = await this.getNormVectorIndex()

        if (!normVectorIndex) {
            console.log("Normalization vectors not present in this file")
            return undefined
        }

        const idx = normVectorIndex[key];
        if (!idx) {
            // TODO -- alert in browsers
            console.log("Normalization option " + type + " not available at this resolution");
            return undefined;
        }

        const data = await this.file.read(idx.filePosition, idx.size)

        if (!data) {
            return undefined;
        }

        const parser = new BinaryParser(new DataView(data));
        const nValues = parser.getInt();
        const values = [];
        let allNaN = true;
        for (let i = 0; i < nValues; i++) {
            values[i] = parser.getDouble();
            if (!isNaN(values[i])) {
                allNaN = false;
            }
        }
        if (allNaN) {
            return undefined;
        } else {
            return new NormalizationVector(type, chrIdx, unit, binSize, values);
        }

    }

    async getNormVectorIndex() {

        if (!this.normVectorIndex) {

            // If nvi is not supplied, try reading from remote lambda service
            if (!this.config.nvi && this.remote && this.path) {
                const url = new URL(this.path)
                const key = encodeURIComponent(url.hostname + url.pathname)
                const nviResponse = await fetch('https://t5dvc6kn3f.execute-api.us-east-1.amazonaws.com/dev/nvi/' + key)
                if (nviResponse.status === 200) {
                    const nvi = await nviResponse.text()
                    if (nvi) {
                        this.config.nvi = nvi
                    }
                }
            }

            if (this.config.nvi) {
                const nviArray = decodeURIComponent(this.config.nvi).split(",")
                const range = {start: parseInt(nviArray[0]), size: parseInt(nviArray[1])};
                return this.readNormVectorIndex(range)
            }
            else {
                try {
                    await this.readNormExpectedValuesAndNormVectorIndex()
                    return this.normVectorIndex
                } catch (e) {
                    if (e.code === "416" || e.code === 416) {
                        // This is expected if file does not contain norm vectors
                        this.normExpectedValueVectorsPosition = undefined
                    } else {
                        console.error(e)
                    }
                }
            }
        }

        return this.normVectorIndex
    }

    async getNormalizationOptions() {
        // Normalization options are computed as a side effect of loading the index.  A bit
        // ugly but alternatives are worse.
        await this.getNormVectorIndex()
        return this.normalizationTypes;
    }

    /**
     * Return a promise to load the normalization vector index
     *
     * @param dataset
     * @param range  -- file range {position, size}
     * @returns Promise for the normalization vector index
     */
    async readNormVectorIndex(range) {

        await this.init()

        this.normalizationVectorIndexRange = range;

        const data = await this.file.read(range.start, range.size)

        const binaryParser = new BinaryParser(new DataView(data));

        this.normVectorIndex = {};

        let nEntries = binaryParser.getInt();
        while (nEntries-- > 0) {
            this.parseNormVectorEntry(binaryParser)
        }

        return this.normVectorIndex;

    }

    /**
     * This function is used when the position of the norm vector index is unknown.  We must read through the expected
     * values to find the index
     *
     * @param dataset
     * @returns {Promise}
     */
    async readNormExpectedValuesAndNormVectorIndex() {

        await this.init()

        if (this.normExpectedValueVectorsPosition === undefined) {
            return;
        }

        const nviStart = await this.skipExpectedValues(this.normExpectedValueVectorsPosition)
        let byteCount = 4;

        let data = await this.file.read(nviStart, 4)
        const binaryParser = new BinaryParser(new DataView(data));
        const nEntries = binaryParser.getInt();
        const sizeEstimate = nEntries * 30;
        const range = {start: nviStart + byteCount, size: sizeEstimate}

        data = await this.file.read(range.start, range.size)
        this.normalizedExpectedValueVectors = {};
        this.normVectorIndex = {};

        // Recursively process entries
        await processEntries.call(this, nEntries, data)

        this.config.nvi = nviStart.toString() + "," + byteCount

        async function processEntries(nEntries, data) {

            const binaryParser = new BinaryParser(new DataView(data));

            while (nEntries-- > 0) {

                if (binaryParser.available() < 100) {

                    nEntries++;   // Reset counter as entry is not processed

                    byteCount += binaryParser.position;
                    const sizeEstimate = Math.max(1000, nEntries * 30);
                    const range = {start: nviStart + byteCount, size: sizeEstimate}
                    const data = await this.file.read(range.start, range.size)
                    return processEntries.call(this, nEntries, data);
                }

                this.parseNormVectorEntry(binaryParser)

            }
            byteCount += binaryParser.position;
        }
    }

    /**
     * This function is used when the position of the norm vector index is unknown.  We must read through the expected
     * values to find the index
     *
     * @param dataset
     * @returns {Promise}
     */
    async skipExpectedValues(start) {

        const file = new BufferedFile({file: this.file, size: 256000})
        const range = {start: start, size: 4};
        const data = await file.read(range.start, range.size)
        const binaryParser = new BinaryParser(new DataView(data));
        const nEntries = binaryParser.getInt();   // Total # of expected value chunks
        if (nEntries === 0) {
            return range.start + range.size;
        }
        else {
            return parseNext(start + 4, nEntries);
        }     // Skip 4 bytes for int


        async function parseNext(start, nEntries) {

            let range = {start: start, size: 500}
            let chunkSize = 0
            let p0 = start;

            let data = await file.read(range.start, range.size)
            let binaryParser = new BinaryParser(new DataView(data));
            binaryParser.getString(); // type
            binaryParser.getString(); // unit
            binaryParser.getInt(); // binSize
            const nValues = binaryParser.getInt();
            chunkSize += binaryParser.position + nValues * 8;

            range = {start: start + chunkSize, size: 4};
            data = await file.read(range.start, range.size)
            binaryParser = new BinaryParser(new DataView(data));
            const nChrScaleFactors = binaryParser.getInt();
            chunkSize += (4 + nChrScaleFactors * (4 + 8));

            nEntries--;
            if (nEntries === 0) {
                return Promise.resolve(p0 + chunkSize);
            }
            else {
                return parseNext(p0 + chunkSize, nEntries);
            }
        }
    }

    getZoomIndexForBinSize(binSize, unit) {

        unit = unit || "BP";

        let resolutionArray
        if (unit === "BP") {
            resolutionArray = this.bpResolutions;
        }
        else if (unit === "FRAG") {
            resolutionArray = this.fragResolutions;
        } else {
            throw new Error("Invalid unit: " + unit);
        }

        for (let i = 0; i < resolutionArray.length; i++) {
            if (resolutionArray[i] === binSize) return i;
        }

        return -1;
    }

    parseNormVectorEntry(binaryParser) {
        const type = binaryParser.getString();      //15
        const chrIdx = binaryParser.getInt();       //4
        const unit = binaryParser.getString();      //3
        const binSize = binaryParser.getInt();      //4
        const filePosition = binaryParser.getLong();  //8
        const sizeInBytes = binaryParser.getInt();     //4
        const key = type + "_" + chrIdx + "_" + unit + "_" + binSize;
        // TODO -- why does this not work?  NormalizationVector.getNormalizationVectorKey(type, chrIdx, unit, binSize);

        if (!this.normalizationTypes.includes(type)) {
            this.normalizationTypes.push(type);
        }
        this.normVectorIndex[key] = {filePosition: filePosition, size: sizeInBytes};
    }

    getFileChrName(chrAlias) {
        if (this.chrAliasTable.hasOwnProperty(chrAlias)) {
            return this.chrAliasTable[chrAlias]
        }
        else {
            return chrAlias
        }
    }
}


function parseMatixZoomData(chr1, chr2, chr1Sites, chr2Sites, dis) {

    var unit, sumCounts, occupiedCellCount, stdDev, percent95, binSize, zoom, blockBinCount,
        blockColumnCount, zd, nBlocks, blockIndex, nBins1, nBins2, avgCount, blockNumber,
        filePosition, blockSizeInBytes;

    unit = dis.getString();

    dis.getInt();                // Old "zoom" index -- not used, must be read

    // Stats.  Not used yet, but we need to read them anyway
    sumCounts = dis.getFloat();
    occupiedCellCount = dis.getFloat();
    stdDev = dis.getFloat();
    percent95 = dis.getFloat();

    binSize = dis.getInt();
    zoom = {unit: unit, binSize: binSize};

    blockBinCount = dis.getInt();
    blockColumnCount = dis.getInt();

    zd = new MatrixZoomData(chr1, chr2, zoom, blockBinCount, blockColumnCount, chr1Sites, chr2Sites);

    nBlocks = dis.getInt();
    blockIndex = {};

    while (nBlocks-- > 0) {
        blockNumber = dis.getInt();
        filePosition = dis.getLong();
        blockSizeInBytes = dis.getInt();
        blockIndex[blockNumber] = {filePosition: filePosition, size: blockSizeInBytes};
    }
    zd.blockIndexMap = blockIndex;

    nBins1 = (chr1.size / binSize);
    nBins2 = (chr2.size / binSize);
    avgCount = (sumCounts / nBins1) / nBins2;   // <= trying to avoid overflows

    zd.averageCount = avgCount;
    zd.sumCounts = sumCounts;
    zd.stdDev = stdDev;
    zd.occupiedCellCount = occupiedCellCount;
    zd.percent95 = percent95;

    return zd;
}

function getNormalizationVectorKey(type, chrIdx, unit, resolution) {
    return type + "_" + chrIdx + "_" + unit + "_" + resolution;
}

function isGoogle(url) {
    return url.indexOf("drive.google.com") >= 0 || url.indexOf("www.googleapis.com") > 0
}


module.exports = HicFile
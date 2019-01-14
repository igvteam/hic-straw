
class Matrix {
  
    constructor(chr1, chr2, zoomDataList) {

        const self = this

        this.chr1 = chr1
        this.chr2 = chr2
        this.bpZoomData = []
        this.fragZoomData = []
        
        zoomDataList.forEach(function (zd) {
            if (zd.zoom.unit === "BP") {
                self.bpZoomData.push(zd)
            } else {
                self.fragZoomData.push(zd)
            }
        })
    }

    getZoomDataByIndex(index, unit) {
        const zdArray = "FRAG" === unit ? this.fragZoomData : this.bpZoomData
        return zdArray[index]
    }


    findZoomForResolution(binSize, unit) {

        const  zdArray = "FRAG" === unit ? this.fragZoomData : this.bpZoomData

        for (let i = 1; i < zdArray.length; i++) {
            var zd = zdArray[i]
            if (zd.zoom.binSize < binSize) {
                return i - 1
            }
        }
        return zdArray.length - 1

    }


    // Legacy implementation, used only in tests.
    getZoomData(zoom) {

        const zdArray = zoom.unit === "BP" ? this.bpZoomData : this.fragZoomData

        for (let i = 0; i < zdArray.length; i++) {
            var zd = zdArray[i]
            if (zoom.binSize === zd.zoom.binSize) {
                return zd
            }
        }

        return undefined
    }
}

module.exports = Matrix
import HicStraw from '../dist/hic-straw_es6.js'


document.addEventListener("DOMContentLoaded", function () {

    const table = document.getElementById("resultsTable")

    const straw = new HicStraw({
        "path": "https://s3.amazonaws.com/igv.broadinstitute.org/data/hic/intra_nofrag_30.hic"
    })

    straw.getContactRecords(
        "KR",
        {chr: "8",start: 50000000, end: 60000000},
        {chr: "8",start: 50000000, end: 60000000},
        "BP",
        1000000
    )
        .then(function (contactRecords) {
            for(let record of contactRecords) {
                var newRow = table.insertRow(-1)
                newRow.insertCell(0).appendChild(document.createTextNode(record.bin1.toString()))
                newRow.insertCell(1).appendChild(document.createTextNode(record.bin2.toString()))
                newRow.insertCell(2).appendChild(document.createTextNode(record.counts.toString()))
            }

        })

})

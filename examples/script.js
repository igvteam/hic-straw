#!/usr/bin/env node

const Straw = require("../src/straw")


const straw = new Straw({path: "../test/data/hic/HCT-116_Cohesin_Loss.hic"})

straw.getContactRecords(
    "KR",
    {chr: "8", start: 50000000, end: 60000000},
    {chr: "8", start: 50000000, end: 60000000},
    "BP",
    1000000
)
    .then(function (contactRecords) {
        for (let record of contactRecords) {
            console.log(record)
        }
    })
    .catch(function (error) {
        console.log(error)
    })



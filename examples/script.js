#!/usr/bin/env node

const Straw = require("../src/straw")


const straw = new Straw({path: "../test/data/test_chr22.hic"})

straw.getContactRecords(
    "KR",
    {chr: "22", start: 50000000, end: 100000000},
    {chr: "22", start: 50000000, end: 100000000},
    "BP",
    100000
)
    .then(function (contactRecords) {
        for (let record of contactRecords) {
            console.log(record)
        }
    })
    .catch(function (error) {
        console.log(error)
    })



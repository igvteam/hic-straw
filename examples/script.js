#!/usr/bin/env node

const Straw = require("../src/straw")
const NodeLocalFile = require("../src/io/nodeLocalFile")

const file = new NodeLocalFile({path: "../test/data/test_chr22.hic"})
const straw = new Straw({file: file})

// Get  metadata
straw.getMetaData()
    .then(function (metaData) {
        console.log(JSON.stringify(metaData, null, 2))
    })


// Get the normalization options as an array
straw.getNormalizationOptions()
    .then(function (normOptions) {
        console.log(normOptions)
    })

// Get the contact records over a region
straw.getContactRecords(
    "KR",
    {chr: "22", start: 40000000, end: 50000000},
    {chr: "22", start: 40000000, end: 50000000},
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


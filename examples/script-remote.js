#!/usr/bin/env node


// Straw expects a global "fetch" object.  Patch for Node
global.fetch = require("node-fetch")


const Straw = require("../dist/hic-straw.js");

// Local file  -- must use CJS NodeLocalFile explicitly
const url = "https://s3.amazonaws.com/igv.broadinstitute.org/data/hic/intra_nofrag_30.hic"
const straw = new Straw({url: url})

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




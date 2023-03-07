#!/usr/bin/env node
// usage node -r esm script-es6.js
// see https://www.npmjs.com/package/esm

import Straw from "../dist/hic-straw_es6.js";
import NodeLocalFile from "../src/io/nodeLocalFile.mjs"


const path = "../test/data/test_chr22.hic";
const nodeLocalFile = new NodeLocalFile({path})
const straw = new Straw({file: nodeLocalFile});

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


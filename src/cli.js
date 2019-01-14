#!/usr/bin/env node

const Straw = require("./straw")

const [, , ...args] = process.argv

const usageString = "Usage: $straw normalization hicfile region1 region2 units resolution"

const a = prepArgs(args)

if (a.options.has("--meta") && a.options.size == 1 && a.positional.length === 1) {

    printMetaData(a.positional[0])

} else if (a.positional.length >= 6 && !a.options.has("--meta")) {

    printContacts(a.positional)

} else {
    console.log(usageString)
    process.exit(1)
}

function prepArgs(args) {
    const a = {
        options: new Set(),
        positional: []
    }
    for (arg of args) {
        if (arg.startsWith("-")) {
            a.options.add(arg)
        } else {
            a.positional.push(arg)
        }
    }
    return a
}

async function printMetaData(filepath) {
    const straw = new Straw({path: filepath})
    const meta = await straw.getMetaData()
    console.log(JSON.stringify(meta, null, 2))
}

async function printContacts(args) {

    const normalization = args[0]
    const filepath = args[1]
    const region1 = args[2]
    const region2 = args[3]
    const units = args[4]
    const resolution = parseInt(args[5])
    const contactRecords = await fetchContacts(normalization, filepath, region1, region2, units, resolution)

    for (record of contactRecords) {
        console.log(record.bin1.toString() + "\t" + record.bin2.toString() + "\t" + record.counts.toString())
    }
}

async function fetchContacts(normalization, filepath, region1, region2, units, resolution) {

    const r1 = parseRegion(region1)
    const r2 = parseRegion(region2)
    const straw = new Straw({path: filepath})
    return straw.getContactRecords(normalization, r1, r2, units, resolution)

}

function parseRegion(region) {

    const t1 = region.split(":")

    const chr = t1[0]
    let start
    let end
    if (t1.length === 0) {
        start = 0
        end = Number.MAX_VALUE
    } else if(t1.length === 2) {
        const t2 = t1[1].split("-")
        if(t2.length == 2) {
            start = parseInt(t2[0])
            end = parseInt(t2[1])
        } else {
            console.error("Unrecognized region: " + region)
            process.exit(1)
        }
    } else if (t1.length === 3) {
        // todo validate
        start = parseInt(t1[1])
        end = parseInt(t1[2])
    } else {
        console.error("Unrecognized region: " + region)
        process.exit(1)
    }
    return {
        chr: chr,
        start: start,
        end: end
    }
}

// args:  region1, region2, resolution, normalization, units


// "KR",
//     {chr: "8",start: 50000000, end: 100000000},
//     {chr: "8",start: 50000000, end: 100000000},
//     "BP",
//     100000
// )
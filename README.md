# hic-straw

[![Build Status](https://travis-ci.org/igvteam/hic-straw.svg?branch=master)](https://travis-ci.org/igvteam/hic-straw)

Command line and web utilities for reading .hic contact matrix files

## Installation

Requires Node (https://nodejs.org)

```
npm install hic-straw
```


## Examples

### Command line

* Extract cells between 40MB and 50MB on chromosome 22 at 100KB resolution with KR (balanced) normalization and print to stdout

```bash

straw KR test/data/test_chr22.hic 22:40,000,000-50,000,000 22:40,000,000-50,000,000 BP 100,000

```

### In a script 

See examples/script.js

```js
const Straw = require("../src/straw")

const straw = new Straw({path: "../test/data/test_chr22.hic"})

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

```

### In a web page

See examples/straw.html

```html

<script src="../dist/hic-straw.js"></script>

...

 const straw = new HicStraw({
            "path": "https://s3.amazonaws.com/igv.broadinstitute.org/data/hic/intra_nofrag_30.hic",
            "nvi": "863389571,18679"
        })

        straw.getContactRecords(
            "KR",
            {chr: "8",start: 50000000, end: 60000000},
            {chr: "8",start: 50000000, end: 60000000},
            "BP",
            1000000
        )
            .then(function (contactRecords) {...})

```
      
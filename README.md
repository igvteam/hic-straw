# hic-straw

Command line and web utilities for reading .hic contact matrix files

## Installation

npm install hic-straw

## Examples

### Command line

* Extract cells between 50MB and 60MB on chromosome 8 at 1MB resolution with KR (balanced) normalization and print to stdout

```bash

straw KR test/data/hic/HCT-116_Cohesin_Loss.hic 8:50000000-60000000 8:50000000-60000000 BP 1000000

```

### In a script 

See examples/script.js

```js
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

```

# In a web page

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
      
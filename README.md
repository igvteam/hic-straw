# hic-straw

[![Build Status](https://travis-ci.com/igvteam/hic-straw.svg?branch=master)](https://travis-ci.com/igvteam/hic-straw)

Command line and web utilities for reading .hic contact matrix files

## Installation

Requires Node (https://nodejs.org)

```
npm install hic-straw
```

## API

#### getContactRecords

Return a collection of binned contact counts.

Arguments
* normalization - string indicating normalization scheme
* region 1  {chr, start, end} - genomic region in base pair or fragment units.  Interval convention is zero based 1/2 open
* region 2  {chr, start, end}
* units -- "BP" for base pairs.  Currently this is the only unit supported
* binSize -- size of each bin in base pair or fragment units.  Bins are square


## Examples


### In a web page

Script tag - see examples/straw.html

```html

<script src="../dist/hic-straw.js"></script>

...

 const straw = new HicStraw({
            url: "https://s3.amazonaws.com/igv.broadinstitute.org/data/hic/intra_nofrag_30.hic"
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
      

ES6 module - see examples/straw-es6.html

```js


    import HicStraw from '../dist/hic-straw_es6.js'

    const straw = new HicStraw({
        url: "https://s3.amazonaws.com/igv.broadinstitute.org/data/hic/intra_nofrag_30.hic"
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

`

### In a node script

See ```examples/script-es6.js``` and ```examples/script-cjs.js```. 

** Usage (run from the examples directory)

* ```node -r esm examples/script-es6.js```

* ```node examples/script.js```

      
### Command line

Note: "straw" is installed in node_modules/.bin/straw.  This should be added to the path automatically upon installing
hic-straw, however if you get the error ```straw: command not found``` try running straw explicitly as

```node_modules/.bin/straw...```

#### Extract file metadata (genome identifier, sequences,  resolutions)

```bash
straw --meta test/data/test_chr22.hic 
```

#### Extract normalization options.

```
straw --norms test/data/test_chr22.hic 

```  

#### Extract contact records from a local hic file


```bash

straw KR test/data/test_chr22.hic 22:40,000,000-50,000,000 22:40,000,000-50,000,000 BP 100,000

```
#### Extract contact records from a remote hic file

```bash
straw KR https://s3.amazonaws.com/igv.broadinstitute.org/data/hic/intra_nofrag_30.hic 8:48,700,000-48,900,000 8:48700000-48900000 BP 10,000
``

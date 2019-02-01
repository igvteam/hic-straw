const fetch = require('cross-fetch')


class NodeRemoteFile {

    constructor(url) {
        this.url = url
    }


    async read(position, length) {

        const rangeString = "bytes=" + position + "-" + (position + length - 1)
        const headers = {
            'Range': rangeString,
            'User-Agent': 'straw'
        }
        const response = await fetch(this.url, {
            method: 'GET',
            headers: headers,
            redirect: 'follow',
            mode: 'cors',

        })

        const status = response.status;

        if (status >= 400) {
            const err = Error(response.statusText)
            err.code = status
            throw err
        }
        else {
            return await response.arrayBuffer();
        }
    }


}

module.exports = NodeRemoteFile
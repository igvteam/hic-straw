const fetch = require('cross-fetch')


class NodeRemoteFile {

    constructor(url) {
        this.url = url
    }


    async read(position, length) {

        const rangeString =  "bytes=" + position + "-" + (position + length - 1)
        const headers = {'Range': rangeString}
        const response = await fetch(this.url, {
            method: 'GET',
            headers: headers,
            redirect: 'follow',
            mode: 'cors',
        })

        const status = response.status;
        // TODO -- check status for error codes

        return await response.arrayBuffer();

    }


}

module.exports = NodeRemoteFile
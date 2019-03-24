const fetch = require('cross-fetch')
const jsEnv = require('browser-or-node')

class RemoteFile {

    constructor(args) {
        this.config = args
        this.url = mapUrl(args.path || args.url)
    }


    async read(position, length) {

        const headers = this.config.headers || {}

        const rangeString = "bytes=" + position + "-" + (position + length - 1)
        headers['Range'] = rangeString

        if(jsEnv.isNode) {
            headers['User-Agent'] = 'straw'
        } else {
            if(this.config.oauthToken) {
                const token = resolveToken(this.config.oauthToken)
                headers['Authorization'] = `Bearer ${token}`
            }
            const isSafari = navigator.vendor.indexOf("Apple") == 0 && /\sSafari\//.test(navigator.userAgent);

            const isChrome = navigator.userAgent.indexOf('Chrome') > -1
            const isAmazonV4Signed = this.url.indexOf("X-Amz-Signature") > -1
            if (isChrome && !isAmazonV4Signed) {
                // Hack to prevent caching for byte-ranges. Attempt to fix net:err-cache errors in Chrome
                this.url += this.url.includes("?") ? "&" : "?";
                this.url += "someRandomSeed=" + Math.random().toString(36);
            }
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

        /**
         * token can be a string, a function that returns a string, or a function that returns a Promise for a string
         * @param token
         * @returns {Promise<*>}
         */
        async function resolveToken(token) {
            if(typeof token === 'function') {
                return await Promise.resolve(token())    // Normalize the result to a promise, since we don't know what the function returns
            } else {
                return token
            }
        }

    }
}


function mapUrl(url) {

    if (url.includes("//www.dropbox.com")) {
        return url.replace("//www.dropbox.com", "//dl.dropboxusercontent.com");
    }
    else if (url.includes("//drive.google.com")) {
        return driveDownloadURL(url);
    } else {
        return url
    }
}

function driveDownloadURL(link) {
    var i1, i2, id;
    // Return a google drive download url for the sharable link
    //https://drive.google.com/open?id=0B-lleX9c2pZFbDJ4VVRxakJzVGM
    //https://drive.google.com/file/d/1_FC4kCeO8E3V4dJ1yIW7A0sn1yURKIX-/view?usp=sharing

    var id = getGoogleDriveFileID(link);

    return id ? "https://www.googleapis.com/drive/v3/files/" + id + "?alt=media&supportsTeamDrives=true" : link;
}

function getGoogleDriveFileID(link) {

    //https://drive.google.com/file/d/1_FC4kCeO8E3V4dJ1yIW7A0sn1yURKIX-/view?usp=sharing
    var i1, i2;

    if (link.includes("/open?id=")) {
        i1 = link.indexOf("/open?id=") + 9;
        i2 = link.indexOf("&");
        if (i1 > 0 && i2 > i1) {
            return link.substring(i1, i2)
        }
        else if (i1 > 0) {
            return link.substring(i1);
        }

    }
    else if (link.includes("/file/d/")) {
        i1 = link.indexOf("/file/d/") + 8;
        i2 = link.lastIndexOf("/");
        return link.substring(i1, i2);
    }
}


module.exports = RemoteFile
import node_fetch from 'node-fetch'

const isNode =
    typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null;


if (isNode) {
    global.fetch = node_fetch
}
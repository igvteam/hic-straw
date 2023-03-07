import NodeLocalFile from "./io/nodeLocalFile.js"
import Straw from './straw.js';

import node_fetch from "node-fetch"
global.fetch = node_fetch

export default Straw;
export {NodeLocalFile}
import {UVUnwrapper} from "../src/unwrapperNodeWorker";
import {BufferAttribute, SphereGeometry} from "three";
import * as url from "url";
import * as path from "path";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function start(){
    const unwrapper = new UVUnwrapper({BufferAttribute: BufferAttribute});

    // Default options
    unwrapper.chartOptions = {
        fixWinding: false,
        maxBoundaryLength: 0,
        maxChartArea: 0,
        maxCost: 2,
        maxIterations: 1,
        normalDeviationWeight: 2,
        normalSeamWeight: 4,
        roundnessWeight: 0.009999999776482582,
        straightnessWeight: 6,
        textureSeamWeight: 0.5,
        useInputMeshUvs: false,
    }
    unwrapper.packOptions = {
        bilinear: true,
        blockAlign: false,
        bruteForce: false,
        createImage: false,
        maxChartSize: 0,
        padding: 0,
        resolution: 0,
        rotateCharts: true,
        rotateChartsToAxis: true,
        texelsPerUnit: 0
    }

    await unwrapper.loadLibrary(
        (mode, progress)=>{console.log(mode, progress);},
        // 'https://cdn.jsdelivr.net/npm/xatlasjs@0.2.0/dist/node/xatlas.wasm',
        // 'https://cdn.jsdelivr.net/npm/xatlasjs@0.2.0/dist/node/worker.mjs',
        `${__dirname}/../node_modules/xatlasjs/dist/node/xatlas.wasm`,
        `${__dirname}/../node_modules/xatlasjs/dist/node/worker.mjs`,
    ); // Make sure to wait for the library to load before unwrapping.

    console.log('Library loaded', unwrapper);

    const geometry = new SphereGeometry(1, 32, 32);
    const atlas = await unwrapper.unwrapGeometry(geometry);
    console.log(atlas);
    await unwrapper.exit();
}

start()

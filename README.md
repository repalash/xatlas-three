# xAtlas-three
[xAtlas](https://github.com/jpcy/xatlas) + [three.js](https://github.com/mrdoob/three.js): Mesh parameterization / UV unwrapping module for three.js in wasm with webworkers.

Can be used to unwrap UVs in `BufferGeometry` or pack multiple geometries into a single atlas for lightmap/AO baking.

To use xatlas in JS without three.js you can use [xatlas.js](https://github.com/repalash/xatlas.js) directly.

## Examples
Unwrap geometry and debug UV
[./public/uvs-debug.html](./public/uvs-debug.html) <br> 
Demo: https://repalash.com/xatlas-three/public/uvs-debug.html

Pack multiple geometries into a single atlas and unwrap GLTF
[./public/pack-atlas.html](./public/pack-atlas.html) <br> 
Demo: https://repalash.com/xatlas-three/public/pack-atlas.html

## Usage
Install via [npm](https://www.npmjs.com/package/xatlas-three) by running:
```sh
npm install xatlas-three
```

Create an instance for `UVUnwrapper` and optionally set the packing and charting options for `xatlas`.
```js
    const unwrapper = new UVUnwrapper({BufferAttribute: THREE.BufferAttribute});
    
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

```

Next load the [xatlasjs](https://github.com/repalash/xatlas.js) library:
```js

await unwrapper.loadLibrary(
    (mode, progress)=>{console.log(mode, progress);},
    'https://cdn.jsdelivr.net/npm/xatlasjs@0.1.0/dist/xatlas.wasm',
    'https://cdn.jsdelivr.net/npm/xatlasjs@0.1.0/dist/xatlas.js',
); // Make sure to wait for the library to load before unwrapping.

```
Here jsdelivr cdn link is used to load the xatlas.js library, any custom link can be passed.
Check [xatlasjs on npmjs](https://www.npmjs.com/package/xatlasjs) for more details and latest version

To unwrap a `THREE.BufferGeometry`: 
```js
    await unwrapper.unwrap(geometry);
```
Here, generated UVs will be written to 'uv' attribute, and any original uvs will be written to 'uv2' attribute. This can be customised by passing in a custom attribute name.

Note: only indexed geometry is supported, a non-indexed geometry can be converted to indexed geometry using `THREE.BufferGeometryUtils.mergeVertices`. See any example for details.

To Pack multiple geometries into a single atlas
```js

    await unwrapper.packAtlas([geometry1, geometry2, geometry3, ...]);

```
Here, generated UVs will be written to the 'uv2' attribute of each geometry, this can be customized by passing in a custom attribute name.

Note: 
* xatlas might add or remove some vertices data.
* interleaved geometry is not yet supported.

## Development

### Installing dependencies

    npm install

### Running the project in watch mode

    npm start

### Building the project

    npm run build

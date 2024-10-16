import type {BufferGeometry, BufferAttribute, TypedArray} from "three";
import type {XAtlasWebWorker} from "./XAtlasWebWorker";
import type {XAtlasJS} from "./XAtlasJS";
import type {BaseXAtlas} from "./baseXAtlas";

export type Class<T> = new (...args: any[]) => T

export interface ChartOptions {
    maxIterations?: number,
    straightnessWeight?: number,
    textureSeamWeight?: number,
    useInputMeshUvs?: boolean,
    maxChartArea?: number,
    normalDeviationWeight?: number,
    maxCost?: number,
    roundnessWeight?: number,
    maxBoundaryLength?: number,
    normalSeamWeight?: number,
    fixWinding?: boolean
}

export interface PackOptions {
    maxChartSize?: number,
    padding?: number,
    bilinear?: boolean,
    createImage?: boolean,
    rotateCharts?: boolean,
    rotateChartsToAxis?: boolean,
    blockAlign?: boolean,
    resolution?: number,
    bruteForce?: boolean,
    texelsPerUnit?: number
}

export interface Atlas {
    width: number,
    height: number,
    atlasCount: number,
    // chartCount: number,
    meshCount: number,
    texelsPerUnit: number,
    geometries: (BufferGeometry & {
        userData: BufferGeometry['userData'] & {
            xAtlasSubMeshes?: { index: number, count: number, atlasIndex: number }[]
        }
    })[],
    meshes: {
        mesh: string, // uuid
        vertex: {
            vertices: number[],
            normals?: number[],
            coords?: number[],
            coords1?: number[],
        },
        index?: number[],
        oldIndexes: number[],
        subMeshes?: { index: number, count: number, atlasIndex: number }[]
    }[]
}

/**
 * Base class for unwrapping three.js geometries using xatlas. Check the usage guide at https://github.com/repalash/xatlas-three
 * @license
 * Copyright 2022 repalash
 * SPDX-License-Identifier: MIT
 */
export abstract class BaseUVUnwrapper {
    protected xAtlas: XAtlasWebWorker | XAtlasJS | BaseXAtlas;

    /**
     *
     * @param THREE - for reference to BufferAttribute
     * @param packOptions - options for packing
     * @param chartOptions - options for unwrapping
     * @param useNormals - If true, will use the normals to calculate the uv
     * @param timeUnwrap - Logs the time taken to unwrap geometries
     * @param logProgress - Logs the unwrapping progress
     */
    constructor(
        public THREE: { BufferAttribute: Class<BufferAttribute> },
        public packOptions: PackOptions = {
            resolution: 2048,
        },
        public chartOptions: ChartOptions = {},
        public useNormals: boolean = false,
        public timeUnwrap: boolean = false,
        public logProgress: boolean = false,
    ) {
        this.xAtlas = this._createXAtlas()
    }

    private _libraryPromise = null;

    async loadLibrary(onProgress: (mode: any, progress: any) => void, wasmFilePath: string, workerFilePath?: string): Promise<void> {
        if (this._libraryPromise !== null) return
        this._libraryPromise = new Promise<void>((resolve, reject) => {
            try {
                this.xAtlas.init(resolve, onProgress, wasmFilePath, workerFilePath)
            } catch (e) {
                reject(e)
            }
        }).then(async () => {
            while (!(this.xAtlas.api ? await this.xAtlas.api.loaded : false)) {
                await new Promise(r => setTimeout(r, 100)); // wait for load just in case
            }
        });

        await this._libraryPromise
    }

    private _isUnwrapping = false;

    /**
     * Pack multiple geometry into a single atlas
     * Writes to the uv2 attribute of the geometry by default. Use outputUv to specify the attribute to write to
     * Note that the node/meshes are three.js Geometries, not three.js Meshes/Object3D
     * @param nodeList - list of geometries to unwrap
     * @param outputUv - Attribute to write the output uv to
     * @param inputUv - Attribute to write the input uv to (if any)
     */
    public async packAtlas(nodeList: BufferGeometry[], outputUv: 'uv' | 'uv2' = 'uv2', inputUv: 'uv' | 'uv2' = 'uv'): Promise<Atlas> {
        if (this._libraryPromise === null) {
            throw new Error('xatlas-three: library not loaded');
        }

        // wait for the library to finish loading
        await this._libraryPromise

        if (!nodeList) throw new Error('xatlas-three: nodeList argument not provided');
        if (nodeList.length < 1) throw new Error('xatlas-three: nodeList must have non-zero length');
        const useUvs = this.chartOptions.useInputMeshUvs;

        while (this._isUnwrapping) {
            console.log("xatlas-three: unwrapping another mesh, waiting 100 ms");
            await new Promise(r => setTimeout(r, 100));
        }
        // if(!(xAtlas.loaded)) { // when not using worker. todo
        // xAtlas.addOnLoad(proxy(()=>xAtlasUnWrapLiteGLMeshes(nodeList, onFinish, chartOptions, packOptions, useNormals, useUvs, resultAttribute, originalAttribute)));
        // return;
        // }
        this._isUnwrapping = true;

        await this.xAtlas.api.setProgressLogging(this.logProgress);
        await this.xAtlas.api.createAtlas();
        let meshAdded = [];
        let tag = ""; // for time logging
        for (let mesh of nodeList) {
            let {uuid, index, attributes} = mesh;
            const scaled = mesh.userData.worldScale || 1; // can be [number, number, number] or number

            // if (unwrap === false) continue;

            meshAdded.push(uuid);
            if (!index || !attributes.position || attributes.position!.itemSize !== 3) {
                console.warn("xatlas-three: Geometry not supported: ", mesh)
                continue;
            }
            tag = "Mesh" + meshAdded.length + " added to atlas: " + uuid;
            // console.log(typeof index.array)
            if (this.timeUnwrap) console.time(tag);
            await this.xAtlas.api.addMesh(index.array, (attributes.position as BufferAttribute).array, attributes.normal ? (attributes.normal as BufferAttribute).array : undefined, attributes.uv ? (attributes.uv as BufferAttribute).array : undefined, uuid, this.useNormals, useUvs, scaled);
            if (this.timeUnwrap) console.timeEnd(tag);
        }
        tag = "Generated atlas with " + meshAdded.length + " meshes";
        if (this.timeUnwrap) console.time(tag);
        const atlas = await this.xAtlas.api.generateAtlas(this.chartOptions, this.packOptions, true);
        if (this.timeUnwrap) console.timeEnd(tag);

        let geometries = [];

        for (let m of atlas.meshes) {
            let mesh = nodeList.find(n => n.uuid === m.mesh)
            if (!mesh) {
                console.error("xatlas-three: Geometry not found: ", m.mesh)
                continue;
            }
            // if(mesh.getAttribute("position"))
            //     mesh.deleteAttribute("position");
            // if(mesh.getAttribute("normal") && m.vertex.normal)
            //     mesh.deleteAttribute("normal");
            // if(mesh.getAttribute("uv") && m.vertex.uv)
            //     mesh.deleteAttribute("uv");
            // if(mesh.getAttribute("uv2"))
            //     mesh.deleteAttribute("uv2");
            // if(mesh.getIndex())
            //     mesh.setIndex(null);

            if (m.vertex.vertices) mesh.setAttribute('position', new this.THREE.BufferAttribute(m.vertex.vertices, 3, false));
            if (m.vertex.normals) mesh.setAttribute('normal', new this.THREE.BufferAttribute(m.vertex.normals, 3, true));
            if (m.vertex.coords1) mesh.setAttribute(outputUv, new this.THREE.BufferAttribute(m.vertex.coords1, 2, false));
            if (m.vertex.coords && outputUv !== inputUv) mesh.setAttribute(inputUv, new this.THREE.BufferAttribute(m.vertex.coords, 2, false));
            if (m.index) mesh.setIndex(new this.THREE.BufferAttribute(m.index, 1, false));
            if (m.subMeshes) mesh.userData.xAtlasSubMeshes = structuredClone(m.subMeshes);
            // console.log(mesh)

            // convert any remaining buffer attributes
            const oldIndexes = m.oldIndexes;
            const attributes = mesh.attributes;
            for (const key in attributes) {
                // skip any attributes that have already been set.
                if (
                    key === 'position' ||
                    key === 'normal' ||
                    key === outputUv ||
                    key === inputUv
                ) {
                    continue;
                }

                // old attribute info
                const oldAttribute = attributes[ key ] as BufferAttribute;
                const bufferCons = oldAttribute.array.constructor as Class<TypedArray>;
                const itemSize = oldAttribute.itemSize;
                const oldArray = oldAttribute.array;

                // create a new attribute
                const newArray = new bufferCons(oldIndexes.length * itemSize);
                const newAttribute = new this.THREE.BufferAttribute(newArray, itemSize, oldAttribute.normalized);
                newAttribute.gpuType = oldAttribute.gpuType;

                // copy the data
                for ( let i = 0, l = oldIndexes.length; i < l; i ++ ) {
                    const index = oldIndexes[ i ];
                    for ( let c = 0; c < itemSize; c ++ ) {
                        newArray[ i * itemSize + c ] = oldArray[ index * itemSize + c ];
                    }
                }

                mesh.setAttribute(key, newAttribute);
            }

            geometries.push(mesh);
        }

        await this.xAtlas.api.destroyAtlas();
        this._isUnwrapping = false;

        return {
            width: atlas.width,
            height: atlas.height,
            atlasCount: atlas.atlasCount,
            // chartCount: atlas.chartCount,
            meshCount: atlas.meshCount,
            texelsPerUnit: atlas.texelsPerUnit,
            geometries,
            meshes: atlas.meshes,
        };
    }

    /**
     * Unwraps a geometry to generate uv
     * Writes to the uv attribute of the geometry by default. Use outputUv to specify the attribute to write to
     * @param geometry
     * @param outputUv
     * @param inputUv
     */
    public async unwrapGeometry(geometry: BufferGeometry, outputUv: 'uv' | 'uv2' = 'uv', inputUv: 'uv' | 'uv2' = 'uv2') {
        return this.packAtlas([geometry], outputUv, inputUv);
    }

    protected abstract _createXAtlas(): any;

}

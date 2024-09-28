import type { BufferGeometry, BufferAttribute } from "three";
import type { XAtlasWebWorker } from "./XAtlasWebWorker";
import type { XAtlasJS } from "./XAtlasJS";
import type { BaseXAtlas } from "./baseXAtlas";
export type Class<T> = new (...args: any[]) => T;
export interface ChartOptions {
    maxIterations?: number;
    straightnessWeight?: number;
    textureSeamWeight?: number;
    useInputMeshUvs?: boolean;
    maxChartArea?: number;
    normalDeviationWeight?: number;
    maxCost?: number;
    roundnessWeight?: number;
    maxBoundaryLength?: number;
    normalSeamWeight?: number;
    fixWinding?: boolean;
}
export interface PackOptions {
    maxChartSize?: number;
    padding?: number;
    bilinear?: boolean;
    createImage?: boolean;
    rotateCharts?: boolean;
    rotateChartsToAxis?: boolean;
    blockAlign?: boolean;
    resolution?: number;
    bruteForce?: boolean;
    texelsPerUnit?: number;
}
export interface Atlas {
    width: number;
    height: number;
    atlasCount: number;
    meshCount: number;
    texelsPerUnit: number;
    geometries: (BufferGeometry & {
        userData: BufferGeometry['userData'] & {
            xAtlasSubMeshes?: {
                index: number;
                count: number;
                atlasIndex: number;
            }[];
        };
    })[];
    meshes: {
        mesh: string;
        vertex: {
            vertices: number[];
            normals?: number[];
            coords?: number[];
            coords1?: number[];
        };
        index?: number[];
        oldIndexes: number[];
        subMeshes?: {
            index: number;
            count: number;
            atlasIndex: number;
        }[];
    }[];
}
/**
 * Base class for unwrapping three.js geometries using xatlas. Check the usage guide at https://github.com/repalash/xatlas-three
 * @license
 * Copyright 2022 repalash
 * SPDX-License-Identifier: MIT
 */
export declare abstract class BaseUVUnwrapper {
    THREE: {
        BufferAttribute: Class<BufferAttribute>;
    };
    packOptions: PackOptions;
    chartOptions: ChartOptions;
    useNormals: boolean;
    timeUnwrap: boolean;
    logProgress: boolean;
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
    constructor(THREE: {
        BufferAttribute: Class<BufferAttribute>;
    }, packOptions?: PackOptions, chartOptions?: ChartOptions, useNormals?: boolean, timeUnwrap?: boolean, logProgress?: boolean);
    private _libraryLoaded;
    loadLibrary(onProgress: (mode: any, progress: any) => void, wasmFilePath: string, workerFilePath?: string): Promise<void>;
    private _isUnwrapping;
    /**
     * Pack multiple geometry into a single atlas
     * Writes to the uv2 attribute of the geometry by default. Use outputUv to specify the attribute to write to
     * Note that the node/meshes are three.js Geometries, not three.js Meshes/Object3D
     * @param nodeList - list of geometries to unwrap
     * @param outputUv - Attribute to write the output uv to
     * @param inputUv - Attribute to write the input uv to (if any)
     */
    packAtlas(nodeList: BufferGeometry[], outputUv?: 'uv' | 'uv2', inputUv?: 'uv' | 'uv2'): Promise<Atlas>;
    /**
     * Unwraps a geometry to generate uv
     * Writes to the uv attribute of the geometry by default. Use outputUv to specify the attribute to write to
     * @param geometry
     * @param outputUv
     * @param inputUv
     */
    unwrapGeometry(geometry: BufferGeometry, outputUv?: 'uv' | 'uv2', inputUv?: 'uv' | 'uv2'): Promise<Atlas>;
    protected abstract _createXAtlas(): any;
}
//# sourceMappingURL=UVUnwrapper.d.ts.map
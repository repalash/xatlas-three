import type { BufferGeometry, BufferAttribute } from "three";
export declare type Class<T> = new (...args: any[]) => T;
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
export declare abstract class BaseUVUnwrapper {
    THREE: {
        BufferAttribute: Class<BufferAttribute>;
    };
    packOptions: PackOptions;
    chartOptions: ChartOptions;
    useNormals: boolean;
    timeUnwrap: boolean;
    logProgress: boolean;
    private xAtlas;
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
     * @param nodeList - list of geometries to unwrap
     * @param outputUv - Attribute to write the output uv to
     * @param inputUv - Attribute to write the input uv to (if any)
     */
    packAtlas(nodeList: BufferGeometry[], outputUv?: 'uv' | 'uv2', inputUv?: 'uv' | 'uv2'): Promise<BufferGeometry[]>;
    /**
     * Unwraps a geometry to generate uv
     * @param geometry
     * @param outputUv
     * @param inputUv
     */
    unwrapGeometry(geometry: BufferGeometry, outputUv?: 'uv' | 'uv2', inputUv?: 'uv' | 'uv2'): Promise<BufferGeometry[]>;
    protected abstract _createXAtlas(): any;
}
//# sourceMappingURL=UVUnwrapper.d.ts.map
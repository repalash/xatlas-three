import {Atlas, BaseUVUnwrapper} from "./UVUnwrapper";
import {XAtlasNodeWorker} from "./XAtlasNodeWorker";
import {createRequire} from "node:module";
import path from "node:path";

export class UVUnwrapper extends BaseUVUnwrapper{
    protected _createXAtlas(): any {
        return new XAtlasNodeWorker()
    }

    constructor(...args:any[]) {
        super(...args);

        // https://stackoverflow.com/questions/54977743/do-require-resolve-for-es-modules
        const require = createRequire(import.meta.url);
        const pathName = path.dirname(require.resolve('xatlasjs/package.json'));

        // Make sure to wait for the library to load before unwrapping.
        this.loadLibrary(
            (mode, progress)=>{},
            `${pathName}/dist/node/xatlas.wasm`,
            `${pathName}/dist/node/worker.mjs`,
        );
    }

    exit(): Promise<void> {
        return this.xAtlas?.api.exit();
    }
}

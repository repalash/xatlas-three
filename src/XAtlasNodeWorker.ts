import {BaseXAtlas} from "./baseXAtlas";
import {proxy, wrap} from "comlink";
import nodeEndpoint from "comlink/dist/umd/node-adapter";
import {Worker} from "node:worker_threads";

// https://gist.github.com/CatsMiaow/cc07796aee448b391970798d972302e0
export class XAtlasNodeWorker extends BaseXAtlas {
    init(onLoad: () => void, onProgress: (mode: any, progress: any) => void, wasmFilePath: string, workerFilePath?: string): void {
        if (this.api) return
        if (!workerFilePath) throw new Error("workerFilePath is required");
        (async () => {
            // const workerCode = await fetch(workerFilePath).then(res => res.blob());
            // const workerUrl = URL.createObjectURL(workerCode);
            const t = new Worker(workerFilePath);
            // @ts-ignore
            this.api = await (new (wrap(nodeEndpoint(t)))(
                    proxy(() => {
                        onLoad();
                        // URL.revokeObjectURL(workerUrl);
                    }),
                    proxy((path: string, dir: string) => {
                        return (path === "xatlas.wasm" ? wasmFilePath : path + dir)
                    }),
                    proxy(onProgress))
            )
        })()
    }
}

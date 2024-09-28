import {BaseUVUnwrapper} from "./UVUnwrapper";
import {XAtlasNodeWorker} from "./XAtlasNodeWorker";

export class UVUnwrapper extends BaseUVUnwrapper{
    protected _createXAtlas(): any {
        return new XAtlasNodeWorker()
    }

    exit(): Promise<void> {
        return this.xAtlas?.api.exit();
    }
}

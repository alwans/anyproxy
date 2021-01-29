import { HttpsConfigModel } from "./data/model/httpsConfigModel";
import { LocalMockModel } from "./data/model/localMockModel";
import { OriginRecordModel } from "./data/model/originRecordModel";
import { RemoteModel } from "./data/model/remoteModel";
import { RewriteModel } from "./data/model/rewriteModel";


function init(){
    RewriteModel.sync();
    RemoteModel.sync();
    LocalMockModel.sync();
    OriginRecordModel.sync();
    HttpsConfigModel.sync();
}

function reInit(){
    RewriteModel.sync({ force: true });
    RemoteModel.sync({ force: true });
    LocalMockModel.sync({ force: true });
    OriginRecordModel.sync({ force: true });
    HttpsConfigModel.sync({ force: true });
}


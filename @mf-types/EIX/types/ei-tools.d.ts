import { IServiceTransformer, JsonValueType } from './type';
import { EI } from './ei';
export declare const EIINFO_JSON_CONSTANTS: {
    ATTRIBUTES: string;
    EIINFO_NAME: string;
    EIINFO_DESC_NAME: string;
    EIINFO_MESSAGE: string;
    EIINFO_MESSAGE_KEY: string;
    EIINFO_DETAIL_MESSAGE: string;
    EIINFO_STATUS: string;
    EIINFO_TRACE_ID: string;
    SYS: string;
    BLOCKS: string;
    VERSION: string;
    CONTEXT: string;
    TRACE_ID: string;
};
export declare namespace EITools {
    interface IContent {
        company_code: string;
        company_name: string;
        fore_ip: string;
        fore_mac: string;
        fore_machine: string;
        formname: string;
        userid: string;
        username: string;
        culture: string;
        [key: string]: any;
    }
    class Context implements IContent {
        constructor();
        company_code: string;
        company_name: string;
        fore_ip: string;
        fore_mac: string;
        fore_machine: string;
        formname: string;
        userid: string;
        username: string;
        culture: string;
    }
    interface ISys {
        descName: string;
        detailMsg?: string;
        msg: string;
        msgKey: string;
        name: string;
        traceId: string;
    }
    class Sys implements ISys {
        constructor();
        descName: string;
        detailMsg?: string;
        msg: string;
        msgKey: string;
        name: string;
        status: string;
        traceId: string;
    }
    class SysInfo implements ISys {
        constructor();
        descName: string;
        detailMsg?: string;
        msg: string;
        msgKey: string;
        name: string;
        status: number;
        traceId: string;
    }
    interface __IEDInfo__ {
        fblk_name: Tuple<string, 63>;
        func_name: Tuple<string, 63>;
        pk_name: Tuple<string, 3>;
        pk_val: Tuple<string, 3>;
    }
    type Tuple<TItem, TLength extends number> = [TItem, ...TItem[]] & {
        length: TLength;
    };
    class DataRow extends Array<JsonValueType> {
        constructor(cellValues?: Array<JsonValueType>);
    }
    interface IMetaJson {
        columns: EI.EiColumn[];
    }
    interface IBlockJson {
        meta: IMetaJson;
        rows: DataRow[];
        attr?: {
            [key: string]: any;
        };
    }
    class __BlockJson__ implements IBlockJson {
        constructor();
        meta: IMetaJson;
        rows: DataRow[];
        attr?: {
            [key: string]: any;
        };
        toEiBlock(dataTransformer?: IServiceTransformer): EI.EiBlock;
        /**
         * 将 JSON 字符串或对象转换为 BlockJSON 对象
         * @param input JSON 字符串或对象
         * @returns __BlockJson__
         */
        static parseJSON(input: string | Record<string, any>): __BlockJson__;
    }
    interface IBlocksJson {
        [key: string]: __BlockJson__;
    }
    class __EIInfoJson__ {
        constructor(withEDInfo?: boolean);
        serviceId: string;
        __version__: string;
        __sys__: Sys;
        __context__: Context;
        __blocks__: IBlocksJson;
        __edInfo__?: EI.EDInfo;
        [key: string]: any;
        addBlock(blockName: string, block: __BlockJson__): void;
        toEIInfo(dataTransformer?: IServiceTransformer): EI.EIInfo;
        /**
         * 将 JSON 字符串或对象转换为 EIInfoJSON 对象
         * @param input JSON 字符串或对象
         * @returns __EIInfoJson__
         */
        static parseJSON(input: string | Record<string, any>): __EIInfoJson__;
    }
    const parseJsonObject: (json: any) => __EIInfoJson__;
}

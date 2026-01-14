// declare module "EFX/*";
declare module 'EPTFMERGE/EPTFMERGE' {

    const _default: import("vue").DefineComponent<{
    initialPath: {
        type: import("vue").PropType<string>;
        default: string;
    };
    embedded: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    initialPath: {
        type: import("vue").PropType<string>;
        default: string;
    };
    embedded: {
        type: import("vue").PropType<boolean>;
        default: boolean;
    };
}>>, {
    initialPath: string;
    embedded: boolean;
}, {}>;
export default _default;
}
declare module 'EPTFMERGE/eptfManager' {
    export function eptfManager(): {
        fileUploadChunk: (files: FileList, code: string, recId: string, path?: string, renameList?: Map<string, string>, isCover?: boolean, classCode?: string) => Promise<any>;
        fileDownload: (fullFileName: string[], code: string, path: string, isDownload?: boolean) => Promise<any>;
        fileRemove: (removeFileName: string, code: string, recId: string, path?: string) => Promise<any>;
        getFiles: (code: string, path: string) => Promise<any>;
        filePreview: (previewFileName: string, code: string, path: string) => Promise<any>;
        getFileData: (recId: string, classCode: string) => Promise<any>;
    };
    
}

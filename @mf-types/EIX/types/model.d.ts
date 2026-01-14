export interface IUserInfo {
    id: string;
    userId: string;
    userName: string;
    deptId: string;
    deptEName: string;
    deptCName: string;
    appName?: string;
    passwordExpired?: Date;
    __origin__?: {
        [key: string]: any;
    };
}
export interface EIOptions {
    TableName: string;
}
export interface IEnvironment {
    skinName: string;
    culture: string;
    companyCode: string;
    companyName: string;
    appName: string;
}

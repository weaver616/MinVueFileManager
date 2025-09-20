export interface IAxiosInitConfig {
    baseURL?: string;
    platType?: '4C' | '4J';
    jAppName?: string;
    context?: string;
    currentRouter?: any;
    powerByQianKun: boolean;
    sysInfo?: {
        fore_ip: string;
        fore_mac: string;
        fore_machine: string;
    };
    loaderCallbackHandler?: () => void;
    messageService?: any;
    prefix?: string;
    useGatewayProxy?: boolean;
}
/**
 * 初始化EI
 * @param options
 */
export declare function init(options: IAxiosInitConfig): void;
/**
 *
 * @returns 获取初始化配置
 */
export declare function getConfig(): IAxiosInitConfig | null;

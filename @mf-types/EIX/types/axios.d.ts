import { AxiosPromise, AxiosRequestConfig } from 'axios';
export declare function cancelAllPendingRequests(): void;
export declare function setBaseURLHandler(baseUrl: string): void;
export default function sendRequest(config: AxiosRequestConfig): AxiosPromise<any>;
export declare function setExpiredHandler(callback: (args: any) => void): void;
export declare function setRefreshTokenCallback(callback: () => Promise<any>): void;

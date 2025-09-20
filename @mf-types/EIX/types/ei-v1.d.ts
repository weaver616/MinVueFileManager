import { EI } from "./ei";
import { DataTypeV1 } from "./type";
export declare namespace EIV1 {
    class SysInfoV1 {
        constructor();
        CompanyCode: string;
        CompanyName: string;
        SvcName: string;
        Msg: string;
        Flag: number;
        Sender: string;
        UserName: string;
        ForeIP: string;
        ForeMac: string;
        UUID: string;
        fromEIInfo(eiInfo: EI.EIInfo): void;
    }
    export class EIInfoV1 {
        constructor();
        SysInfo: SysInfoV1;
        Tables: Array<DataTableV1>;
        ExtendedProperties: Map<string, any>;
        addTable(table: DataTableV1, tableName?: string, pos?: number): void;
        remove(tableInfo: string | number): void;
        getTable(tableInfo: string | number): DataTableV1;
        containsTable(tableName: string): boolean;
        toEiInfo(): EI.EIInfo;
        fromEiInfo(inBlock: EI.EIInfo): void;
        parseFromJSON(json: string): EIInfoV1;
    }
    export class DataColumnV1 {
        constructor(name?: string, dataType?: DataTypeV1, caption?: string);
        Name: string;
        Caption: string;
        DataType: DataTypeV1;
        toEiColumn(pos: number): EI.EiColumn;
        fromEiColumn(inColumn: EI.EiColumn): DataColumnV1;
    }
    export class DataRow extends Array<any> {
        constructor(cellValues?: Array<any>);
    }
    export class DataTableV1 {
        constructor();
        Name: string;
        Rows: Array<DataRow>;
        Columns: Array<DataColumnV1>;
        ExtendedProperties: Map<string, any>;
        addColumn(column: DataColumnV1): void;
        addColumn(newColumn: string, dataType?: DataTypeV1, colCaption?: string): void;
        addColumns(...columnNames: string[]): void;
        addColumns(columnArray: DataColumnV1[]): void;
        removeColumn(columnInfo: string | number): void;
        addRow(row: DataRow): void;
        addRow(...cellValues: any[]): void;
        addRows(dataRows: DataRow[]): void;
        toEiBlock(): EI.EiBlock;
        fromEiBlock(inBlock: EI.EiBlock): DataTableV1;
        parseFromJSON(json: string): DataTableV1;
    }
    export {};
}

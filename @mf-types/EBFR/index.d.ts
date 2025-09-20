declare module "EBFR/eBFR" {
  const eBFR: {
    ExportReportFile: (reportInfodata: {
      [key: string]: any;
  }) => Promise<any>;
  ExportReportSpecifyNameFile: (reportInfodata: {
      [key: string]: any;
  }) => Promise<any>;
  OpenReportFile: (reportInfodata: {
      [key: string]: any;
  }) => Promise<void>;
  ReportPrintInfo: (reportInfodata: {
      [key: string]: any;
  }) => Promise<void>;
  GetReportViewInfo: (RENAME: string, PARAM: string, FILENAME: string, CERTIPRINTNO: string, UploadFileAddress: string) => Promise<any>;
  GetReportViewInfoInfo: (reportInfodata: {
      [key: string]: any;
  }) => Promise<any>;
  GetReportViewInfoAnsyBackService: (RENAME: string, PARAM: string, FILENAME: string, CERTIPRINTNO: string, UploadFileAddress: string, PartitionCode: string, serviceName: string) => Promise<void>;
  SilentPrintingAnsy: (RENAME: string, PARAM: string, PRINTNAME: string, CONMPUTER_IP: string, PRINT_COUNT: Number) => Promise<any>;
  SilentPrinting: (RENAME: string, PARAM: string, PRINTNAME: string, PRINT_COUNT: Number) => Promise<any>;
  SilentPrintingfiletype: (RENAME: string, PARAM: string, PRINTNAME: string, FILETYPE: string) => Promise<any>;
  SilentPrintingMultiple: (RENAME: string, PARAM: string, PRINTNAME: string, PRINT_COUNT: Number, FILETYPE: string) => Promise<any>;
  CallReportPDFFrom: (RENAME: string, PARAM: string) => Promise<void>;
  CallReportCheckTokenPDFFrom: (RENAME: string, PARAM: string) => Promise<void>;
  CallReportPDFFromMap: (RENAME: string, PARAM: Map<string, any>) => Promise<void>;
  CallReportPDFJSFrom: (RENAME: string, PARAM: string) => Promise<void>;
  CallReportCheckTokenPDFJSFrom: (RENAME: string, PARAM: string) => Promise<void>;
  CallReportPDFJSFromMap: (RENAME: string, PARAM: Map<string, any>) => Promise<void>;
  CallReportXLSXFromMap: (RENAME: string, PARAM: Map<string, any>) => Promise<void>;
  CallReportXLSXFrom: (RENAME: string, PARAM: string) => Promise<void>;
  CallReportXLSXFromReadOnly: (RENAME: string, PARAM: string, READONLY: string) => Promise<void>;
  CallReportPDF: (RENAME: string, PARAM: string) => Promise<void>;
  CallReportXLSX: (RENAME: string, PARAM: string) => Promise<void>;
  DONWlOAdFILE: (FileName: string) => Promise<void>;
  SearchFile: (FileName: string) => Promise<void>;
  DeleteFtpFile: (ftpFileInfo: {
      [key: string]: any;
  }) => Promise<void>;
  ExportDataReportFile: (reportInfodata: {
      [key: string]: any;
  }) => Promise<void>;
  PreviewlongparamPDF: (reportInfodata: {
      [key: string]: any;
  }) => Promise<void>;
  PreviewlongparamXLSX: (reportInfodata: {
      [key: string]: any;
  }) => Promise<void>;
  PreviewlongparamPDFJS: (reportInfodata: {
      [key: string]: any;
  }) => Promise<void>;
  ReportMergeFilesPDF: (reportInfodata: {
      [key: string]: any;
  }) => Promise<void>;
  ReportMergeFilesXLSX: (reportInfodata: {
      [key: string]: any;
  }) => Promise<void>;
  ReportMergeFilesPDFJS: (reportInfodata: {
      [key: string]: any;
  }) => Promise<void>;
  ViewReportByReportName:  (RENAME: string, PARAM: string,ReprotType:String)  => Promise<void>;
  ViewReportMergeFiles:  (reportInfodata: { [key: string]: any },ReprotType:string)  => Promise<void>;
  GetReportViewInfoModelAllPathSpecifySheet: (reportInfodata: { [key: string]: any }) => Promise<void>;
  GetListReportSpecifyName: (reportInfodata: { [key: string]: any })  => Promise<void>;
  SilentPrintPGL:(PGLstring: string, PRINTNAME: string, PRINT_COUNT: Number)=> Promise<void>;
  ViewReportGetUrl: (RENAME: string, PARAM: string,ReprotType:String)=> Promise<void>;

};
export default eBFR;
}

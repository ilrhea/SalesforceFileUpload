declare module "@salesforce/apex/CSVFileController.getUploadedCSVFiles" {
  export default function getUploadedCSVFiles(): Promise<any>;
}
declare module "@salesforce/apex/CSVFileController.getFileContent" {
  export default function getFileContent(param: {contentVersionId: any}): Promise<any>;
}
declare module "@salesforce/apex/CSVFileController.deleteFile" {
  export default function deleteFile(param: {contentVersionId: any}): Promise<any>;
}

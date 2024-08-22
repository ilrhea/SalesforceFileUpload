public with sharing class CSVFileUploaderController {
    @AuraEnabled
    public static void saveTheFile(String fileName, String base64Data, String contentType) {
        // Decode the base64 string
        Blob fileBody;
        if (base64Data != null && base64Data.length() > 0) {
            fileBody = Blob.valueOf(base64Data);
        }

        // Create a ContentVersion object (Salesforce File)
        ContentVersion cv = new ContentVersion();
        cv.Title = fileName;
        cv.PathOnClient = '/' + fileName;
        cv.VersionData = fileBody;
        cv.IsMajorVersion = true;
        insert cv;
    }
}
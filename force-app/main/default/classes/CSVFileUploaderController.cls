public with sharing class CSVFileUploaderController {
    @AuraEnabled
    public static void saveTheFile(String fileName, String fileContent) {
        try{
            ContentVersion contentVersion = new ContentVersion(); 
            contentVersion.Title = fileName;
            contentVersion.PathOnClient = fileName ;
            contentVersion.VersionData = Blob.valueOf(fileContent);
            insert contentVersion;
        }catch(Exception e){
            throw new AuraHandledException('Error uploading file: ' + e);
        }
    }

    @AuraEnabled
    public static void saveSurf(String surfName, List<String> devices){
        try {
            List<Device__c> devc = new List<Device__c>();
            for (String d : devices) {
                Device__c device = new Device__c();
                device.Name = d;
                devc.add(device);
            }

            insert devc;

            Surf__c s = new Surf__c(); 
            s.Name = surfName; 
            insert s;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static string saveDevice(){
        try {
            Device__c device = new Device__c();
            device.Name = 'Test Device';
            insert device;
            return device.Id;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String processExcelFile(Id contentDocumentId) {
        ContentVersion contentVersion = [SELECT VersionData FROM ContentVersion WHERE ContentDocumentId = :contentDocumentId LIMIT 1];
        Blob fileBlob = contentVersion.VersionData;

        // Call external service to process the Excel file
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://procces-excel-9e4aa111d1c4.herokuapp.com/process-excel');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/octet-stream');
        req.setBodyAsBlob(fileBlob);

        Http http = new Http();
        HttpResponse res = http.send(req);

        if (res.getStatusCode() == 200) {
             // Handle the response from the external service
             Blob modifiedFileBlob = res.getBodyAsBlob();

             // Save the modified file back to Salesforce
             ContentVersion modifiedContentVersion = new ContentVersion();
             modifiedContentVersion.Title = 'Modified ' + contentVersion.Title;
             modifiedContentVersion.PathOnClient = contentVersion.PathOnClient;
             modifiedContentVersion.VersionData = modifiedFileBlob;
             insert modifiedContentVersion;

             return modifiedContentVersion.Id; // Return the ID of the modified file
         } else {
            throw new AuraHandledException('Error processing the Excel file');
        }
    }
}
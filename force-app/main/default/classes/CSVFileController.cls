public with sharing class CSVFileController {
    @AuraEnabled(cacheable=true)
    public static List<ContentVersion> getUploadedCSVFiles() {
        Id currentUserId = UserInfo.getUserId();
        return [
            SELECT Id, Title, CreatedDate 
            FROM ContentVersion 
            WHERE CreatedById = :currentUserId AND FileType = 'CSV'
            ORDER BY CreatedDate DESC
        ];
    }

    @AuraEnabled(cacheable=false)
    public static String getFileContent(Id contentVersionId) {
        ContentVersion contentVersion = [
            SELECT VersionData 
            FROM ContentVersion 
            WHERE Id = :contentVersionId 
            LIMIT 1
        ];

        return contentVersion.VersionData.toString();
    }

    @AuraEnabled
    public static void deleteFile(Id contentVersionId) {
        ContentVersion cv = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :contentVersionId LIMIT 1];
        delete [SELECT Id FROM ContentDocument WHERE Id = :cv.ContentDocumentId];
    }
}

public with sharing class CSVFileController {
    @AuraEnabled(cacheable=true)
    public static List<ContentVersion> getUploadedCSVFiles() {
        try {
            Id currentUserId = UserInfo.getUserId();
            return [
                SELECT Id, Title, CreatedDate 
                FROM ContentVersion 
                WHERE CreatedById = :currentUserId AND FileType = 'CSV'
                ORDER BY CreatedDate DESC
            ];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
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

    @AuraEnabled
    public static string getDownloadLink(Id contentVersionId){
        try {
            // Query the ContentVersion record
            ContentVersion contentVersion = [SELECT Id, Title FROM ContentVersion WHERE Id = :contentVersionId LIMIT 1];

            // Create a ContentDistribution record
            ContentDistribution contentDistribution = new ContentDistribution(
                Name = contentVersion.Title,
                ContentVersionId = contentVersion.Id,
                PreferencesAllowViewInBrowser = true
            );
            insert contentDistribution;

            // Retrieve the public URL
            String publicUrl = [SELECT DistributionPublicUrl FROM ContentDistribution WHERE Id = :contentDistribution.Id].DistributionPublicUrl;
            System.debug('Public URL: ' + publicUrl);

            return publicUrl;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
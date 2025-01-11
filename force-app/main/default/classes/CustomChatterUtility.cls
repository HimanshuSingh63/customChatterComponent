public with sharing class CustomChatterUtility {
    public CustomChatterUtility() {

    }
    // Method to get related feeds for a given object
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getRelatedFeeds(Id targetObjectId){
        // Query FeedItems with their related comments
        List<FeedItem> feedItems = [SELECT Id, Body, Title, CreatedBy.Name,LastModifiedDate,
                                    (SELECT Id, CommentBody,CreatedBy.Name,ThreadLastUpdatedDate
                                     FROM FeedComments ORDER BY CreatedDate DESC) 
                                    FROM FeedItem 
                                    WHERE ParentId = :targetObjectId
                                    ORDER BY CreatedDate DESC];
        
        // Initialize result list to store our formatted data
        List<Map<String, Object>> result = new List<Map<String, Object>>();
        
        for (FeedItem feedItem : feedItems) {
            Map<String, Object> wrapper = new Map<String, Object>();
            wrapper.put('feedItem', feedItem);
            result.add(wrapper);
        }
        return result;
    }
    @AuraEnabled
    public static void createFeedItem(String Body,String ParentId){
        try {
            FeedItem post = new FeedItem();
            post.Body = Body;
            post.ParentId = ParentId;
            post.IsRichText = true;
            insert post;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        
    }
    @AuraEnabled
    public static void deleteRecord(String recordId) {
        try {
            Id RecordIdTodelete = (Id)recordId;
            Schema.SObjectType typeOfSobject = RecordIdTodelete.getSObjectType();
            String objectTypeName = String.valueOf(typeOfSobject);
            System.debug('sObject Type is ' + objectTypeName);
                
            // Check if the user has the necessary permissions to delete the feed item
            if (!typeOfSobject.getDescribe().isDeletable()) {
                throw new AuraHandledException('You do not have the necessary permissions to delete this ' + objectTypeName);
            }
    
            // Delete the feed item
            Database.DeleteResult result = Database.delete(RecordIdTodelete);
            if (!result.isSuccess()) {
                throw new AuraHandledException('Error deleting ' + objectTypeName + ': ' + result.getErrors()[0].getMessage());
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled
    public static void createFeedComment(String CommentBody,String FeedItemId){
        try {
            FeedComment comment = new FeedComment();
            comment.CommentBody = CommentBody;
            comment.FeedItemId = FeedItemId;
            comment.IsRichText = true;
            insert comment;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
}
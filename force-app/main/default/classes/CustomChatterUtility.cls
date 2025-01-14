public with sharing class CustomChatterUtility {
    public CustomChatterUtility() {

    }
    public Static Id currentUserId = UserInfo.getUserId();
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getRelatedFeeds(Id targetObjectId) {
    
        // Query FeedItems with their related comments and likes
        List<FeedItem> feedItems = [
            SELECT Id, Body, CreatedBy.Name, LastModifiedDate,
                   (SELECT Id, CommentBody, CreatedBy.Name, ThreadLastUpdatedDate
                    FROM FeedComments ORDER BY CreatedDate DESC),
                   (SELECT Id, InsertedById FROM FeedLikes)
            FROM FeedItem 
            WHERE ParentId = :targetObjectId
            ORDER BY CreatedDate DESC
        ];
    
        // Result list to store formatted data
        Set<String> processedFeedItemIds = new Set<String>();
        List<Map<String, Object>> result = new List<Map<String, Object>>();
    
        for (FeedItem feedItem : feedItems) {
            // Skip if feed item already processed
            if (processedFeedItemIds.contains(feedItem.Id)) {
                continue;
            }
            processedFeedItemIds.add(feedItem.Id);
        
            // Determine if the current user liked this feed item
            Boolean isLiked = false;
            if (feedItem.FeedLikes != null) {
                for (FeedLike feedLike : feedItem.FeedLikes) {
                    if (feedLike.InsertedById == currentUserId) {
                        isLiked = true;
                        break;
                    }
                }
            }
        
            // Prepare the FeedComments as a list of feedComments
            List<Map<String, Object>> feedComments = new List<Map<String, Object>>();
            if (feedItem.FeedComments != null) {
                for (FeedComment comment : feedItem.FeedComments) {
                    Map<String, Object> feedCommentWrapper = new Map<String, Object>();
                    feedCommentWrapper.put('CommentBody', comment.CommentBody);
                    feedCommentWrapper.put('CreatedByName', comment.CreatedBy.Name);
                    feedCommentWrapper.put('Id', comment.Id);
                    feedComments.add(feedCommentWrapper);
                }
            }
        
            // Create a FeedItemWrapper instance
            Map<String, Object> feedItemWrapper = new Map<String, Object>();
            feedItemWrapper.put('Id', feedItem.Id);
            feedItemWrapper.put('Body', feedItem.Body);
            feedItemWrapper.put('CreatedByName', feedItem.CreatedBy.Name);
            feedItemWrapper.put('ThreadLastUpdatedDate', feedItem.LastModifiedDate);
            feedItemWrapper.put('IsLiked', isLiked);
            feedItemWrapper.put('FeedComments', feedComments);
        
            // Add the wrapper to the result with a structure matching the desired JSON
            Map<String, Object> singleFeedItem = new Map<String, Object>();
            singleFeedItem.put('feedItem', feedItemWrapper);
            result.add(singleFeedItem);
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
    @AuraEnabled
    public static void manageLike(Boolean mark,String feedItemId){
        try {
            System.debug('Called');
            if(feedItemId!=null){
                if(mark){
                    FeedLike likePost = new FeedLike();
                    likePost.FeedItemId = feedItemId;
                    insert likePost;
                }else{
                    FeedItem likePost = [SELECT Id,(SELECT Id,FeedItemId FROM FeedLikes 
                                                    WHERE FeedItemId=:feedItemId 
                                                    AND InsertedById=:currentUserId 
                                                    LIMIT 1) 
                                        FROM FeedItem 
                                        WHERE Id=:feedItemId LIMIT 1];
                    if(likePost.FeedLikes!=null && likePost.FeedLikes.size()>0){
                        Delete likePost.FeedLikes[0];
                    }
                }
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static String uploadFiles(String fileData) {
        try {
            // Parse the file data
            Map<String, Object> fileDataMap = (Map<String, Object>)JSON.deserializeUntyped(fileData);
            String base64Data = (String)fileDataMap.get('base64');
            String fileName = (String)fileDataMap.get('filename');
            String recordId = (String)fileDataMap.get('recordId');
            
            // Create ContentVersion
            ContentVersion cv = new ContentVersion();
            cv.VersionData = EncodingUtil.base64Decode(base64Data);
            cv.Title = fileName;
            cv.PathOnClient = fileName;
            insert cv;
            
            // Get Content Document Id
            Id conDocId = [SELECT ContentDocumentId 
                          FROM ContentVersion 
                          WHERE Id = :cv.Id].ContentDocumentId;
            
            // Create ContentDocumentLink
            ContentDocumentLink cdl = new ContentDocumentLink();
            cdl.ContentDocumentId = conDocId;
            cdl.LinkedEntityId = recordId;
            cdl.ShareType = 'V';
            insert cdl;
            
            return 'Success';
        } catch (Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }
    
}
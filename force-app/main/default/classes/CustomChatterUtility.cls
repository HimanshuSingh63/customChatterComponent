public with sharing class CustomChatterUtility {

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
            WITH USER_MODE
            ORDER BY CreatedDate DESC
            LIMIT 49999
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
            feedItemWrapper.put('NameInitials', findInitials(feedItem.CreatedBy.Name));
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
    public static string findInitials(String Name){
        String initials;
        String[] NameParts = Name.split(' ');

        if(NameParts.size() > 0){
            if (NameParts.size() >= 2){
                initials = NameParts[0].substring(0,1)+NameParts[1].subString(0,1);
            }else{
                initials = NameParts[0].substring(0,1);
            }
        }
        return initials;
    }
    
    @AuraEnabled
    public static void createFeedItem(String Body,String ParentId){
        try {
            if(!Schema.SObjectType.FeedItem.isCreateable() || 
                !Schema.SObjectType.FeedItem.fields.Body.isCreateable() ||
                !Schema.SObjectType.FeedItem.fields.ParentId.isCreateable() ||
                !Schema.SObjectType.FeedItem.fields.IsRichText.isCreateable()){
                throw new AuraHandledException('You do not have the necessary permissions to create a feed item');
            }
            FeedItem post = new FeedItem();
            post.Body = Body;
            post.ParentId = ParentId;
            post.IsRichText = true;
            insert as user post;

        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        
    }
    @AuraEnabled
    public static void deleteRecord(String recordId) {
        try {
            Id recordIdTodelete = (Id)recordId;
            Schema.SObjectType typeOfSobject = recordIdTodelete.getSObjectType();
            String objectTypeName = String.valueOf(typeOfSobject);
                
            // Check if the user has the necessary permissions to delete the feed item
            if (!typeOfSobject.getDescribe().isDeletable()) {
                throw new AuraHandledException('You do not have the necessary permissions to delete this ' + objectTypeName);
            }
    
            // Delete the feed item
            Database.DeleteResult result = Database.delete(recordIdTodelete);
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
            if( !Schema.SObjectType.FeedComment.isCreateable() ||
                !Schema.SObjectType.FeedComment.fields.CommentBody.isCreateable() ||
                !Schema.SObjectType.FeedComment.fields.FeedItemId.isCreateable() ||
                !Schema.SObjectType.FeedComment.fields.IsRichText.isCreateable()){
                throw new AuraHandledException('You do not have the necessary permissions to create a feed comment');
            }
            FeedComment comment = new FeedComment();
            comment.CommentBody = CommentBody;
            comment.FeedItemId = FeedItemId;
            comment.IsRichText = true;
            insert as user comment;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static void manageLike(Boolean mark,String feedItemId){
        try {
            if(feedItemId!=null){
                if(mark){
                    if( !Schema.SObjectType.FeedLike.isCreateable() || 
                    !Schema.SObjectType.FeedLike.fields.FeedItemId.isCreateable() ||
                    !Schema.SObjectType.FeedLike.fields.InsertedById.isCreateable()){
                        throw new AuraHandledException('You do not have the necessary permissions to like this feed item');
                    }
                    FeedLike likePost = new FeedLike();
                    likePost.FeedItemId = feedItemId;
                    insert as user likePost;
                }else{
                    FeedItem likePost = [SELECT Id,(SELECT Id,FeedItemId FROM FeedLikes 
                                                    WHERE FeedItemId=:feedItemId 
                                                    AND InsertedById=:currentUserId 
                                                    LIMIT 1) 
                                        FROM FeedItem 
                                        WHERE Id=:feedItemId WITH USER_MODE LIMIT 1];
                    if(likePost.FeedLikes!=null && likePost.FeedLikes.size()>0){
                        if(!Schema.SObjectType.FeedLike.isDeletable()){
                            throw new AuraHandledException('You do not have the necessary permissions to unlike this feed item');
                        }
                        Delete as user likePost.FeedLikes[0];
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
            
            if(!Schema.SObjectType.ContentVersion.isCreateable() ||
                !Schema.SObjectType.ContentVersion.fields.PathOnClient.isCreateable() ||
                !Schema.SObjectType.ContentVersion.fields.Title.isCreateable() ||
                !Schema.SObjectType.ContentVersion.fields.VersionData.isCreateable()){
                throw new AuraHandledException('You do not have the necessary permissions to upload a file');
            }
            ContentVersion cv = new ContentVersion();
            cv.VersionData = EncodingUtil.base64Decode(base64Data);
            cv.Title = fileName;
            cv.PathOnClient = fileName;
            insert as user cv;
            
            // Get Content Document Id
            Id conDocId = [SELECT ContentDocumentId 
                          FROM ContentVersion 
                          WHERE Id = :cv.Id WITH USER_MODE LIMIT 1].ContentDocumentId;
            
            if(!Schema.SObjectType.ContentDocumentLink.isCreateable() ||
                !Schema.SObjectType.ContentDocumentLink.fields.ContentDocumentId.isCreateable() ||
                !Schema.SObjectType.ContentDocumentLink.fields.LinkedEntityId.isCreateable() ||
                !Schema.SObjectType.ContentDocumentLink.fields.ShareType.isCreateable()){
                throw new AuraHandledException('You do not have the necessary permissions to share the file');
            }
            // Create ContentDocumentLink
            ContentDocumentLink cdl = new ContentDocumentLink();
            cdl.ContentDocumentId = conDocId;
            cdl.LinkedEntityId = recordId;
            cdl.ShareType = 'V';
            insert as user cdl;
            
            return 'Success';
        } catch (Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }
    
    // method to get the base64 data for the file
    @AuraEnabled
    public static String saveRTAImage(String rtaUrl) {
        String vfUrl = '/apex/SaveRTAImage?url=' + EncodingUtil.urlEncode(rtaUrl, 'UTF-8');
        PageReference pageRef = new PageReference(vfUrl);
        String result = pageRef.getContent().toString();
        return result;
    }
    
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getFiles(){
        List<Map<String, Object>> result = new List<Map<String, Object>>();

        For(ContentDocumentLink link : [SELECT ContentDocumentId,ContentDocument.Title,ContentDocument.FileType,
                                        ContentDocument.LatestPublishedVersionId,ContentDocument.OwnerId,
                                        ShareType,ContentDocument.ContentModifiedDate,ContentDocument.ContentSize
                                        FROM ContentDocumentLink 
                                        WHERE LinkedEntityId = :currentUserId
                                        WITH USER_MODE 
                                        LIMIT 49999])
        {
            Map<String, Object> fileMap = new Map<String, Object>();
            fileMap.put('Id',link.ContentDocument.LatestPublishedVersionId);
            fileMap.put('Name',link.ContentDocument.Title);
            fileMap.put('Date',formateDate(link.ContentDocument.ContentModifiedDate));
            fileMap.put('Size',formatFileSize(link.ContentDocument.ContentSize)); 
            fileMap.put('FileType',link.ContentDocument.FileType);
            fileMap.put('fileIconName',getFileIcon(link.ContentDocument.FileType));
            fileMap.put('OwnerId',link.ContentDocument.OwnerId);
            fileMap.put('ContentDocumentId',link.ContentDocumentId);
            fileMap.put('ShareType',link.ShareType);
            result.add(fileMap);
        } 
        return result;                                                
    }

    public static String formatFileSize(Long bytes) {
        if (bytes < 1024) {
            return bytes + ' bytes';
        } else if (bytes < 1024 * 1024) {
            // Convert to KB
            Decimal kb = bytes / 1024.0;
            return kb.setScale(2) + ' KB';
        } else if (bytes < 1024 * 1024 * 1024) {
            // Convert to MB
            Decimal mb = bytes / (1024.0 * 1024.0);
            return mb.setScale(2) + ' MB';
        } else {
            // Convert to GB
            Decimal gb = bytes / (1024.0 * 1024.0 * 1024.0);
            return gb.setScale(2) + ' GB';
        }
    }
    
    public static String getFileIcon(String fileType) {
        if (fileType == 'JPG' || fileType == 'JPEG' || fileType == 'PNG' || fileType == 'GIF') {
            return 'doctype:image';
        } else if (fileType == 'PDF' ) {
            return 'doctype:pdf';
        }
        return 'doctype:attachment';
    }
    public static date formateDate (Datetime dateToFormat){
        Return dateToFormat.date();
    }
    
}
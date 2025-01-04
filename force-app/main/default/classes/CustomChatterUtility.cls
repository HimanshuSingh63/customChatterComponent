public with sharing class CustomChatterUtility {
    public CustomChatterUtility() {

    }
    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getRelatedFeeds(Id targetObjectId){
        // Query FeedItems with their related comments
        List<FeedItem> feedItems = [SELECT Id, Body, Title, CreatedBy.Name,
                                    (SELECT Id, CommentBody,CreatedBy.Name
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
}
public with sharing class RetrieveRelatedFeedRecords {
    public RetrieveRelatedFeedRecords() {

    }

    @AuraEnabled(cacheable=true)
    public static List<FeedItemWrapper> getRelatedFeeds(Id targetObjectId){
        List<FeedItem> feedItems = [SELECT Id, Body, Title, CreatedBy.Name, 
                                    (SELECT Id, CommentBody FROM FeedComments) 
                                    FROM FeedItem 
                                    WHERE ParentId = :targetObjectId];
        
        List<FeedItemWrapper> feedItemWrappers = new List<FeedItemWrapper>();
        for (FeedItem feedItem : feedItems) {
            FeedItemWrapper wrapper = new FeedItemWrapper();
            wrapper.feedItem = feedItem;
            wrapper.feedComments = feedItem.FeedComments;
            feedItemWrappers.add(wrapper);
        }
        
        return feedItemWrappers;
    }

    public class FeedItemWrapper {
        @AuraEnabled
        public FeedItem feedItem { get; set; }
        
        @AuraEnabled
        public List<FeedComment> feedComments { get; set; }
    }
}
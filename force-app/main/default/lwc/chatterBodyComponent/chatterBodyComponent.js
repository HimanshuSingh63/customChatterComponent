import { LightningElement,track,api,wire } from 'lwc';
import getRelatedFeeds from '@salesforce/apex/CustomChatterUtility.getRelatedFeeds';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { subscribe, MessageContext } from 'lightning/messageService';
import createFeedComment from '@salesforce/apex/CustomChatterUtility.createFeedComment';
import CUSTOM_CHATTER_COMPONENT_CHANNEL from '@salesforce/messageChannel/Custom_Chatter_Component__c';
export default class ChatterBodyComponent extends LightningElement {
    @track showmodal=false;
    @api currrentRecordId;
    @track feedData;
    isSelected = false;
    popOverVisible = false;
    @track inputValue = '';
    wiredFeedResults;
    messageForModal = {};
    @track isLoading = true;
    subscription = null;
    messageFromPost;
    type = 'FeedComment';
    @track Searchterm;
    

    @wire(MessageContext)
    messageContext;

    subscribeToMessageChannel() {
        this.subscription = subscribe(
            this.messageContext,
            CUSTOM_CHATTER_COMPONENT_CHANNEL,
            () => this.handleRefresh()
        );
    }
    handleMessage(message) {
        this.messageFromPost = message.recordId;
        console.log('messageFromPost@@',this.messageFromPost);
        
    }

    connectedCallback() {
        this.subscribeToMessageChannel();
    }
    
    @wire(getRelatedFeeds, { targetObjectId: '$currrentRecordId' })
    wiredFeeds(result) {
        this.wiredFeedResults = result;
        const { data, error } = result;
        if (data) {
            this.isLoading = false;
            this.feedData = data;
            console.log('data##', JSON.stringify(this.feedData));
        }
        if (error) {
            console.log('error###', error);
        }
    }
    handleClick() {
        this.isSelected = !this.isSelected; 
    }
    // handlePopOver(){
    //     this.popOverVisible = !this.popOverVisible;
    // }
    handleComment(){
        
    }
    handleFilters(event){
        if(event.target.value === 'Latest Posts'){
            this.handleRefresh();
        }
        else if(event.target.value === 'Most Recent Activity'){
            
        }
    }
    
    handleshowmodal(event) {
        console.log('Modal button clicked');
        this.showmodal = !this.showmodal;
        if(event.detail){
            let buttonName = event.detail.buttonName;
            console.log('button name',buttonName);
            if(buttonName === 'Delete'){
                this.handleRefresh();
            }
        }
    }
    handleRefresh(){
        console.log('refresh clicked');
        this.Searchterm = ''
        this.isLoading = true;
        return refreshApex(this.wiredFeedResults)
            .then(() => {
                this.isLoading = false;  
            })
            .catch(error => {
                console.error('Error refreshing data:', error);
                this.isLoading = false;  
            });
    }
    handleCreateFeedComment(event){
        let CommentBody = event.detail;
        let feedItemId; 
        const parentLi = event.target.closest('.elementWrapper');

        if (parentLi) {
            feedItemId = parentLi.dataset.id;
            console.log('Using parent feed id:', feedItemId);

            if(CommentBody && feedItemId){ 
                createFeedComment({CommentBody:CommentBody,FeedItemId:feedItemId})
                .then(reuslt=>{
                    console.log('result ', reuslt);
                    this.showToast('Success','success','Comment shared successfully');
                    this.handleRefresh();
                })
                .catch(error=>{
                    console.log('error ',error.body.message);
                    this.showToast('Error','Error',error.body.message);
                });
            }
        }else{
            console.log('No parent feed id');
        }
        
    }
    handleFeedAction(e){
        if(e.target.label === 'Delete'){
            const feedItemElement = e.target.closest('[data-id]');
            const feedItemId = feedItemElement.dataset.id;
            console.log('Delete clicked feeditem id',feedItemId);
            this.messageForModal.Title = "Post";
            this.messageForModal.Body = "Deleting this item permanently removes it. We're just making sure that's what you want.";
            this.messageForModal.Id = feedItemId;
            this.showmodal = true;
        }
    }
    handleFeedCommentAction(e){
        if(e.target.label ==='Delete'){
            const feedCommentElement = e.target.closest('[data-feed-comment-id]');
            const feedCommentId = feedCommentElement.dataset.feedCommentId;
            console.log('Delete clcked and feed comment id: ',feedCommentId);
            this.messageForModal.Title = "Comment";
            this.messageForModal.Body = "Deleting this item permanently removes it. We're just making sure that's what you want.";
            this.messageForModal.Id = feedCommentId;
            this.showmodal = true;
            console.log('this.showmodal',this.showmodal);
            
        }
    }
    handleSearch(evt) {
        console.log('search clicked');
        // const isEnterKey = evt.keyCode === 13;
        this.Searchterm = evt.target.value;
                
            if (this.Searchterm) {
                console.log(
                    'search term',
                    this.Searchterm);
                
                const searchTermLower = this.Searchterm.toLowerCase();
                // Filter from wiredFeedResults.data instead of feedData
                let filteredData = this.wiredFeedResults.data.filter(feedItem => {
                    // Check if the search term is in the feed item body
                    let inFeedItem = feedItem.feedItem.Body.toLowerCase().includes(searchTermLower);
                    console.log('inFeedItem ', inFeedItem);
                
                    // If the search term is not in the feed item body, check the comments
                    let inFeedComment = false;
                    if (!inFeedItem) {
                        inFeedComment = feedItem.feedItem.FeedComments?.some(comment =>
                            comment.CommentBody.toLowerCase().includes(searchTermLower)
                        );
                        console.log('inFeedComment ', inFeedComment);
                    }
                    return inFeedItem || inFeedComment;
                });
                console.log('filteredData ', JSON.stringify(this.filteredData));    
                if(filteredData){
                    this.feedData = filteredData;
                }else{
                    this.feedData = [];
                } 

            } else {
                this.feedData = this.wiredFeedResults.data;
            }
    }
    handleClearSearch(){
        console.log('clear click');
        this.feedData = this.wiredFeedResults.data;    
    }
    handleCloseModal(){
        this.showmodal = false;
        
    }
    showToast(title,variant,message){ 
        const event = new ShowToastEvent({
            title: title,
            variant: variant,
            mode: 'dismissable',
            message: message
        });
        this.dispatchEvent(event);
    }
}
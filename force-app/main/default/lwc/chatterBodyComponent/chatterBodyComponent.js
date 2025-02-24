import { LightningElement,track,api,wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish, MessageContext } from 'lightning/messageService';
import createFeedComment from '@salesforce/apex/CustomChatterUtility.createFeedComment';
import manageLike from '@salesforce/apex/CustomChatterUtility.manageLike';
import CUSTOM_CHATTER_COMPONENT_CHANNEL from '@salesforce/messageChannel/Custom_Chatter_Component__c';
export default class ChatterBodyComponent extends LightningElement {
    @track showmodal=false;
    @track feed;
    @track isLiked = false;
    popOverVisible = false;
    messageForModal = {};
    type = 'FeedComment';
    @wire(MessageContext)
    messageContext;
    url ='/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=068NS00000K8mtZYAR&operationContext=CHATTER&contentId=069NS00000LHMo1YAH'

    get buttonText() {
        return this.isLiked ? 'Liked' : 'Like';
    }

    get iconClass() {
        return this.isLiked ? 'like-icon filled' : 'like-icon';
    }

    get textClass() {
        return this.isLiked ? 'slds-p-left_x-small liked-text' : 'slds-p-left_x-small';
    }

    @api
    get values(){
        return this.feed;
    }
    set values(value){
        console.log(
            'set values',
            JSON.stringify(value));
        this.feed = this.processData(JSON.parse(JSON.stringify(value)));
        this.isLiked = value.feedItem.IsLiked;

        console.log(
            'Processed values',
            JSON.stringify(this.feed));
    }

    // Method to process the JSON data
    processData(data) {
        // Process feed item
        data.feedItem.timeDifference = this.formatTimeDifference(data.feedItem.CreatedDate);

        // Process comments
        if (data.feedItem.FeedComments && data.feedItem.FeedComments.length > 0) {
            data.feedItem.FeedComments = data.feedItem.FeedComments.map(comment => ({
                ...comment,
                timeDifference: this.formatTimeDifference(comment.CreatedDate)
            }));
        }

        return data;
    }
    
    handleLikeClick() {
        this.isLiked = !this.isLiked;
        try {
            console.log('called');
            
            manageLike({mark:this.isLiked,feedItemId:this.feed.feedItem.Id})
            .then(result=>{
                console.log('result ', result);
            })
            .catch(error=>{
                console.log('error ',error.body.message);
            });
        } catch (error) {
            console.log('error ',error.body.message);
            
        }
        

    }
    handlePreview(){
        console.log('preview');
        
    }
    handleComment(){
        this.template.querySelector("c-post-component").handleInputClick();
    }
    
    handleshowmodal(event) {
        console.log('Modal button clicked');
        this.showmodal = !this.showmodal;
        if(event.detail){
            let buttonName = event.detail.buttonName;
            console.log('button name',buttonName);
            if(buttonName === 'Delete'){
                const message = {
                    type: 'Refresh',
                    data: ''
                }
                publish(this.messageContext, CUSTOM_CHATTER_COMPONENT_CHANNEL, message);
            }
        }
    }
   
    handleCreateFeedComment(event){
        let CommentBody = event.detail;
        let feedItemId; 
        const element = this.template.querySelector('.mainbody');
        console.log('parentLi',element);
    
        if (element) {
            feedItemId = element.dataset.id;
            console.log('Using parent feed id:', feedItemId);

            if(CommentBody && feedItemId){ 
                createFeedComment({CommentBody:CommentBody,FeedItemId:feedItemId})
                .then(reuslt=>{
                    console.log('result ', reuslt);
                    this.showToast('Success','success','Comment shared successfully');
                    const message = {
                        type: 'Refresh',
                        data: ''
                    }
                    publish(this.messageContext, CUSTOM_CHATTER_COMPONENT_CHANNEL,message);
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
            this.messageForModal.isEdit = false;
            this.messageForModal.Title = "Delete Post";
            this.messageForModal.Body = "Deleting this item permanently removes it. We're just making sure that's what you want.";
            this.messageForModal.Id = feedItemId;
            this.messageForModal.ButtonName = 'Delete';
            this.showmodal = true;
        }else if(e.target.label === 'Edit'){
            const feedItemElement = e.target.closest('[data-id]');
            const feedItemId = feedItemElement.dataset.id;
            console.log('Edit clicked feeditem id',feedItemId);
            this.messageForModal.Title = "Edit Post";
            this.messageForModal.isEdit = true;
            this.messageForModal.Body = this.feed.feedItem.Body;
            this.messageForModal.Id = feedItemId;
            this.messageForModal.ButtonName = 'Save';
            this.showmodal = true;
        }

    }

    handleFeedCommentAction(e){
        if(e.target.label ==='Delete'){
            const feedCommentElement = e.target.closest('[data-feed-comment-id]');
            const feedCommentId = feedCommentElement.dataset.feedCommentId;
            console.log('Delete clcked and feed comment id: ',feedCommentId);
            this.messageForModal.Title = "Delete Comment";
            this.messageForModal.Body = "Deleting this item permanently removes it. We're just making sure that's what you want.";
            this.messageForModal.Id = feedCommentId;
            this.messageForModal.ButtonName = 'Delete';
            this.showmodal = true;
            console.log('this.showmodal',this.showmodal);
            
        }
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

    get formattedTimeDifference() {
        return this.formatTimeDifference(this.feed.feedItem.CreatedDate);
    }

  
    formatTimeDifference(dateString) {
        try {
            console.log('dateString',dateString);
            
            const updatedDate = new Date(dateString);
            const currentDate = new Date();
            
            if (isNaN(updatedDate.getTime())) {
                return 'Invalid date';
            }
    
            const diffInMilliseconds = currentDate - updatedDate;
            const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
            const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
            const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
            const diffInMonths = Math.floor(diffInDays / 30);
            const diffInYears = Math.floor(diffInDays / 365);
    
            if (diffInMinutes < 1) {
                return 'Just now';
            } else if (diffInMinutes < 60) {
                return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
            } else if (diffInHours < 24) {
                return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
            } else if (diffInDays < 30) {
                return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
            } else if (diffInYears < 1) {
                return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
            } else {
                return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
            }
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Date unavailable';
        }
    }
    
    

}
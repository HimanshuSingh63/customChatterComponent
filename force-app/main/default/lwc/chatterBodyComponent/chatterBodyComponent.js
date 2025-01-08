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
    @track isLoading = false;
    subscription = null;
    messageFromPost;
    type = 'FeedComment';

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
    handleFeedAction(e){
        if(e.target.label === 'Delete'){
            const feedItemElement = e.target.closest('[data-id]');
            const feedItemId = feedItemElement.dataset.id;
            console.log('Delete clicked and div id',feedItemId);
            this.messageForModal.Title = "Post";
            this.messageForModal.Body = "Deleting this item permanently removes it. We're just making sure that's what you want.";
            this.messageForModal.feedItemId = feedItemId;
            this.showmodal = true;
        }
    }
    handleshowmodal() {

        console.log('Modal button clicked');
        this.showmodal = !this.showmodal;
        this.handleRefresh();
    }
    
    
    handleRefresh(){
        console.log('refresh clicked');
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
import { LightningElement,track,api,wire } from 'lwc';
import getRelatedFeeds from '@salesforce/apex/CustomChatterUtility.getRelatedFeeds';
import { refreshApex } from '@salesforce/apex';
import { subscribe, MessageContext } from 'lightning/messageService';
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
            this.messageForModal.Title = "Delete Post";
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
}
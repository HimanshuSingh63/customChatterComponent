import { LightningElement,track,api,wire } from 'lwc';
import getRelatedFeeds from '@salesforce/apex/RetrieveRelatedFeedRecords.getRelatedFeeds';
export default class ChatterBodyComponent extends LightningElement {
    @api
    currrentRecordId;
    @track feedData;
    isSelected = false;
    popOverVisible = false;
    @track inputValue = '';

    handleClick() {
        this.isSelected = !this.isSelected;
    }
    handlePopOver(){
        this.popOverVisible = !this.popOverVisible;
    }
    handleComment(){
        
    }
    @wire(getRelatedFeeds, { targetObjectId: '$currrentRecordId' })
    wiredFeeds({ error, data }) {
        if (data) {
            
            this.feedData = data;
            console.log('data##', JSON.stringify(this.feedData));
        }
        if (error) {
            console.log('error###', error);
        }
    }
}
import { LightningElement,track,api,wire } from 'lwc';
import getRelatedFeeds from '@salesforce/apex/RetrieveRelatedFeedRecords.getRelatedFeeds';
export default class ChatterBodyComponent extends LightningElement {
    @api
    currrentRecordId;
    @track feeds;
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
            console.log('data##', JSON.stringify(data));
            this.feeds = data;
        }
        if (error) {
            console.log('error###', error);
        }
    }
}
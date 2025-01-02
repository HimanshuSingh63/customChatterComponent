import { LightningElement,track,api,wire } from 'lwc';
import getRelatedFeeds from '@salesforce/apex/RetrieveRelatedFeedRecords.getRelatedFeeds';
export default class CustomChatterComponent extends LightningElement {
    @track inputValue = '';
    @api recordId;
    @track feeds;
    connectedCallback(){
        console.log('recordId', this.recordId); // Log the recordId to ensure it's set
    }
    @wire(getRelatedFeeds, { targetObjectId: '$recordId' })
    wiredFeeds({ error, data }) {
        if (data) {
            console.log('data###', JSON.stringify(data));
            this.feeds = data;
        }
        if (error) {
            console.log('error###', error);
        }
    }
}
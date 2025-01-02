import { LightningElement,track,api,wire } from 'lwc';
export default class CustomChatterComponent extends LightningElement {
    @track inputValue = '';
    @api recordId;
    
    connectedCallback(){
        console.log('recordId', this.recordId); // Log the recordId to ensure it's set
    }
}
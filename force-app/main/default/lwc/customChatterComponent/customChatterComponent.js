import { LightningElement,track } from 'lwc';
export default class CustomChatterComponent extends LightningElement {
    @track inputValue = '';
    @track showRichText = false;
    openRichText(){
        this.template.querySelector('c-post-component').handleInputClick();
        this.showRichText = true;
        
    }
    closeRichText(){
        this.showRichText = false;
    }
}
import { LightningElement,track,api } from 'lwc';

export default class PostComponent extends LightningElement {
   
    @track showRichText = false;
    @track richTextValue = '';

    get isShareDisable() {
        // Remove HTML tags, decode HTML entities, and trim whitespace
        const plainText = this.richTextValue
            ?.replace(/<[^>]*>/g, '') // Remove HTML tags
            ?.replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
            ?.trim(); // Remove leading/trailing whitespace
        return !plainText;
    }
    @api handleInputClick() {
        this.showRichText = true;
    }
    handleChange(e){
        this.richTextValue = e.target.value;
        const plainText = this.richTextValue
            ?.replace(/<[^>]*>/g, '') // Remove HTML tags
            ?.replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
            ?.trim();
        console.log('rich text value ', plainText);
    }
    handleAddUser() {
        const inputRichText = this.template.querySelector(
            'lightning-input-rich-text'
        );
        console.log('inputRichText: ',inputRichText);
        
        let format = inputRichText.getFormat();
    }
    handleAddEmoji(){
        console.log('add emoji clicked');
        
    }
    handleShare(){

        console.log('share clicled');
        
    }
    handleClose(){
        this.showRichText = false;
        this.dispatchEvent(new CustomEvent('close'));
    }
    
}
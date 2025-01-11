import { LightningElement,track,api,wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createFeedItem from '@salesforce/apex/CustomChatterUtility.createFeedItem';
import { publish, MessageContext } from 'lightning/messageService';
import CUSTOM_CHATTER_COMPONENT_CHANNEL from '@salesforce/messageChannel/Custom_Chatter_Component__c';
export default class PostComponent extends LightningElement {
    
    @api currentRecordId;
    @track showRichText = false;
    @track richTextValue = '';
    @api type = '';

    get isShareDisable() {
        // Remove HTML tags, decode HTML entities, and trim whitespace
        const plainText = this.richTextValue
            ?.replace(/<[^>]*>/g, '') // Remove HTML tags
            ?.replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
            ?.trim(); // Remove leading/trailing whitespace
        return !plainText;
    }

    @wire(MessageContext)
    messageContext;

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
        console.log('share clicked currentRecordId ',this.currentRecordId,
            'richTextValue ',this.richTextValue,
            'type ',this.type
        );
        if(this.type === 'FeedItem' ){
            if(this.currentRecordId && this.richTextValue){
                    createFeedItem({Body:this.richTextValue,ParentId:this.currentRecordId})
                    .then(result=>{
                        console.log('result ', result);
                        this.showToast('Success','success','Post shared successfully');
                        publish(this.messageContext, CUSTOM_CHATTER_COMPONENT_CHANNEL, {});
                    })
                    .catch(error=>{
                        console.log('error ',error.body.message);
                        this.showToast('Error','Error',error.body.message);
                    });
                    this.handleClose();
            }
        }else if(this.type == 'FeedComment'){
            let value = this.richTextValue ? this.richTextValue : 'okook';
                const event = new CustomEvent("createfeedcomment", { detail: value});
                this.dispatchEvent(event);
                this.handleClose();

            }
        
    }
    handleClose(){
        this.showRichText = false;
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
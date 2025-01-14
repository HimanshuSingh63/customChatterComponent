import { LightningElement,track,api,wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createFeedItem from '@salesforce/apex/CustomChatterUtility.createFeedItem';
import { publish, MessageContext } from 'lightning/messageService';
import CUSTOM_CHATTER_COMPONENT_CHANNEL from '@salesforce/messageChannel/Custom_Chatter_Component__c';
export default class PostComponent extends LightningElement {
    uploadedFiles;
    @api currentRecordId;
    @track showRichText = false;
    @track richTextValue = '';
    @api type = '';
    @api showShare = false;
    
    @api placeholder; // This will receive the placeholder text from parent

    get inputPlaceholder() {
        return this.placeholder || 'Share an update...'; 
    }

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
        console.log('rich text value ', this.richTextValue);
        
        const plainText = this.richTextValue
            ?.replace(/<[^>]*>/g, '') // Remove HTML tags
            ?.replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
            ?.trim();
        console.log('palin text value ', plainText);
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
    handleInputClick(){
        this.showRichText = true;
    }
    handleFilesProcessed(){
        console.log('files processed');
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
            let value = this.richTextValue ? this.richTextValue : '';
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
    // Parent component handler
    handleFileAdded(event) {
        const { file, allFiles } = event.detail;
        this.uploadedFiles=event.detail.allFiles;
        console.log('New file added:', file.filename);
        console.log('All files:', JSON.stringify(this.uploadedFile));
        // Handle the file data as needed
    }

    handleFileRemoved(event) {
        const { filename, allFiles } = event.detail;
        this.uploadedFiles = event.detail.allFiles;
        console.log('File removed:', filename);
        console.log('Remaining files:', allFiles);
    }
    handleRemoveFile(event){
        console.log(event.target);
        const fileName = event.target.dataset.id;
        
        console.log('clickied file name',fileName);
        this.template.querySelector('c-file-uploader').removeFile(fileName);
        // Handle the file data as needed
    }
}   
import { LightningElement,api } from 'lwc';
import deleteRecord from '@salesforce/apex/CustomChatterUtility.deleteRecord';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class ModalComponent extends LightningElement {
    @api message;
    connectedCallback(){
        console.log('message',JSON.stringify(this.message));
    }
    closeModal(){
        this.dispatchEvent(new CustomEvent('close'));
    }
    handleDelete(){
        console.log('this.message',this.message.feedItemId);
        deleteRecord({recordId:this.message.feedItemId})
        .then(result=>{
            console.log('result',result);
            this.dispatchEvent(new CustomEvent('delete'));
            const event = new ShowToastEvent({
                title: 'Success',
                message: `${message.Title} deleted successfully`,
                variant: 'success',
            });
            this.dispatchEvent(event);
        }) 
        .catch(error=>{
            console.log('error',error);    
        })
    }
}
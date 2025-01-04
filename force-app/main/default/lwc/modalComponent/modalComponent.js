import { LightningElement,api } from 'lwc';
import deleteFeedItem from '@salesforce/apex/CustomChatterUtility.deleteFeedItem';
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
        deleteFeedItem({feedItemId:this.message.feedItemId})
        .then(result=>{
            console.log('result',result);
            this.dispatchEvent(new CustomEvent('delete'));
        }) 
    }
}
import { LightningElement,api } from 'lwc';
import deleteRecord from '@salesforce/apex/CustomChatterUtility.deleteRecord';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class ModalComponent extends LightningElement {
    @api message;
    connectedCallback(){
        console.log('message in modal component',JSON.stringify(this.message));
    }

    handleOnClick(event){
        if(event.target.Name === 'Delete'){
            console.log('this.message',this.message.Id);
            if(this.message.Id){
                deleteRecord({recordId:this.message.Id})
                .then(result=>{
                    console.log('result',result);
                    this.dispatchEvent(new CustomEvent('delete',{detail:
                        {buttonName: 'Delete'}
                    }));
                    const message = `${this.message.Title} deleted successfully`;
                    this.showtoast('Success',message,'success');

                }).catch(error=>{
                    console.log('error message from mmodal',error.body.message);   
                    this.showtoast('Error',error.body.message,'error');
                })
            }  
        }else if (event.target.Name === 'Close') {
            this.dispatchEvent(new CustomEvent('close',{detail:
                {buttonName: 'Close'}
            }));
        }else if (event.target.Name === 'Cancel') {
            this.dispatchEvent(new CustomEvent('close',{detail:
                {buttonName: 'Cancel'}
            }));
        }
    }

    showtoast(title,message,variant){
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }
}
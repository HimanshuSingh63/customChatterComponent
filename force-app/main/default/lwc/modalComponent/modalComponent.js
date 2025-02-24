import { LightningElement,api ,track} from 'lwc';
import deleteRecord from '@salesforce/apex/CustomChatterUtility.deleteRecord';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class ModalComponent extends LightningElement {

    formats = [
        'font',
        'size',
        'bold',
        'italic',
        'underline',
        'strike',
        'list',
        'indent',
        'align',
        'link',
        'clean',
    ];

    property;
    openFileUploader = false;
    @track uploadedFiles;

    @api message;
    connectedCallback(){
        console.log('message in modal component',JSON.stringify(this.message));
    }

    handleOnClick(event){
        console.log('handle on click in modal');
        
        if(event.target.value === 'Delete'){
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
        }else if (event.target.value === 'Close') {
            
            this.dispatchEvent(new CustomEvent('close',{detail:
                {buttonName: 'Close'}
            }));
        }else if (event.target.value === 'Cancel') {
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
    handleChange(event){
        console.log('handle change');
        let velue = event.target.value;
        console.log('value',velue);
    }

    handleAttachFile(){
        this.property = 'Attach File';
        this.openFileUploader = true;
    }

    handleCloseFileModal(){
        this.openFileUploader = false;
    }
    handleRemoveFile(event){
        console.log(event.target);
        const fileId = event.target.dataset.id;
        console.log('fileId out of filter', fileId);
        
        this.uploadedFiles = this.uploadedFiles.filter(file => 
            file.Id !== fileId)
        console.log('uploadedFiles ', JSON.stringify(this.uploadedFiles));
    }

    handleSelectedFiles(event) {
        console.log('event.detail ', JSON.stringify(event.detail));
        
        this.openFileUploader = false;
        const { type, data } = event.detail;
        const selectedFiles = data;
        // Create a new array combining existing and new files
        const allFiles = [...(this.uploadedFiles || []), ...selectedFiles];
        
        // Remove duplicates based on file name and size
        this.uploadedFiles = allFiles.filter((file, index, self) =>
            index === self.findIndex((f) => (
                f.Name === file.Name && f.Size === file.Size && f.Id === file.Id
            ))
        );
    }
}
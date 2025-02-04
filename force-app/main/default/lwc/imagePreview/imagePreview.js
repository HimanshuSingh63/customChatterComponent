import { LightningElement,api } from 'lwc';

export default class ImagePreview extends LightningElement {

    openPreview=false;
    imageUrl='';
    imageData;
    
    @api
    get attachmentData(){
        return this.imageData;
    }

    set attachmentData(value){
        console.log('value in Image', JSON.stringify(value));
        this.imageData=value;
        this.imageUrl='/sfc/servlet.shepherd/version/download/'+value.VersionId;
    }

    showPreview(){
        this.openPreview=true;
    }
    closePreview(){
        this.openPreview=false;
    }

    handleDownload(){
        window.open(this.imageUrl, '_blank');
    }

}
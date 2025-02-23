import { LightningElement,api,track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class ImagePreview extends NavigationMixin(LightningElement) {

    openPreview=false;
    imageUrl='';
    @track fileData;

    @api
    get attachmentData(){
        return this.imageData;
    }

    set attachmentData(value){
        console.log('value in Image', JSON.stringify(value));
        this.fileData=value;
        this.imageUrl='/sfc/servlet.shepherd/version/download/'+value.VersionId;
    }

    get isImage() {
        const imageTypes = ['PNG', 'JPG', 'JPEG', 'GIF'];
        return imageTypes.includes(this.fileData?.Type.toUpperCase());
    }
    
    get fileUrl() {
        return `/sfc/servlet.shepherd/document/download/${this.fileData.ContentDocumentId}`;
    }

    get filePreviewUrl() {
        return `/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=${this.fileData.VersionId}&operationContext=CHATTER&contentId=${this.fileData.ContentDocumentId}`;
    }
    
    get fileTitle() {
        return this.fileData.Title ? this.fileData.Title : 'No Title';
    }

    get fileIconName() {
        const fileType = this.fileData.Type.toLowerCase();
        if (fileType === 'pdf') {
            return 'doctype:pdf';
        } else if (fileType === 'excel') {
            return 'doctype:excel';
        } else if (fileType === 'word') {
            return 'doctype:word';
        } else if (fileType === 'powerpoint') {
            return 'doctype:ppt';
        } else if (fileType === 'png' || fileType === 'jpg' || fileType === 'jpeg' || fileType === 'gif') {
            return 'doctype:image';
        } else {
            return 'doctype:attachment';
        }
    }

    showPreview(){
        this.openPreview=true;
    }
    closePreview(){
        this.openPreview=false;
    }

    handleDownload() {
        if (this.fileData.Type.toLowerCase() === 'pdf') {
            this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: `/sfc/servlet.shepherd/document/download/${this.fileData.ContentDocumentId}`
                }
            }, true); // The true parameter forces download instead of navigation
        } else {
            window.open(this.imageUrl, '_blank');
        }
    }

}
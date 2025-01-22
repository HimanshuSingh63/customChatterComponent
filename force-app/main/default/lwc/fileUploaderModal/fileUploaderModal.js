import { LightningElement,wire,api,track } from 'lwc';
import getFiles from '@salesforce/apex/CustomChatterUtility.getFiles';

export default class FileUploaderModal extends LightningElement {
    openFileUploader = false;
    activeTab = 'Recent';
    @track _selectedFilesCount = 0;
    @track selectedFiles = [];
    wiredFilesResults;
    @track filesData;

    @wire(getFiles)
    wiredFiles(result) {
        this.wiredFilesResults = result;
        const { data, error } = result;
        if (data) {
            this.filesData = data;
            console.log('filesData', JSON.stringify(this.filesData));
        }
        if (error) {
            console.log('error while getting files', error);
        }
    }

    get navItems() {
        return [
            { label: 'Recent', name: 'Recent' },
            { label: 'Owned by Me', name: 'OwnedByMe' },
            { label: 'Shared with Me', name: 'SharedwithMe' },
        ].map(item => ({
            ...item,
            cssClass: `slds-nav-vertical__item${item.name === this.activeTab ? ' slds-is-active' : ''}`
        }));
    }

    closeModal(){
        this.dispatchEvent(new CustomEvent('close'));
    }

    get selectedFilesCount() {
        return this._selectedFilesCount;
    }

    get isInsertButtonDisabled() {
        return this.selectedFilesCount === 0;
    }

    handleSelectionChange(event) {
        const {selectedFiles,selectedCount} = event.detail;
        this._selectedFilesCount = selectedCount;
        this.selectedFiles = selectedFiles;
    }

    handleNavClick(event) {
        this.activeTab = event.currentTarget.dataset.name;
    }

    handleFilesInsert(){
        this.dispatchEvent(new CustomEvent('insert', {
            detail: {
                selectedFiles: this.selectedFiles,
                selectedCount: this._selectedFilesCount
            }
        }));
        
        this._selectedFilesCount = 0;
        this.selectedFiles = [];
    }

}
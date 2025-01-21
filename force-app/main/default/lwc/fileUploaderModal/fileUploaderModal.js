import { LightningElement,wire,api,track } from 'lwc';

export default class FileUploaderModal extends LightningElement {
    openFileUploader = false;
    activeTab = 'Recent';
    @track _selectedFilesCount = 0;
    @track selectedFiles = [];
    
    files = [
        {
            id: '1',
            name: 'RTA_Image_173714496729',
            date: '18-Jan-2025',
            size: '9KB',
            type: 'jpg',
            fileIconName: 'doctype:image'
        },
        {
            id: '2',
            name: 'Low pixal',
            date: '18-Jan-2025',
            size: '9KB',
            type: 'jpg',
            fileIconName: 'doctype:image'
        },
        {
            id: '3',
            name: '2025_01_16 - Spring\'25 Flow Update - Keyboard Shortcnrkhnrkjnbfekvekjni io3i',
            date: '15-Jan-2025',
            size: '867KB',
            type: 'pdf',
            fileIconName: 'doctype:pdf'
        },
        {
            id: '4',
            name: 'Low pixal',
            date: '14-Jan-2025',
            size: '9KB',
            type: 'jpg',
            fileIconName: 'doctype:image'
        },
        {
            id: '5',
            name: 'edf_logo',
            date: '18-Dec-2024',
            size: '19KB',
            type: 'png',
            fileIconName: 'doctype:image'
        }
    ];

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

    @api
    handleOpenFileUploader() {
        this.openFileUploader = true;
    }
    closeModal(){
        this.openFileUploader = false;
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
        
        this.openFileUploader = false
        this._selectedFilesCount = 0;
        this.selectedFiles = [];
    }

}
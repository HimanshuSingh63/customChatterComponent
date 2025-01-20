import { LightningElement,wire,api,track } from 'lwc';

export default class FileUploaderModal extends LightningElement {
    openFileUploader = false;
    activeTab = 'Recent';
    @track _selectedFilesCount = 0;

    
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

    handleSelectionChange(event) {
        console.log('handleSelectionChange event:', event); // Updated log statement
        this._selectedFilesCount = event.detail.selectedCount;
        console.log(' this._selectedFilesCount'+ this._selectedFilesCount);
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

    handleNavClick(event) {
        this.activeTab = event.currentTarget.dataset.name;
    }
   
    
}
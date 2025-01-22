import { LightningElement, api, track } from 'lwc';

export default class FilesDataComponent extends LightningElement {

    @track isSelected = false;
    @track showTooltip = false;
    @track processedFiles = [];
    @track selectedFilesCount = 0;

    connectedCallback(){
        console.log('filesDataComponent connectedCallback'+JSON.stringify(this.processedFiles));
    }

    @api
    get filesData(){
        console.log('filesData getter'+JSON.stringify(this.processedFiles));
        
        return this.processedFiles;
    }
    set filesData(value) {
        if (value) {
            this.processedFiles = value.map(file => ({
                ...file,
                selected: false,
                buttonIconName: 'utility:add',
                buttonIconVariant: 'border-filled'
            }));
        }
    }

    handleCheckboxChange(event) {
        const fileId = event.currentTarget.dataset.id;
        
        this.processedFiles = this.processedFiles.map(file => {
            if (file.Id === fileId) {
                const newSelected = !file.selected;
                return {
                    ...file,
                    selected: newSelected,
                    buttonIconName: newSelected ? 'utility:check' : 'utility:add',
                    buttonIconVariant: newSelected ? 'brand' : 'border-filled'
                };
            }
            return file;
        });

        // Update the count of selected files
        // Update count and notify parent
        this.selectedFilesCount = this.processedFiles.filter(file => file.selected).length;
        console.log('selectedFilesCount: ' + this.selectedFilesCount);
        
        this.dispatchEvent(new CustomEvent('selectionchange', {
            detail: {
                selectedFiles: this.processedFiles.filter(file => file.selected),
                selectedCount: this.selectedFilesCount
            }
        }));
    }
}
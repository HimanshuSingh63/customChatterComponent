// fileUploader.js
import { LightningElement, api, track } from 'lwc';

export default class FileUploader extends LightningElement {
    @api recordId;
    @track isLoading = false;
    @track uploadedFiles = []; // To keep track of all uploaded files

    get acceptedFormats() {
        return '.pdf,.png,.jpg,.jpeg';
    }

    handleClick(event) {
        event.preventDefault();
        event.stopPropagation();
        
        const fileInput = this.template.querySelector('input[type="file"]');
        if (fileInput) {
            fileInput.click();
        }
    }

    handleFileChange(event) {
        try {
            const files = event.target.files;
            if (!files || files.length === 0) return;
            
            this.isLoading = true;
            console.log('Files selected:', files.length);

            [...files].forEach(file => {
                // Check if file already exists
                const fileExists = this.uploadedFiles.some(f => 
                    f.filename === file.name && 
                    f.size === file.size
                );

                if (fileExists) {
                    console.log('File already exists:', file.name);
                    return; // Skip this file
                }

                console.log('Processing file:', file.name);
                const reader = new FileReader();

                reader.onload = (() => {
                    return (e) => {
                        try {
                            console.log('File read successfully');
                            const base64 = e.target.result.split(',')[1];
                            
                            const fileData = {
                                filename: file.name,
                                base64: base64,
                                recordId: this.recordId,
                                type: file.type,
                                size: file.size,
                                uploadedDate: new Date().toLocaleString()
                            };

                            // Add to uploaded files array
                            this.uploadedFiles = [...this.uploadedFiles, fileData];

                            // Dispatch event for the new file
                            this.dispatchEvent(new CustomEvent('fileadded', {
                                detail: {
                                    file: fileData,
                                    allFiles: this.uploadedFiles
                                }
                            }));

                        } catch (error) {
                            console.error('Error in onload:', error);
                        }
                    };
                })();

                reader.onerror = (() => {
                    return (error) => {
                        console.error('Error reading file:', error);
                        this.isLoading = false;
                    };
                })();

                // Read the file
                try {
                    reader.readAsDataURL(file);
                } catch (error) {
                    console.error('Error in readAsDataURL:', error);
                }
            });

            // Reset input
            event.target.value = '';
            this.isLoading = false;
            console.log('updated files'+this.uploadedFiles);
            
        } catch (error) {
            console.error('Main error handler:', error);
            this.isLoading = false;
        }
    }

    // Method to remove a file
    @api
    removeFile(filename) {
        this.uploadedFiles = this.uploadedFiles.filter(file => file.filename !== filename);
        
        // Dispatch event for file removal
        this.dispatchEvent(new CustomEvent('fileremoved', {
            detail: {
                filename: filename,
                allFiles: this.uploadedFiles
            }
        }));
    }

    // Method to clear all files
    @api
    clearAllFiles() {
        this.uploadedFiles = [];
        this.dispatchEvent(new CustomEvent('filescleared'));
    }

    // Get current files
    @api
    get currentFiles() {
        return this.uploadedFiles;
    }
}
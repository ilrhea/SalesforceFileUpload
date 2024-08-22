// csvFileUploader.js
import { LightningElement, track } from 'lwc';
import saveFile from '@salesforce/apex/CSVFileUploaderController.saveTheFile';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class FileUploader extends LightningElement {
    @track fileName = '';
    @track fileContent;
    @track csvHeaders = [];
    @track csvData = [];
    @track isUploadDisabled = true;

    handleFilesChange(event) {
        const file = event.target.files[0];
        if (file) {
            this.fileName = file.name;
            const reader = new FileReader();
            
            reader.onload = () => {
                const fileContent = reader.result;
                this.parseCSV(fileContent); // Parse and display CSV content
                this.isUploadDisabled = false;
            };

            reader.readAsText(file); // Reads the file as text
        }
    }

    parseCSV(fileContent) {
        const rows = fileContent.split('\n');
        this.csvHeaders = rows[0].split(',').map(header => header.trim());
        this.csvData = rows.slice(1).map((row, index) => ({
            id: `row-${index}-${row.split(',')[0].trim()}`, // Generate a unique id for each row
            cells: row.split(',').map(cell => cell.trim())
        }));
    }

    uploadFile() {
        if (this.fileName && this.fileContent) {
            saveFile({ fileName: this.fileName, base64Data: btoa(this.fileContent), contentType: 'text/csv' })
                .then(() => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'File uploaded successfully!',
                            variant: 'success',
                        }),
                    );
                    this.resetUploader();
                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error uploading file',
                            message: error.body.message,
                            variant: 'error',
                        }),
                    );
                });
        } else {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please select a file to upload.',
                    variant: 'error',
                }),
            );
        }
    }

    cancelUpload() {
        this.resetUploader();
    }

    resetUploader() {
        this.fileName = '';
        this.fileContent = null;
        this.csvHeaders = [];
        this.csvData = [];
        this.isUploadDisabled = true;

        // Clear the file input
        const fileInput = this.template.querySelector('lightning-input[type="file"]');
        if (fileInput) {
            fileInput.value = null;
        }
    }
}

// csvFileUploader.js
import { LightningElement, track } from 'lwc';
import saveFile from '@salesforce/apex/CSVFileUploaderController.saveTheFile';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class FileUploader extends LightningElement {
    @track fileName = '';
    @track fileContent;
    @track csvHeaders = [];
    @track csvData = [];

    handleFilesChange(event) {
        const file = event.target.files[0];
        if (file) {
            this.fileName = file.name;
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileContent = reader.result;
                this.parseCSV(fileContent);
                const base64Index = fileContent.indexOf('base64,') + 'base64,'.length;
                this.fileContent = fileContent.substring(base64Index);
            };
            reader.readAsText(file); // Read file as text to parse CSV
        }
    }

    parseCSV(fileContent) {
        const rows = fileContent.split('\n').map(row => row.trim()); // Split by newline and trim spaces
        this.csvHeaders = rows[0].split(',').map(header => header.trim()); // First row as headers
    
        this.csvData = rows.slice(1).map((row, index) => ({
            id: `row-${index}`,
            cells: row.split(',').map(cell => cell.trim()) // Split each row into cells
        }));
    }

    uploadFile() {
        if (this.fileName && this.fileContent) {
            saveFile({ fileName: this.fileName, base64Data: this.fileContent, contentType: 'text/csv' })
                .then(() => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'File uploaded successfully!',
                            variant: 'success',
                        }),
                    );
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
}
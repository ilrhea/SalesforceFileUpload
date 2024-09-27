import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import saveTheFile from '@salesforce/apex/CSVFileUploaderController.saveTheFile';
import saveSurf from '@salesforce/apex/CSVFileUploaderController.saveSurf';

export default class CsvFileUploader extends LightningElement {
    @track fileData;
    @track columns = [];
    @track isUploadable = true;
    @track devices = [];

    fileName;
    fileContent;
    inputKey = Date.now();
    xlsxInitialized = false;
    surfName; 

    handleFileChange(event) {
        const file = event.target.files[0];
        if (file) {
            this.fileName = file.name;
            const reader = new FileReader();
            reader.onload = () => {
                this.fileContent = reader.result;
                if (file.name.endsWith('.csv')) {
                    this.parseCSV(this.fileContent);
                }
            };
            if (file.name.endsWith('.csv')) {
                reader.readAsText(file);
            }
        }
    }

    parseCSV(csv) {
        console.log('Parsing CSV content:', csv);
        const lines = csv.split('\n');
        console.log('CSV lines:', lines);

        if (lines.length === 0) {
            console.error('CSV is empty');
            return;
        }

        const headers = lines[0].split(',');
        console.log('CSV headers:', headers);

        this.columns = headers.map(header => ({
            label: header.trim(),
            fieldName: header.trim(),
            type: 'text'
        }));

        this.fileData = lines.slice(1).map((line, index) => {
            const values = line.split(',');
            let row = { id: index };
            headers.forEach((header, i) => {
                row[header.trim()] = values[i] ? values[i].trim() : '';
            });
            this.devices.push(row[headers[0].trim()]);
            console.log('device: '+row[headers[0].trim()]);
            return row;
        });

        const name = this.fileName.split('_');
        this.surfName = name[0];
        console.log('File name: '+this.surfName);
        
        this.isUploadable = false;
    }

    handleUpload() {
        if (this.fileData) {
            saveSurf({surfName: this.surfName})
            saveTheFile({ fileName: this.fileName, fileContent: this.fileContent })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'File uploaded and displayed successfully',
                        variant: 'success',
                    }),
                );
                this.handleCancel();
            })
            .catch(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error uploading file',
                        message: 'Error uploading file',
                        variant: 'error',
                    }),
                );
            });
        } else {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Please select a file to upload',
                    variant: 'error',
                }),
            );
        }
    }

    handleCancel() {
        this.fileName = '';
        this.fileContent = null;
        this.fileData = null;
        this.columns = [];
        this.inputKey = Date.now();
        this.isUploadable = true;
    }
}
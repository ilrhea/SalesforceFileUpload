import { LightningElement, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import XLSX_LIB from '@salesforce/resourceUrl/XLSX';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import saveTheFile from '@salesforce/apex/CSVFileUploaderController.saveTheFile';

export default class ExcelFileUpload extends LightningElement {
    @track fileHeaders = [];
    @track fileData = [];
    @track isModalOpen = false; // Track if modal is open
    xlsxLibLoaded = false;
    isDisabled=true;
    fileName; 
    
    renderedCallback() {
        // Ensure the XLSX library is loaded only once
        if (this.xlsxLibLoaded) {
            return;
        }
        loadScript(this, XLSX_LIB)
            .then(() => {
                this.xlsxLibLoaded = true;
                console.log('XLSX library loaded successfully');
            })
            .catch(error => {
                console.error('Error loading XLSX library', error);
            });
    }

    handleSubmit() {
        // Prepare the data to be saved
        if(this.fileData){
            saveTheFile({ fileName: this.fileName , fileData: this.fileData })
            .then(()=>{
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'File has been saved successfully',
                        variant: 'success'
                    })
                );
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error saving file',
                        message: error.body.message,
                        variant: 'error'
                    })
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

    handleFileChange(event) {
        if (!this.xlsxLibLoaded) {
            console.error('XLSX library is not loaded');
            return;
        }

        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            this.fileName = file.name;
            console.log('File Name: '+this.fileName);
            reader.onload = (e) => {
                const binaryString = e.target.result;
                try {
                    // Use the XLSX library correctly after it is loaded
                    const workbook = window.XLSX.read(binaryString, { type: 'binary' });

                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = window.XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], { header: 1 });

                    // Set the file headers
                    this.fileHeaders = worksheet[0];

                    // Prepare the data with unique IDs for rows and cells
                    this.fileData = worksheet.slice(1).map((row, rowIndex) => {
                        return {
                            id: 'row-' + rowIndex, // Generate a unique id for each row
                            cells: row.map((cell, cellIndex) => {
                                return {
                                    id: 'cell-' + rowIndex + '-' + cellIndex, // Generate a unique id for each cell
                                    value: cell
                                };
                            })
                        };
                    });
                    
                } catch (error) {
                    console.error('Error processing Excel file', error);
                }
            };
            reader.readAsBinaryString(file);
        }
        this.isDisabled = false;
        this.fileData = event.target.files[0];
        this.fileName = event.target.files[0].name;
    }

    handleCancel() {
        this.template.querySelector('lightning-input').value = null;
        this.fileHeaders = [];
        this.fileData = [];
        this.isModalOpen = false;
        this.isDisabled = true; 
    }

    // Open modal
    handleOpenModal() {
        this.isModalOpen = true;
    }

    // Close modal
    handleCloseModal() {
        this.isModalOpen = false;
    }
}
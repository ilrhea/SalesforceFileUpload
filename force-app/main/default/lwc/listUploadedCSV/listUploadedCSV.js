import { LightningElement, track, wire } from 'lwc';
import getCSVFiles from '@salesforce/apex/CSVFileController.getUploadedCSVFiles';
import deleteFile from '@salesforce/apex/CSVFileController.deleteFile'
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ListUploadedCSV extends LightningElement {
    @track csvFiles;
    columns = [
        { label: 'File Name', fieldName: 'Title', type: 'text' },
        { label: 'Created Date', fieldName: 'CreatedDate', type: 'date' },
        { label: 'View', type: 'button', typeAttributes: { label: 'View', name: 'view', variant: 'brand' }},
        { label: 'Delete', type: 'button', typeAttributes: { label: 'Delete', name: 'delete', variant: 'destructive' }},
    ];

    @wire(getCSVFiles)
    wiredFiles({ error, data }) {
        if (data) {
            this.csvFiles = data;
        } else if (error) {
            this.csvFiles = undefined;
            console.error('Error fetching CSV files', error);
        }
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        if (actionName === 'view') {
            this.template.querySelector('c-csv-viewer-modal').openModal(row.Id, row.Title);
        } else if (actionName === 'delete') {
            this.deleteCSVFile(row.Id);
        }
    }

    deleteCSVFile(fileId) {
        deleteFile({ contentVersionId: fileId })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'File deleted successfully!',
                        variant: 'success',
                    })
                );
                // Refresh the file list after deletion
                return refreshApex(this.wiredFiles);
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting file',
                        message: error.body.message,
                        variant: 'error',
                    })
                );
            });
    }
}

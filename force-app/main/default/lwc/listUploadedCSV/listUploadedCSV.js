import { LightningElement, track, wire } from 'lwc';
import getCSVFiles from '@salesforce/apex/CSVFileController.getUploadedCSVFiles';
import deleteFile from '@salesforce/apex/CSVFileController.deleteFile'; 
import processExcelFile from '@salesforce/apex/CSVFileUploaderController.processExcelFile'
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex'; 
import getDownloadLink from '@salesforce/apex/CSVFileController.getDownloadLink';

export default class ListUploadedCSV extends LightningElement {
        @track csvFiles;
        
        @track columns = [
            { label: 'Title', fieldName: 'Title', type: 'text' },
            { label: 'Created Date', fieldName: 'CreatedDate', type: 'date' },
            { label: 'Download', fieldName: 'Download', type: 'url', typeAttributes: { label: { fieldName: 'Title' }, target: '_blank' } },
            { label: 'View', type: 'button', typeAttributes: { label: 'View', name: 'view', variant: 'brand' }},
            { label: 'Action' , type: 'button' , typeAttributes : {label: 'Export Surf' , name: 'exportFile', variant : 'brand'}},
            { label: 'Delete', type: 'button', typeAttributes: { label: 'Delete', name: 'delete', variant: 'destructive' }},
        ];
    
        @wire(getCSVFiles)
        wiredCSVFiles({ error, data }) {
            if (data) {
                this.csvFiles = data.map(file => {
                    return {
                        Id: file.Id,
                        Title: file.Title,
                        CreatedDate: file.CreatedDate,
                        DownloadLink: '',
                    };
                });
                this.csvFiles.forEach(file => {
                    console.log('file.Id: ', file.Id);
                    getDownloadLink({ contentVersionId: file.Id })
                    .then((result) => {
                        file.Download = result;
                        this.csvFiles = [...this.csvFiles]; // Refresh the array to trigger reactivity
                    })  
                    .catch(error => {
                        console.error('Error fetching download link:', error);
                    }); 
                }); 

            } else if (error) {
                this.csvFiles = undefined;
                console.error('Error fetching CSV files:', error);
            }
        }

        viewFile(id){
            const selectedEvent = new CustomEvent("view", {
                detail: {
                    contentVersionId: id
                }
                
            });
            this.dispatchEvent(selectedEvent);
            console.log('view file');
        }

        exportFile(id){
            console.log('export file');
            processExcelFile({ contentVersionId: id })
            .then((resultId) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'File has been exported successfully',
                        variant: 'success'
                    })
                );
                console.log('====================');
                console.log('resultId: ', resultId);
            })
            .catch(error => {    
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error exporting file',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
        }

        deleteFile(id){
            if(id!= null){
                deleteFile({ contentVersionId: id })
                .then(() => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'File has been deleted successfully',
                            variant: 'success'
                        })
                    );
                    return refreshApex(this.csvFiles);
                })
                .catch(error => {    
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error deleting file',
                            message: error.body.message,
                            variant: 'error'
                        })
                    );
                }    
                );
            }else{
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'File Id is missing',
                        variant: 'error',
                    }),
                );
            }
        }

        handleRowAction(event) {
            const actionName = event.detail.action.name;
            const row = event.detail.row;

            switch (actionName) {
                case 'view':
                    this.viewFile(row.Id);
                    break;
                case 'exportFile':
                    this.exportFile(row.Id);
                    break;
                case 'delete':
                    this.deleteFile(row.Id);
                    break;
                default:
                    break;
            }
        }
}
import { LightningElement, api, track } from 'lwc';
import getFileContent from '@salesforce/apex/CSVFileController.getFileContent';

export default class CsvViewerModal extends LightningElement {
    @api isOpen = false;
    @api recordId;
    @track fileName;
    @track csvData;
    @track columns = [];
    @track modalStyle = '';

    originalWidth;
    originalHeight;
    originalMouseX;
    originalMouseY;

    @api openModal(recordId, fileName) {
        this.isOpen = true;
        this.fileName = fileName;
        this.recordId = recordId;
        this.loadFileContent();
        this.modalStyle = 'width: 50vw; height: 50vh;';
    }

    closeModal() {
        this.isOpen = false;
    }

    loadFileContent() {
        getFileContent({ contentVersionId: this.recordId })
            .then(result => {
                const allRows = result.split('\n');
                const headers = allRows[0].split(',').map(header => ({ label: header.trim(), fieldName: header.trim(), type: 'text' }));
                const rows = allRows.slice(1).map((row, index) => ({
                    Id: index,
                    ...row.split(',').reduce((acc, val, idx) => {
                        acc[headers[idx].fieldName] = val.trim();
                        return acc;
                    }, {})
                }));

                this.columns = headers;
                this.csvData = rows;
            })
            .catch(error => {
                console.error('Error loading CSV content', error);
            });
    }

    startResize(event) {
        this.originalWidth = this.template.querySelector('.resizable').offsetWidth;
        this.originalHeight = this.template.querySelector('.resizable').offsetHeight;
        this.originalMouseX = event.clientX;
        this.originalMouseY = event.clientY;

        window.addEventListener('mousemove', this.doResize);
        window.addEventListener('mouseup', this.stopResize);
    }

    doResize = (event) => {
        const width = this.originalWidth + (event.clientX - this.originalMouseX);
        const height = this.originalHeight + (event.clientY - this.originalMouseY);

        this.modalStyle = `width: ${width}px; height: ${height}px;`;
    }

    stopResize = () => {
        window.removeEventListener('mousemove', this.doResize);
        window.removeEventListener('mouseup', this.stopResize);
    }
}
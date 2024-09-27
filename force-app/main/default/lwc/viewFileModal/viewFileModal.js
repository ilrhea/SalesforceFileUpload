import { LightningElement } from 'lwc';
import { api, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import PapaParse from '@salesforce/resourceUrl/papaparse';

export default class ViewFileModal extends LightningElement {
    
    @api fileContent;
    @track csvData;
    @track isModalOpen = false;

    connectedCallback() {
        loadScript(this, PapaParse)
            .then(() => {
                this.parseCsv();
            })
            .catch(error => {
                console.error('Error loading PapaParse', error);
            });
    }

    parseCsv() {
        if (this.fileContent) {
            Papa.parse(this.fileContent, {
                header: true,
                complete: (results) => {
                    this.csvData = results.data;
                },
                error: (error) => {
                    console.error('Error parsing CSV', error);
                }
            });
        }
    }

    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    get hasData() {
        return this.csvData && this.csvData.length > 0;
    }
    

}
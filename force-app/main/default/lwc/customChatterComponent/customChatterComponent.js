import { LightningElement,track } from 'lwc';
export default class CustomChatterComponent extends LightningElement {
    isSelected = false;
    @track inputValue = '';

    handleClick() {
        this.isSelected = !this.isSelected;
    }

}
import { LightningElement,track } from 'lwc';

export default class ChatterBodyComponent extends LightningElement {
    isSelected = false;
    @track inputValue = '';

    handleClick() {
        this.isSelected = !this.isSelected;
    }
}
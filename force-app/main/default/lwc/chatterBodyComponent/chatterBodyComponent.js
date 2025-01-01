import { LightningElement,track } from 'lwc';

export default class ChatterBodyComponent extends LightningElement {
    isSelected = false;
    popOverVisible = false;
    @track inputValue = '';

    handleClick() {
        this.isSelected = !this.isSelected;
    }
    handlePopOver(){
        this.popOverVisible = !this.popOverVisible;
    }
    handleComment(){
        
    }
}
import { LightningElement,api,track } from 'lwc';

export default class FilesDataComponent extends LightningElement {
    @api filesData;
    @track isSelected = false;
    @track showTooltip = false;

    get buttonClass() {
        return `slds-button ${this.isSelected ? 'slds-button_brand' : 'slds-button_neutral'}`;
    }

    get iconName() {
        return this.isSelected ? 'utility:check' : 'utility:add';
    }

    get iconVariant() {
        return this.isSelected ? 'brand' : 'default';
    }

    handleClick() {
        this.isSelected = !this.isSelected;
    }
    handleMouseOver() {
        // Only show tooltip if text is truncated
        const nameElement = this.template.querySelector('.slds-truncate');
        if (nameElement.offsetWidth < nameElement.scrollWidth) {
            this.showTooltip = true;
        }
    }
    handleMouseLeave() {
        this.showTooltip = false;
    }


}   
import { LightningElement,track } from 'lwc';

export default class PollComponent extends LightningElement {
    @track question = '';
    options = [
        {id:'1',label: 'Option 1' },
        {id:'2',label: 'Option 2'}
    ]

    get isAskDisabled(){
        return !this.question.trim();
    }
    handleQuestionChange(e){
        this.question = e.target.value;
    }
    handleAddOption(){
        this.options = [...this.options,{
            id: (this.options.length + 1).toString(), 
            label: 'Option '+(this.options.length + 1)
        }];
    }
    handleRemoveOption(e) {
        const optionId = e.target.dataset.id;
       
        this.options = this.options
            .filter(option => option.id !== optionId)
            .map((option, index) => ({
                id: (index + 1).toString(), 
                label: 'Option ' + (index + 1)
            }));
    }
}
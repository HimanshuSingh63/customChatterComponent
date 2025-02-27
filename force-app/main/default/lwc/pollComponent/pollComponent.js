import { LightningElement,track,api } from 'lwc';
import  { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createPoll from '@salesforce/apex/CustomChatterUtility.createPoll';
export default class PollComponent extends LightningElement {
    @track question = '';
    @track isLoading = false;  
    options = [
        {id:'1',label: 'Option 1',value:''},
        {id:'2',label: 'Option 2',value:''}
    ]
    connectedCallback(){
        console.log('recordId: ',this.recordId);
    }

    get isAskDisabled(){
        return !(this.question.trim() && this.options.every(option => option.value && option.value.trim()) );
    }
    handleQuestionChange(e){
        this.question = e.target.value;
    }
    handleOptionChange(e) {
        const optionId = e.target.dataset.id; 
        const enteredValue = e.target.value; 
    
        this.options = this.options.map(option => 
            option.id === optionId 
                ? { ...option, value: enteredValue } 
                : option 
        );
        console.log(JSON.stringify(this.options));  
        
    }
    
    handleAddOption(){
        this.options = [...this.options,{
            id: (this.options.length + 1).toString(), 
            label: 'Option '+(this.options.length + 1),
            value:''
        }];
    }
    handleRemoveOption(e) {
        const optionId = e.target.dataset.id;
       
        this.options = this.options
            .filter(option => option.id !== optionId)
            .map((option, index) => ({
                id: (index + 1).toString(), 
                label: 'Option ' + (index + 1),
                value: option.value
            }));
    }
    handleAsk() {
        if (this.options.length < 2) {
            this.showToast('Error', 'error', 'dismissable', 'Please add at least two options');
            return;
        }
        
        // Set loading state to true
        this.isLoading = true;
        
        // Extract just the values from options array
        const optionValues = this.options.map(option => option.value);
        
        const pollData = {
            question: this.question,
            options: optionValues,
            recordId: this.recordId
        };
        
        createPoll({ input: JSON.stringify(pollData) })
            .then(result => {
                this.question = '';
                this.options = this.options.map(option => ({
                    ...option,
                    value: ''
                }));
                this.showToast('Successful!', 'success', 'dismissable', 'Poll created successfully');
            })
            .catch(error => {
                console.error('Error creating poll:', error);
                this.showToast('Error!', 'error', 'dismissable', 'Error occurred while creating poll');
            })
            .finally(() => {
                // Set loading state to false when done
                this.isLoading = false;
            });
    }
    showToast(title,variant,mode,message) {
        const event = new ShowToastEvent({
            title: title,
            variant: variant,
            mode: mode,
            message: message
        });
        this.dispatchEvent(event);
    }
}
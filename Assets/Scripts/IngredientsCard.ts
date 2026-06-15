@component
export class NewScript extends BaseScriptComponent {
    
    @input
    titleText: Text; // this becomes a slot in the Inspector

    onAwake() {
        this.titleText.text = "Ingredients";

    }
}

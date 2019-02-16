export class TextView {
  // private elInputField: HTMLInputElement;

  public constructor() {
    // this.elInputField = <HTMLInputElement> document.getElementsByClassName('input-field')[0];
  }

  public subscribeOnTextChangeEvent(textChangeCallback: (value: string) => void) {
    // this.elInputField.addEventListener('input', () => {
    //   textChangeCallback(this.elInputField.value || '');
    // });
  }

  public setText(value: string): void {
    // this.elInputField.value = value;
  }
}

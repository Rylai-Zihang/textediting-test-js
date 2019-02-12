import { TextDiffCalculator } from 'diff-calculator';
import { TextWebStoreClient } from 'communication';
import { TextView } from './TextView';

export class TextManager {
  private text: string = '';
  private diffCalculator: TextDiffCalculator;
  private textStoreClient: TextWebStoreClient;
  private view: TextView;

  public constructor(view: TextView,
                     textStoreClient: TextWebStoreClient,
                     diffCalculator: TextDiffCalculator) {
    this.diffCalculator = diffCalculator;
    this.textStoreClient = textStoreClient;
    this.view = view;

    view.subscribeOnTextChangeEvent((text: string) => {
      this.onTextChanged(text);
    });

    textStoreClient.subscribeOnTextChangeEvent((text: string) => {
      this.onTextReceived(text);
    });
  }

  private onTextChanged(newText: string): void {
    const diff = this.diffCalculator.calculate(this.text, newText);
    debugger;
    this.text = newText;
    this.textStoreClient.sendDiff(diff);
  }

  private onTextReceived(newText: string): void {
    this.text = newText;
    this.view.setText(newText);
  }
}

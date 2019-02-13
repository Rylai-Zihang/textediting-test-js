import { TextDiffCalculator, TextDiff } from 'diff-calculator';
import { WebClient, TextEntry } from 'communication';
import { TextView } from './TextView';

export class TextManager {
  private text: string = '';
  private diffCalculator: TextDiffCalculator;
  private connection: WebClient;
  private view: TextView;

  public constructor(view: TextView,
                     connection: WebClient,
                     diffCalculator: TextDiffCalculator) {
    this.diffCalculator = diffCalculator;
    this.connection = connection;
    this.view = view;

    view.subscribeOnTextChangeEvent((text: string) => {
      this.onTextChanged(text);
    });

    connection.onReceivedMessage((message: any) => {
      this.onReceivedTextUpdate(message);
    });
  }

  private onTextChanged(newText: string): void {
    const diff: TextDiff = TextDiff.calculate(this.text, newText);

    // // TODO: Do not update text before response received.
    this.text = newText;

    // // TODO: Fail if text version is old one. Discard diff and disable sending.
    const diffStr: string = JSON.stringify(diff);
    this.connection.send(diffStr);
  }

  private onReceivedTextUpdate(message: any): void {
    try {
      const diff: TextDiff = TextDiff.parse(message);
      this.text = diff.apply(this.text);
    } catch (e) {
      console.error(`Failed to apply diff received from server.
        Error: ${e.message}
        Diff: ${message}`);
    }

    // // TODO: Do not erase current text on view, but raise an error and disable sending diff.
    // //       User have to reload page
    this.view.setText(this.text);
  }
}

import { WebServer, WebClient, TextEntry } from 'communication';
import { TextRepository } from './TextRepository';
import { TextDiff, TextDiffCalculator } from 'diff-calculator';

export class TextUpdater {

  private currentText: TextEntry;
  private connections: WebClient[] = [];
  private diffCalculator: TextDiffCalculator = new TextDiffCalculator();

  public constructor(private server: WebServer, private textRepository: TextRepository) {
  }

  public init(): Promise<void> {
    return this.textRepository.getText()
      .then((text: TextEntry | null) => {
        if (!text) {
          return this.textRepository.initText()
            .then(() => {
              return this.init();
            });
        }

        this.currentText = text;
        this.initNewConnectionListening();
      });
  }

  private initNewConnectionListening(): void {
    this.server.onConnectionAcquired((connection: WebClient): void => {

      this.onAcceptedConnection(connection);

      connection.onReceivedMessage((message) => {
        this.onReceivedTextUpdate(message, connection);
      });
    });
  }

  private onAcceptedConnection(connection: WebClient): void {
    this.connections.push(connection);

    const diff: TextDiff = this.diffCalculator.calculate('', this.currentText.text);

    connection.send(diff.toString())
        .catch((error: Error) => {
          console.error(`Failed to send text to newly connected client: ${error.message}`);
        });
  }

  private onReceivedTextUpdate(message: any, from: WebClient): void {
    try {
      const diff: TextDiff = TextDiff.parse(message);
      this.currentText.text = this.diffCalculator.apply(this.currentText.text, diff);
    } catch (e) {
      console.error(`Failed to apply diff received from server.
        Error: ${e.message}
        Diff: ${message}`);
    }

    this.textRepository.updateText(this.currentText)
      .then(() => {
        this.connections.forEach((connection: WebClient) => {
          // TODO: Do not just resend message to all clients
          if (connection !== from) {
            connection.send(message);
          }
        });
      })
      .catch((error: Error) => {
        console.error(`Failed to save text to DB: ${error.message}`);
      });
  }
}

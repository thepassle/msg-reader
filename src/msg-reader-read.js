import { LitElement, html, css } from 'lit';

class MsgReaderRead extends LitElement {
  static properties = { mailResult: {type: Object} };
  static styles = [
    css`
      :host {
        text-align: left;
        font-size: 18px;
        padding: 40px;
        overflow: auto;
      }

      dl {
        display: flex;
        flex-direction: column;
      }

      dt {
        font-weight: bold;
        flex-basis: 10%;
      }

      dd {
        flex: 1;
        margin-left: 0;
      }

      .definition-wrapper {
        display: flex;
        margin-bottom: 12px;
      }

      pre {
        white-space: pre-wrap;
        font-family: sans-serif;
      }

      .body {
        background: white;
        border-radius: 10px;
        padding: 20px;
        box-shadow: rgba(0,0,0,.5) 0px 4px 12px;
      }

      .attachments {
        flex-direction: column;
      }
    `
  ];

  connectedCallback() {
    super.connectedCallback();
    this.mailResult = window.opener.mailResult;
  }

  render() {
    if(!this.mailResult) return html`Loading...`;

    let body;

    if(this.mailResult.bodyHTML) {
      body = document.createElement('pre');
      body.innerHTML = this.mailResult.bodyHTML;

      Array.from(body.querySelectorAll('img')).forEach(img => {
        const attachment = this.mailResult.attachments.find(attachment => img.src.slice(4, attachment.name.length + 4) === attachment.name);
        img.src = `data:image/png;base64,${btoa(String.fromCharCode.apply(null, attachment.content))}`;
      });
    }

    if(this.mailResult.body) {
      body = document.createElement('pre');
      body.textContent = this.mailResult.body;
    }

    const attachments = this.mailResult.attachments.map(attachment => {
      const fileUrl = URL.createObjectURL(new File([attachment.content], attachment.fileName, {type: attachment.mimeType || 'application/octet-stream'}));
      return html`<a download href="${fileUrl}">${attachment.fileName}</a>`;
    });
    
    return html`
      <h1>${this.mailResult.subject}</h1>
      <dl>
        <div class="definition-wrapper">
          <dt>From</dt>
          <dd>${this.mailResult.from}</dd>
        </div>
        <div class="definition-wrapper">
          <dt>To</dt>
          <dd>${this.mailResult.to}</dd>
        </div>
        <div class="definition-wrapper">
          <dt>Date</dt>
          <dd>${this.mailResult.date.toLocaleString()}</dd>
        </div>
        <div class="definition-wrapper attachments">
          <dt>Attachments</dt>
          <dd>
            <ul>
              ${attachments.map(a => html`<li>${a}</li>`)}
            </ul>
          </dd>
        </div>
      </dl>
      <div class="body">
        ${body}
      </div>
    `;
  }
}

customElements.define('msg-reader-read', MsgReaderRead);
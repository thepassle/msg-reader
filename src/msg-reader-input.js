import { LitElement, html, css } from 'lit';
import { upload } from './upload-icon.svg';
import { formatEmail, parseHeaders } from './utils.js';

const visuallyHidden = css`
  position: fixed !important;
  /* keep it on viewport */
  top: 0px !important;
  left: 0px !important;
  /* give it non-zero size, VoiceOver on Safari requires at least 2 pixels
     before allowing buttons to be activated. */
  width: 4px !important;
  height: 4px !important;
  /* visually hide it with overflow and opacity */
  opacity: 0 !important;
  overflow: hidden !important;
  /* remove any margin or padding */
  border: none !important;
  margin: 0 !important;
  padding: 0 !important;
  /* ensure no other style sets display to none */
  display: block !important;
  visibility: visible !important;
  pointer-events: none !important;
`;

class MsgReaderInput extends LitElement {
  static properties = { highlighted: { type: Boolean }};

  static styles = [ 
    css`
      :host {
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: center;
      }

      label {
        display: flex;
        width: 335px;
        height: 335px;
        background: white;
        border-radius: 10px;
        justify-content: center;
        align-items: center;
      }

      label svg {
        width: 100px;
        height: 100px;
        margin-bottom: 16px;
        fill: skyblue;
      }

      .stripey-border {
        display: flex;
        width: 90%;
        height: 90%;

        flex-direction: column;
        justify-content: center;
        align-items: center;
        border: solid 3px skyblue;
        border-style: dashed;
        border-radius: 10px;
      }

      input:focus ~ label,
      input:active ~ label {
        border-radius: 10px;
        box-shadow: skyblue 0px 0px 12px, skyblue 0px 0px 0px 1px;
        outline: 1px;
        transform: scale(1.05);
      }
      
      label {
        transition: all 0.1s linear;
      }

      label:hover {
        transform: scale(1.05);
        cursor: pointer;
      }
      
      .highlighted {
        transform: scale(1.05);
        border-radius: 10px;
        box-shadow: skyblue 0px 0px 12px, skyblue 0px 0px 0px 1px;
        outline: 1px;
      }

      input {
        ${visuallyHidden}
      }
    `
  ];

  firstUpdated() {
    this.inputEl = this.shadowRoot.querySelector('input');
    this.inputEl.focus();
  }

  highlight(e, value) {
    e.preventDefault();
    e.stopPropagation();
    this.highlighted = value;
  }

  drop(e) {
    this.highlight(e, false);
    this.parseFile(e?.dataTransfer?.files?.[0]);
  }

  change(e) {
    const files = this.inputEl.files;

    // @TODO multiple, this can just be a foreach?
    this.parseFile(files[0]);
    this.inputEl.value = null;
  }

  parseFile(file) {
    if(!file.name.endsWith('.msg')) throw new Error('File is not a .msg file');
    
    const fileReader = new FileReader();
    fileReader.onload = function (evt) {
      const buffer = evt.target.result;
      const msgReader = new MSGReader(buffer);
      const fileData = msgReader.getFileData();

      if (!fileData.error) {
        const headers = parseHeaders(fileData.headers);
        const mailResult = {};

        mailResult.from = formatEmail(fileData.senderName, fileData.senderEmail);
        mailResult.to = fileData.recipients.map(recipient => formatEmail(recipient.name, recipient.email)).join(', ');
        mailResult.date = headers.Date ? new Date(headers.Date) : '-';
        mailResult.subject = fileData.subject;
        mailResult.body = fileData.body;
        mailResult.bodyHTML = fileData.bodyHTML;
        mailResult.attachments = fileData?.attachments?.map?.((_, i) => msgReader.getAttachment(i));

        window.mailResult = mailResult;

        const w = window.open('/read', '', "popup,width=800,height=850");
        w.onload = () => {
          w.document.title = mailResult.subject;
        }
      }
    }

    fileReader.readAsArrayBuffer(file);
  }

  render() {
    return html`
      <form>
        <input 
          id="upload"
          type="file" 
          multiple 
          accept=".msg"
          
          @change=${this.change}
        ></input>
        <label 
          class=${this.highlighted ? 'highlighted' : ''}
          @dragenter=${(e) => this.highlight(e, true)}
          @dragover=${(e) => this.highlight(e, true)}
          
          @dragleave=${(e) => this.highlight(e, false)}
          @drop=${this.drop}

          for="upload"
        >
          <div class="stripey-border">
            ${upload}
            Upload a .msg file
          </div>
        </label>
      </form>
    `;
  }
}

customElements.define('msg-reader-input', MsgReaderInput);
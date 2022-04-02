import { LitElement, html, css } from 'lit';
import { Router } from '@vaadin/router';
import './msg-reader-input.js';
import './msg-reader-read.js';

const insideInstalledApp = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
const isHomePage = () => window.location.pathname === '/';

function forceSize() {
  const width = 505;
  const height = 440;

  if(insideInstalledApp() && isHomePage()) {
    window.resizeTo(width, height);
  }

  if(isHomePage()) {
    window.addEventListener('resize', () => {
      window.resizeTo(width, height)
    });
  }
}

forceSize();

class MsgReader extends LitElement {
  static styles = [
    css`
      :host {
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        font-size: calc(10px + 2vmin);
        color: #1a2b42;
        max-width: 960px;
        margin: 0 auto;
        text-align: center;
        background-color: var(--msg-reader-background-color);
      }

      main {
        display: flex;
        width: 100%;
        height: 100%;
      }
    `
  ]

  firstUpdated() {
    this.router = new Router(this.shadowRoot.getElementById('outlet'));
    this.router.setRoutes([
      {
        path: '/',
        component: 'msg-reader-input',
      },
      {
        path: '/read',
        component: 'msg-reader-read'
      }
    ]);
  }

  render() {
    return html`<main id="outlet"></main>`;
  }
}

customElements.define('msg-reader', MsgReader);
// ==== Kernelium HTML Tags ====

class MenuStripTag extends HTMLElement {
    constructor() {
        super();

        const shadow = this.attachShadow({ mode: "open" });

        shadow.innerHTML = `
            <style>
                div {
                  position: fixed;
                  top: 0;
                  left: 0;
                  right: 280px;
                  height: 30px;
                  background: #222222FF;
                  display: flex;
                  align-items: center;
                  padding: 0 8px;
                  gap: 8px;
                  z-index: 1200;
                  user-select: none;
                  box-sizing: border-box;
                }
            </style>

            <div>
                <slot></slot>
            </div>
        `;
    }
}

customElements.define("menu-strip", MenuStripTag);

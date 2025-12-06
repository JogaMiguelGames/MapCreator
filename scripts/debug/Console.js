const ConsoleDiv = createElement("div");
const ConsoleTopBar = createElement("header");
const ConsoleCommandInput = createElement("input");

const ConsoleTitle = createElement("h1");

ConsoleDiv.id = "Console";
ConsoleDiv.className = "Console";

ConsoleTitle.id = "ConsoleTitle";
ConsoleTitle.className = "ConsoleTitle";
ConsoleTitle.textContent = "Console";

ConsoleCommandInput.id = "ConsoleCommandInput";
ConsoleCommandInput.className = "ConsoleCommandInput";

ConsoleTopBar.appendChild(ConsoleTitle);
ConsoleDiv.appendChild(ConsoleTopBar);
ConsoleDiv.appendChild(ConsoleCommandInput);
// document.body.appendChild(ConsoleDiv);

ConsoleCommandInput.getElementById("commandLine").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    const command = this.value.trim();
    try {
      eval(command);
    } catch (error) {
      console.log(error);
    }
    this.value = "";
  }
});

import { MCL, Add } from '../../libs/mcl/Index.js';

window.updateIDInputFromSelection = function () {
  const input = MCL.Page.Elements.ID.Input;
  const selected = MCL.Model.Selected?.Object;

  if (!selected || !selected.userData?.id) {
    input.value = "";
    input.placeholder = "No object selected";
    return;
  }

  input.value = selected.userData.id;
};

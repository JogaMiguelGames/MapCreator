import { MCL, Add } from '../../libs/mcl/Index.js';

const IDInput = Page.Elements.ID.Input;
const ID = window.selectedObject3D.userData.id;

IDInput.value = ID;

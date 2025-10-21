// ===================== SAVE.JS =====================

// Reference to the save button
const saveButton = document.getElementById('saveButton');

// Flag to track unsaved changes
let hasUnsavedChanges = false;

// Function to mark that the map has been modified
function markMapAsChanged() {
    hasUnsavedChanges = true;
}

// Main function to save the map
function saveMap() {
    const mapData = {
        sceneColor: `#${scene.background.getHexString()}`,
        customFolders: window.customFolders || [], // save Cube List folders
        cubes: cubes.map(obj => {
            let type = 'cube';
            let color = '#ffffff';
            let textureData = null;

            // Detect object type
            if (obj.geometry === sphere_geometry) type = 'sphere';
            else if (obj.geometry === cylinder_geometry) type = 'cylinder';
            else if (obj.geometry === cone_geometry) type = 'cone';
            else if (obj.geometry === plane_geometry) type = 'plane';
            else if (obj.userData?.isCameraModel) type = 'camera';

            color = `#${obj.material?.color?.getHexString() || 'ffffff'}`;
            if (obj.material?.map?.image?.src) textureData = obj.material.map.image.src;

            return {
                type,
                name: obj.name || 'Object',
                position: { x: obj.position?.x || 0, y: obj.position?.y || 0, z: obj.position?.z || 0 },
                scale: { x: obj.scale?.x || 1, y: obj.scale?.y || 1, z: obj.scale?.z || 1 },
                rotation: { x: obj.rotation?.x || 0, y: obj.rotation?.y || 0, z: obj.rotation?.z || 0 },
                color,
                texture: textureData
            };
        })
    };

    // Convert to formatted JSON
    const json = JSON.stringify(mapData, null, 2);

    // Create automatic download
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'map1.map';
    a.click();
    URL.revokeObjectURL(a.href);

    // Reset unsaved changes flag
    hasUnsavedChanges = false;
}

// Event listener for Save button
saveButton?.addEventListener('click', saveMap);

// Warn user if they try to leave with unsaved changes
window.addEventListener('beforeunload', function (e) {
    if (!hasUnsavedChanges) return;

    // Standard message; modern browsers may ignore custom text
    const message = "You have unsaved changes. Do you want to save before leaving?";
    e.preventDefault();
    e.returnValue = message;
    return message;
});

// Optional: ask to save on unload (closing tab)
window.addEventListener('unload', function () {
    if (hasUnsavedChanges) {
        const shouldSave = confirm("You have unsaved changes. Do you want to save before leaving?");
        if (shouldSave) {
            saveMap();
        }
    }
});

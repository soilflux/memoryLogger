const fileInput = document.getElementById('fileInputButton');
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    state.fileName = event.target.files[0].name;
    localStorage.setItem(config.fileNameKey, state.fileName);

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const rawFileContent = e.target.result;
            localStorage.setItem(config.storageKey, rawFileContent);
        };
        reader.readAsText(file);
        fileLoaded();
    }
});

const useSavedTextButton = document.getElementById('useSavedTextButton');
useSavedTextButton.addEventListener('mousedown', () => {
    useSavedText(config.storageKey);
});

function useSavedText() {
    fileLoaded();
}

function downloadTextFile() {
    const rawFileContent = localStorage.getItem(config.storageKey);
    const blob = new Blob([rawFileContent], { type: 'text/plain' });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;

    a.download = state.fileName;

    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}
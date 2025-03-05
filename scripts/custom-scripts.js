document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelectorAll('pre code').forEach((codeBlock) => {
        const button = document.createElement('button');
        button.className = 'copy-code-button';
        button.textContent = 'Copy Code';

        codeBlock.parentNode.insertBefore(button, codeBlock);

        button.addEventListener('click', () => {
            const code = codeBlock.innerText;

            navigator.clipboard.writeText(code).then(() => {
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = 'Copy Code';
                }, 2000);
            }).catch((err) => {
                console.error('Failed to copy code', err);
            });
        });
    });
});


document.addEventListener("DOMContentLoaded", () => {
    const socket = io();
    socket.on('session-expired', (data) => {
        location.reload();
    })
});
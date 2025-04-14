function displayDateTime(){
    var currentDateTime = new Date();
    var formattedDateTime = currentDateTime.toLocaleString();
    document.getElementById('datetime').textContent = formattedDateTime;
}
displayDateTime();
setInterval(displayDateTime, 1000);
function incrementVisitorCount() {
    let count = parseInt(localStorage.getItem('visitorCount')) || 0;
    count++;
    localStorage.setItem('visitorCount', count);
    document.getElementById('visitorCount').textContent = count;
}
window.onload = function() {
    incrementVisitorCount();
};
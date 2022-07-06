let camera_button = document.querySelector("#start-camera");
let video = document.querySelector("#video");
let click_button = document.querySelector("#click-photo");
let canvas = document.querySelector("#canvas");

camera_button.addEventListener('click', async function () {
    let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = stream;
});

click_button.addEventListener('click', function () {
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    let image_data_url = canvas.toDataURL('image/jpeg');
    const files = image_data_url
    console.log(files)
    const formData = new FormData()
    formData.append('image', files)

    fetch('/login', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            document.querySelector('#message').innerHTML = data.message;
        })
        .catch(error => {
            console.error(error)
        })
    // data url of the image
});
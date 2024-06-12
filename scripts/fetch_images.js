const axios = require('axios');
const fs = require('fs');
const path = require('path');

const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const USER_ID = process.env.INSTAGRAM_USER_ID;

const drivers = {
    "driver1": "Anthony Yorba",
    "driver2": "Tony Langston",
    "driver3": "Chris Statler",
    "driver4": "Daniel Bertholf"
};

const fetchImages = async () => {
    try {
        const response = await axios.get(`https://graph.instagram.com/${USER_ID}/media?fields=id,media_url,media_type,caption,timestamp&access_token=${ACCESS_TOKEN}`);
        const images = response.data.data;

        images.forEach(image => {
            if (image.media_type === 'IMAGE') {
                let driverId = Object.keys(drivers).find(key => image.caption && image.caption.includes(drivers[key]));
                if (driverId) {
                    const driverDir = path.join(__dirname, '..', 'images', 'drivers', driverId);
                    if (!fs.existsSync(driverDir)) {
                        fs.mkdirSync(driverDir, { recursive: true });
                    }
                    const imagePath = path.join(driverDir, `${image.id}.jpg`);
                    axios({
                        url: image.media_url,
                        responseType: 'stream',
                    }).then(response => {
                        response.data.pipe(fs.createWriteStream(imagePath));
                    });
                }
            }
        });
    } catch (error) {
        console.error('Error fetching images:', error);
    }
};

fetchImages();

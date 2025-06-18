const cloudinary = require('cloudinary').v2;
const fs = require('fs');

try {
    cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
} catch (error) {
    console.error("Cloudinary configuration failed:", error);
    throw new Error("Cloudinary configuration failed");
}

const uploadCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        console.log(response)
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return response;

    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        throw new Error("Failed to upload to Cloudinary");
    }
};

module.exports = { uploadCloudinary, cloudinary };
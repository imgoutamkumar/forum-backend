import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadFile = async (file, folder = "media") => {
  if (!file || !file.buffer) throw new Error("FILE_UPLOAD_FAILED");

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary error:", error);
          return reject(new Error("FILE_UPLOAD_FAILED"));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    );

    stream.end(file.buffer); // send the buffer to Cloudinary
  });
};


export const deleteUploadedFile = async (publicId) => {
    if(!publicId)
        return;
    try{
        await cloudinary.uploader.destroy(publicId);
        return true;
    }
    catch(error){
        throw new Error("FILE_DELETE_FAILED");
    }

};
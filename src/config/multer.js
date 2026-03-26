import multer from "multer";
import path from "path";

// this if you want to store in local directory
const storage = multer.diskStorage({

    destination:(req,file,cb)=>{
        cb(null,"uploads/");
    },

    filename:(req,file,cb)=>{
        const unique = Date.now()+"-"+Math.random();
        cb(null,unique+path.extname(file.originalname));
    }

});

export const upload = multer({
    storage:multer.memoryStorage(), // keeps file in memory,
    limits: { fileSize: 10 * 1024 * 1024 }, 
});
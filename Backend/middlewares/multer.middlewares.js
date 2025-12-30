import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Check if the file is an image or video
    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');

    if (isImage || isVideo) {
        // We can attach a custom property to the file object to use later
        file.category = isImage ? 'IMAGE' : 'VIDEO';
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type! Only images and videos are allowed.'), false);
    }
};

export const singleUpload = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
}).single("file");

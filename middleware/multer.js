import multer from 'multer';

const storage = multer.diskStorage({
    destination:(req, file, cb) =>{
        cb(null, `Uploads/`);
    }
})

const fileFilter =(req, file, cb) =>{
    if (file.mimetype.startsWith('image/')) {


        cb(null, true)
    } else{
        cb(new error('invalid file type, only images are allowed!'), false);
    }
};

const upload = multer({storage, fileFilter})

export default upload
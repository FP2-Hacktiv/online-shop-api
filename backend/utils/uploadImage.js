import { getStorage, ref, uploadBytesResumable } from "firebase/storage";

async function uploadImage(file, quantity) {
  const storageFB = getStorage();

  await signInWithEmailAndPassword(auth, process.env.FIREBASE_USER, process.env.FIREBASE_AUTH)

  if (quantity === 'single') {
      const dateTime = Date.now();
      const fileName = `images/${dateTime}`
      const storageRef = ref(storageFB, fileName)
      const metadata = {
          contentType: file.type,
      }
      await uploadBytesResumable(storageRef, file.buffer, metadata);
      const imageURL = `https://storage.googleapis.com/${process.env.STORAGE_BUCKET}/${fileName}`;
      return imageURL;
  }
  buildImage
  if (quantity === 'multiple') {
      for(let i=0; i < file.images.length; i++) {
          const dateTime = Date.now();
          const fileName = `images/${dateTime}`
          const storageRef = ref(storageFB, fileName)
          const metadata = {
              contentType: file.images[i].mimetype,
          }

          const saveImage = await Image.create({imageUrl: fileName});
          file.item.imageId.push({_id: saveImage._id});
          await file.item.save();

          await uploadBytesResumable(storageRef, file.images[i].buffer, metadata);
      }
      return;
  }
}

export default uploadImage;
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';

export const uploadImage = async (file: File): Promise<string> => {
  if (!file) throw new Error("No file provided");

  const filename = `${Date.now()}_${file.name}`; // Preserve original name with timestamp to avoid collisions
  const storageRef = ref(storage, `post-images/${filename}`);

  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

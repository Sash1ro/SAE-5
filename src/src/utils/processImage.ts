import { Platform } from "react-native";

export const processImageToForm = async (formData : FormData, imageUri : string) => {
    const filename = imageUri.split('/').pop() || 'upload.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    if (Platform.OS === 'web') {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append('image', blob, filename);
    } else {
        formData.append('image', {
            uri: imageUri,
            name: filename,
            type,
        } as any);
    }

    return formData ?? null
}
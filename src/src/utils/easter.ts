import { FriendProfile } from "@/app/(tabs)/altDetail"

export const isEaster = (t : string) => {
    return t == "Lilian Schou"
}

export const getEasterFriend = () : FriendProfile => {
    return {
        id: "GAY8000",
        name: "Lilian Schou",
        nickname: "Schoufleur",
        status: "GAY",
        role: "Vector",
        avatarUrl: "https://media.discordapp.net/attachments/1380217109560168522/1575925503490134168/IMG_0035.jpeg?ex=6b0b0e7f&is=6b09bcff&hm=fdad52ad7580cc52663fee0a31a3055ec00b805b1789249281861b36a7cd2b55&format=webp",
        altPhotoUrl: "https://cdn.discordapp.com/avatars/1182364341106901105/8f0c842ff3f0a3160bf59010f71208bb.webp?size=240",
        bio: "Un ami orianté objet ",
        quote: "Salut, c'est Frank Lebeauf !",
        level: 67
    } as FriendProfile;
}
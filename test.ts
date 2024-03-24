import { fetchTranscript } from "youtube-fetch-transcript";
import { YoutubeTranscriptReader } from "./src/youtube";


// console.log(await new YoutubeTranscriptReader().loadData("i_mAHOhpBSA"));
console.log([..."https://www.youtube.com/watch?v=i_mAHOhpBSA&t=3s".matchAll(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi)][0][1]);
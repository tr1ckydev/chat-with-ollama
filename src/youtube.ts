import { Document, type BaseReader, type Metadata } from "llamaindex";
import { fetchTranscript } from "youtube-fetch-transcript";

export class YoutubeTranscriptReader implements BaseReader {
    async loadData(url: string): Promise<Document<Metadata>[]> {
        const video_id = [...url.matchAll(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi)][0][1];
        const segments = await fetchTranscript(video_id);
        let text = "";
        segments?.forEach(segment => text += segment.text + " ");
        return [new Document({ text, id_: `https://www.youtube.com/watch?v=${video_id}` })];
    }
}
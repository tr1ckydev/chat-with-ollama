import * as beerio from "beerio";
import { Document, SimpleDirectoryReader, TextFileReader } from "llamaindex";
import { YoutubeTranscriptReader } from "./youtube";

export default async function (data_type: string, data_path: string) {
    switch (data_type) {
        case "Folder path":
            return new SimpleDirectoryReader().loadData({
                directoryPath: data_path,
                defaultReader: new TextFileReader(),
            });
        case "Website URL":
            const $ = await beerio.fromURL(data_path);
            $("script").remove();
            const text = $("body").text();
            return [new Document({ text, id_: data_path })];
        case "Youtube video":
            return new YoutubeTranscriptReader().loadData(data_path);
        default:
            return new SimpleDirectoryReader().loadData({
                directoryPath: data_path,
                defaultReader: new TextFileReader()
            });
    }
}
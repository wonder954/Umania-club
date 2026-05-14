// lib/searchJraOfficialVideo.ts

type YoutubeVideo = {
    videoId: string;
    title: string;
    channelTitle: string;
};

export async function searchJraOfficialVideo(query: string): Promise<YoutubeVideo | null> {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
        console.warn("YOUTUBE_API_KEY is not set");
        return null;
    }

    const url =
        "https://www.googleapis.com/youtube/v3/search" +
        `?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(query)}` +
        `&key=${apiKey}`;

    const res = await fetch(url);

    // レスポンスを生で確認
    const text = await res.text();
    console.log("YouTube API raw response:", text);

    if (!res.ok) {
        console.warn("YouTube API error", text);
        return null;
    }

    const data = JSON.parse(text);
    console.log("YouTube API parsed:", data);

    const items = data.items as any[] | undefined;
    if (!items || items.length === 0) return null;

    const official =
        items.find((v) =>
            v.snippet?.channelTitle?.includes("JRA公式")
        ) ?? items[0];

    return {
        videoId: official.id.videoId,
        title: official.snippet.title,
        channelTitle: official.snippet.channelTitle,
    };
}
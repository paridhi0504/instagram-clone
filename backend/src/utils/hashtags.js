export function extractHashtags(caption) {
    if (!caption) return [];

    const found =
        caption.toLowerCase().match(/#[\p{L}\p{N}_]{1,50}/gu) || [];

    return [...new Set(found.map((t) => t.slice(1)))].slice(0, 30);
}
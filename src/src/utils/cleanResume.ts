export function cleanResume(text: string): string {
    if (!text) return "No resume";
    let cleanText = text;
    cleanText = cleanText.split('---')[0];
    cleanText = cleanText.split(/___|\bLinks\s*:/i)[0];
    cleanText = cleanText.replace(/^(From\s+[a-zA-Z0-9\s]+:\s*)/i, '');
    cleanText = cleanText.replace(/^(Source:\s*[a-zA-Z0-9\s]+)\r?\n/i, '');
    cleanText = cleanText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    cleanText = cleanText.replace(/\*\*/g, '').replace(/\*/g, '');
    cleanText = cleanText.replace(/\[[^\]]*\]/g, '');
    return cleanText.trim();
}
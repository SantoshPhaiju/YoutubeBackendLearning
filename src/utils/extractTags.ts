import keyword_extractor from 'keyword-extractor';

export default function extractTags(title: string, description: string): string[] {
    const text = title + ' ' + description;

    const keywords = keyword_extractor.extract(text, {
        language: 'english',
        remove_digits: true,
        return_changed_case: true,
        remove_duplicates: true,
    });

    // optional: filter short/noisy words
    return keywords.filter((word) => word.length > 2);
}

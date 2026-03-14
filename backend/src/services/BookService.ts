import axios from 'axios';

interface GoogleBookVolumeInfo {
    title: string;
    authors: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    imageLinks?: {
        thumbnail: string;
    };
    categories?: string[];
}

export const fetchBookDetails = async (isbn: string) => {
    try {
        // 1. Try Google Books API
        try {
            const response = await axios.get(
                `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
            );

            if (response.data.totalItems > 0) {
                const volumeInfo = response.data.items[0].volumeInfo as GoogleBookVolumeInfo;
                return {
                    title: volumeInfo.title,
                    author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
                    publisher: volumeInfo.publisher || 'Unknown Publisher',
                    publishedYear: volumeInfo.publishedDate
                        ? parseInt(volumeInfo.publishedDate.substring(0, 4))
                        : null,
                    genre: volumeInfo.categories ? volumeInfo.categories[0] : 'General',
                    coverImageUrl: volumeInfo.imageLinks?.thumbnail || null,
                };
            }
        } catch (e) {
            console.error(`Google Books API failed for ${isbn}:`, e);
        }

        // 2. Fallback to OpenLibrary API
        console.log(`Google Books failed/skipped for ${isbn}, trying OpenLibrary...`);
        try {
            const olResponse = await axios.get(
                `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`
            );

            const bookData = olResponse.data[`ISBN:${isbn}`];
            if (bookData) {
                return {
                    title: bookData.title,
                    author: bookData.authors ? bookData.authors.map((a: any) => a.name).join(', ') : 'Unknown Author',
                    publisher: bookData.publishers ? bookData.publishers.map((p: any) => p.name).join(', ') : 'Unknown Publisher',
                    publishedYear: bookData.publish_date ? parseInt(bookData.publish_date.slice(-4)) : null,
                    genre: 'General',
                    coverImageUrl: bookData.cover ? bookData.cover.medium : null
                };
            }
        } catch (e) {
            console.error('OpenLibrary failed', e);
        }

        // 3. Fallback to scraping isbnsearch.org
        console.log(`OpenLibrary failed for ${isbn}, trying isbnsearch.org...`);
        try {
            const scrapeResponse = await axios.get(`https://isbnsearch.org/isbn/${isbn}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            const html = scrapeResponse.data;

            const titleMatch = html.match(/<h1>(.*?)<\/h1>/);

            if (titleMatch && titleMatch[1]) {
                return {
                    title: titleMatch[1].trim(),
                    author: 'Unknown Author',
                    publisher: 'Unknown Publisher',
                    publishedYear: new Date().getFullYear(),
                    genre: 'General',
                    coverImageUrl: null
                };
            }
        } catch (e) {
            console.error('ISBN Search scraping failed', e);
        }

        // 4. Manual Fallback
        const manualMap: Record<string, any> = {
            // Add other hardcoded books here if needed
        };

        if (manualMap[isbn]) {
            return manualMap[isbn];
        }

        return null;

    } catch (error: any) {
        console.error('Error fetching book details:', error);
        throw new Error(`Failed to fetch book details: ${error.message}`);
    }
};

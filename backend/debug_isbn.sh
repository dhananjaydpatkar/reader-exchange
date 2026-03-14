#!/bin/bash
ISBN="9780241667828"
echo "Testing ISBN Lookup for: $ISBN"

# Assuming we can test via the addBook endpoint or if we need a direct service test.
# Since we need auth to reach the endpoint, I'll reuse the auth flow from previous scripts.
# Or better, I can try to write a small TS script to invoke the service function directly if I can import it.
# But `tsx` makes that easy.

cat <<EOF > test_isbn_service.ts
import { fetchBookDetails } from './src/services/BookService';

async function main() {
    const isbn = "$ISBN";
    console.log(\`Fetching details for \${isbn}...\`);
    try {
        const details = await fetchBookDetails(isbn);
        if (details) {
            console.log('Success:', JSON.stringify(details, null, 2));
        } else {
            console.error('Failed: Book not found.');
            process.exit(1);
        }
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
EOF

npx tsx test_isbn_service.ts
rm test_isbn_service.ts

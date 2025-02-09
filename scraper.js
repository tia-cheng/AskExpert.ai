const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;

// Add delay utility function for rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function scrapeExperts() {
    try {
        // Add user agent and headers to make request more browser-like
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        };

        console.log('Starting to scrape intro.co/experts...');
        const { data } = await axios.get('https://intro.co/marketplace', { headers });
        const $ = cheerio.load(data);
        
        const experts = [];
        
        // Updated selectors based on actual HTML structure
        // Note: You'll need to adjust these selectors after inspecting the actual page
        $('.expert-card, .expert-profile, .expert-container').each(async (index, element) => {
            // Add rate limiting delay between processing each expert
            await delay(1000); // 1 second delay between processing each expert
            
            try {
                const name = $(element).find('.expert-name, .profile-name, h3').text().trim();
                const specialty = $(element).find('.expert-specialty, .profile-specialty, .role').text().trim();
                const bio = $(element).find('.expert-bio, .profile-bio, .description').text().trim();
                const imageUrl = $(element).find('img').attr('src');
                
                if (name) {
                    console.log(`Found expert: ${name}`);
                    experts.push({
                        name,
                        specialty,
                        bio,
                        imageUrl,
                        scrapedAt: new Date().toISOString()
                    });
                }
            } catch (expertError) {
                console.warn(`Error processing expert at index ${index}:`, expertError.message);
                // Continue with next expert instead of failing completely
            }
        });
        
        // Add delay before checking results
        await delay(2000);
        
        if (experts.length === 0) {
            console.log('No experts found. Debug information:');
            console.log('Page title:', $('title').text());
            console.log('Available classes:', {
                expertCards: $('.expert-card').length,
                expertProfiles: $('.expert-profile').length,
                expertContainers: $('.expert-container').length
            });
            console.log('Please check the HTML structure and update selectors accordingly.');
        } else {
            console.log(`Successfully scraped ${experts.length} experts`);
            
            // Create 'data' directory if it doesn't exist
            await fs.mkdir('data', { recursive: true });
            
            // Export to data directory with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `data/experts-${timestamp}.json`;
            await fs.writeFile(filename, JSON.stringify(experts, null, 2));
            console.log(`Data exported to ${filename}`);
        }
        
        return experts;
    } catch (error) {
        console.error('Error scraping data:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
            
            if (error.response.status === 403) {
                console.error('Access forbidden. The website might be blocking scraping attempts.');
            } else if (error.response.status === 429) {
                console.error('Too many requests. Consider adding more delay between requests.');
            }
        }
        throw error;
    }
}

// Export the function for use in other files
module.exports = {
    scrapeExperts,
};

// Run the scraper if this file is run directly
if (require.main === module) {
    scrapeExperts()
        .then(() => console.log('Scraping completed'))
        .catch((error) => {
            console.error('Scraping failed:', error.message);
            process.exit(1);
        });
} 
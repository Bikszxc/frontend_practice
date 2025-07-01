class QuotifyApp {
    author;
    constructor() {
        this.refreshBtn = document.getElementById("refreshQuote");

        this.quoteText = document.getElementById("quote-text");
        this.quoteAuthor = document.getElementById("quote-author");

        this.init()
    }

    init() {
        this.refreshBtn.addEventListener("click", async () => {await this.refreshQuote()})

        this.refreshQuote()
    }

    async getQuote() {
        const url = "https://thequoteshub.com/api/"

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Failed to fetch quote!" + response.status);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(error.message);
            return null;
        }

    }

    async refreshQuote() {

        this.quoteData = await this.getQuote();

        const quote = this.quoteData.text;
        const author = this.quoteData.author;

        this.quoteText.innerHTML = quote;
        this.quoteAuthor.innerHTML = author;
    }
}

const app = new QuotifyApp();
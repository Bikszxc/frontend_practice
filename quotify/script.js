class QuotifyApp {
    author;
    constructor() {
        this.savedQuotes = JSON.parse(localStorage.getItem('quotesSaved')) || [];

        this.refreshBtn = document.getElementById("refreshQuote");
        this.saveBtn = document.getElementById("saveQuote");
        this.viewBtn = document.getElementById("viewSaved");

        this.quoteText = document.getElementById("quote-text");
        this.quoteAuthor = document.getElementById("quote-author");

        this.shareText = document.getElementById("shareText");
        this.shareAuthor = document.getElementById("shareAuthor");

        this.init()
    }

    init() {
        this.refreshBtn.addEventListener("click", async () => {await this.refreshQuote()})
        this.saveBtn.addEventListener("click",  () => {this.saveQuote()})
        this.viewBtn.addEventListener("click", () => {this.viewSavedQuotes()})

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
        this.refreshBtn.classList.add("refreshed");
        this.refreshBtn.disabled = true;

        this.quoteData = await this.getQuote();

        setTimeout(() => {
            this.refreshBtn.classList.remove("refreshed");
            this.refreshBtn.disabled = false;
        }, 1000);

        this.quote = this.quoteData.text;
        this.author = this.quoteData.author;

        this.quoteText.innerHTML = this.quote;
        this.quoteAuthor.innerHTML = "- " + this.author;

        this.shareText.innerHTML = this.quote;
        this.shareAuthor.innerHTML = "- " + this.author;

    }

    saveQuote() {
        if (!this.savedQuotes.some(quote => quote.id === this.quoteData.id)) {
            this.savedQuotes.unshift(this.quoteData);
        } else {
            alert("This quote is already saved!");
            return;
        }

        this.saveBtn.classList.add("liked")

        setTimeout(() => {
            this.saveBtn.classList.remove("liked")
        }, 300)

        this.saveToStorage();
    }

    viewSavedQuotes() {
        if (this.savedQuotes.length > 0) {
            console.log(this.savedQuotes);
        } else {
            console.log("No saved quotes.");
        }

    }

    saveToStorage() {
        localStorage.setItem('quotesSaved', JSON.stringify(this.savedQuotes));
    }
}

const app = new QuotifyApp();
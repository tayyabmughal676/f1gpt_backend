# Formula F1 GPT App

### Using [Langchain](https://js.langchain.com/docs/introduction/), [Puppeteer](https://pptr.dev/), [Datastax](https://www.datastax.com/), and [OpenAI](https://openai.com/)

Code snippets are written in [TypeScript](https://www.typescriptlang.org/)

```typescript
/// openai embeddings model 
openai.embeddings.create({
    model: "text-embedding-3-small",
    input: chunk,
    encoding_format: "float",
})

```

```typescript
// sample data and urls to scrape
const f1Data = [
    "https://www.google.com/search?q=latest+formula+1+news",
    "https://en.wikipedia.org/wiki/Formula_One",
    "https://www.formula1.com/en/latest/all",
    "https://www.formula1.com/en/racing/2024.html",
    "https://www.motorsport.com/f1/news/",
    "https://www.skysports.com/f1",
    "https://www.formula1.com/en/latest",
    "https://www.newsnow.co.uk/h/Sport/F1",
    "https://www.bbc.com/sport/formula1",
    "https://www.planetf1.com/",
    "https://www.planetf1.com/news",
    "https://www.gptoday.com/news/recent/",
];
```

```typescript
// prompt and model
openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
        {
            role: "system",
            content:
                `You are an AI assistant who knows everything about Formula One. 
                    Use below context to augment what you know about Formula One racing.
                    The context will provide you with the most recent page data from wikipedia, the official F1 website and others.
                    If the context doesn't include the information you need answer based on your existing knowledge and don't mention the source of your information or what the context does or doesn't include.
                    Format responses using markdown where applicable and don't return images.
                    -------------
                    START CONTEXT
                    ${docContext}
                    "END CONTEXT"
                    ----------------
                    'QUESTION: ${message} 
                    ---------------`
        }
    ],
});
```

### Senior Full Stack AI & ML Engineer
Building intelligent solutions with AI, Machine Learning, and Full Stack technologies. Expertise in TensorFlow, PyTorch, Flutter (iOS, Android, and Web), Node.js, Python FastAPI, Vector Databases, and Cloud platforms (AWS, Azure, DigitalOcean, Vercel, and Google Cloud)   .
###### [Upwork](https://www.linkedin.com/in/mrtayyabmughal/) | [GitHub](https://github.com/tayyabmughal676/f1gpt_backend) | [LinkedIn](https://www.linkedin.com/in/mrtayyabmughal/) 
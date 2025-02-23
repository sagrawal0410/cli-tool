#!/usr/bin/env node

const { Command } = require('commander');
const axios = require('axios');
const fs = require('fs');
const os = require('os');
const path = require('path');
const program = new Command();

// Path to the config file in the user's home directory
const configPath = path.join(os.homedir(), '.ai-cli-tool-config.json');

// Load the API key from the config file (if it exists)
function loadApiKey() {
  if (fs.existsSync(configPath)) {
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return configData.apiKey;
  }
  return null;
}

// Save the API key to the config file
function saveApiKey(key) {
  const configData = { apiKey: key };
  fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf-8');
}

// Command to set the API key
program
  .command('set-key <key>')
  .description('Set your OpenAI API key')
  .action((key) => {
    saveApiKey(key);
    console.log('API key has been saved successfully!');
});

// Command to summarize text
program
  .command('summarize <text>')
  .description('Summarize the provided text using OpenAI')
  .action(async (text) => {
    try {
      const summary = await summarizeText(text);
      console.log('\n\nSummary:', summary);
    } catch (error) {
      if (error.response) {
        console.error('Error from OpenAI API:', error.response.data.error.message);
      } else {
        console.error('Error:', error.message);
      }
    }
});

program
    .command('translate <text>')
    .description('Translate this provided text using OpenAI API')
    .option('--to <language>', 'Target language code', 'en')
    .action(async (text, options) => {
      try {
        const translate = await translateText(text, options.to);
        console.log('\n\ntranslation:', translate);
      } catch (error) {
        if (error.response) {
          console.error('Error from OpenAI API:', error.response.data.error.message);
        } else {
          console.error('Error:', error.message);
        }
    }
});

program
    .command('sentiment-analysis <text>')
    .description('Do Sentiment Analysis on this provided text using OpenAI API')
    .action(async (text) => {
      try {
        const analyze = await analyzeText(text);
        console.log('\n\nSentiment Analysis:', analyze);
      } catch (error) {
        if (error.response) {
          console.error('Error from OpenAI API:', error.response.data.error.message);
        } else {
          console.error('Error:', error.message);
        }
    }
});

async function summarizeText(inputText) {
  const apiKey = loadApiKey();
  if (!apiKey) {
    throw new Error("API key not set. Run `ai-cli-tool set-key <your-api-key>` first.");
  }
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const data = {
  model: "gpt-4o", // Model used for completion
  messages: [
    { role: "system", content: "You are a helpful assistant that summarizes text, make it very easy to understand and make it concise." },
    { role: "user", content: `Please summarize the following text: ${inputText}` }
  ],
  temperature: 0.8 // Controls creativity; lower values are more deterministic
};

const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`
  };
  const response = await axios.post(apiUrl, data, { headers });
  return response.data.choices[0].message.content.trim();
}

async function translateText(inputText, language) {
    const apiKey = loadApiKey();
    if (!apiKey) {
      throw new Error("API key not set. Run `ai-cli-tool set-key <your-api-key>` first.");
    }
    const apiUrl = "https://api.openai.com/v1/chat/completions";
    const data = {
    model: "gpt-4o", // Model used for completion
    messages: [
      { role: "system", content: "You are a helpful assistant that translates text, make the translation completely accurate and maintain the meaning of the original text in the original language." },
      { role: "user", content: `Please translate the following text: ${inputText} to ${language}` }
    ],
    temperature: 0.8 // Controls creativity; lower values are more deterministic
  };
  
  const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    };
    const response = await axios.post(apiUrl, data, { headers });
    return response.data.choices[0].message.content.trim();
  }

  async function analyzeText(inputText) {
    const apiKey = loadApiKey();
    if (!apiKey) {
      throw new Error("API key not set. Run `ai-cli-tool set-key <your-api-key>` first.");
    }
    const apiUrl = "https://api.openai.com/v1/chat/completions";
    const data = {
    model: "gpt-4o", // Model used for completion
    messages: [
      { role: "system", content: "You are a helpful assistant that does sentiment analysis on text, analyze the sentiment/feelings behind this text with accuracy and give a detailed summary of your analysis" },
      { role: "user", content: `Please analyze the following text: ${inputText}` }
    ],
    temperature: 0.8 // Controls creativity; lower values are more deterministic
  };
  
  const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    };
    const response = await axios.post(apiUrl, data, { headers });
    return response.data.choices[0].message.content.trim();
  }
program.parse(process.argv);
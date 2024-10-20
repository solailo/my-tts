// netlify/functions/tts.js

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*', // 必要に応じて特定のドメインに変更
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: 'Method Not Allowed'
    };
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // 必要に応じて特定のドメインに変更
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: ''
    };
  }

  try {
    const { input, voice, model, response_format, speed } = JSON.parse(event.body);

    if (!input || !voice || !model) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*' // 必要に応じて特定のドメインに変更
        },
        body: JSON.stringify({ error: 'Missing required parameters.' }),
      };
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        input,
        voice,
        response_format: response_format || 'mp3',
        speed: speed || 1.0,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        statusCode: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*' // 必要に応じて特定のドメインに変更
        },
        body: JSON.stringify({ error: errorData.error.message || '音声生成に失敗しました。' }),
      };
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const mimeType = `audio/${response_format || 'mp3'}`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': mimeType,
        'Access-Control-Allow-Origin': '*' // 必要に応じて特定のドメインに変更
      },
      body: base64Audio,
      isBase64Encoded: true,
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*' // 必要に応じて特定のドメインに変更
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

const textInput = document.getElementById('textInput');
const voiceSelect = document.getElementById('voiceSelect');
const modelSelect = document.getElementById('modelSelect');
const generateBtn = document.getElementById('generateBtn');
const audioPlayer = document.getElementById('audioPlayer');
const costEstimate = document.getElementById('costEstimate');

// コストの計算
function calculateCost(text, model) {
  const textLength = text.length;
  const costPer1kChars = model === 'tts-1' ? 0.015 : 0.030;
  const estimatedCost = (textLength / 1000) * costPer1kChars;
  return estimatedCost.toFixed(4);
}

// 音声生成
generateBtn.addEventListener('click', async () => {
  const text = textInput.value.trim();
  const voice = voiceSelect.value;
  const model = modelSelect.value;

  if (!text) {
    alert('テキストを入力してください。');
    return;
  }

  // コスト表示
  const cost = calculateCost(text, model);
  costEstimate.textContent = `推定コスト: $${cost}`;

  // APIリクエスト（Netlify Functionを経由）
  try {
    const response = await fetch('/.netlify/functions/tts', { // Netlify Functionのエンドポイント
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        input: text,
        voice: voice,
        response_format: 'mp3', // 必要に応じて変更
        speed: 1.0 // 必要に応じて変更
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '音声生成に失敗しました。');
    }

    const base64Audio = await response.text();
    const audioBlob = base64ToBlob(base64Audio, 'audio/mpeg');
    const audioUrl = URL.createObjectURL(audioBlob);

    // 音声を再生
    audioPlayer.src = audioUrl;
    audioPlayer.play();

  } catch (error) {
    console.error(error);
    alert(`エラー: ${error.message}`);
  }
});

// Base64をBlobに変換する関数
function base64ToBlob(base64, mime) {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mime });
}

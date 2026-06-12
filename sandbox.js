// sandbox.js
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('sandbox-input');
  const btn = document.getElementById('sandbox-generate-btn');
  const terminalBody = document.getElementById('sandbox-terminal-body');

  let isGenerating = false;

  const typeWriterEffect = async (text, element, speed = 20) => {
    element.innerHTML = ''; // clear
    for (let i = 0; i < text.length; i++) {
      element.innerHTML += text.charAt(i) === '\n' ? '<br>' : text.charAt(i);
      // scroll to bottom
      terminalBody.scrollTop = terminalBody.scrollHeight;
      await new Promise(resolve => setTimeout(resolve, speed));
    }
    element.innerHTML += '<span class="blinking-cursor">_</span>';
  };

  btn.addEventListener('click', async () => {
    const bizName = input.value.trim();
    if (!bizName || isGenerating) return;

    isGenerating = true;
    btn.disabled = true;
    btn.style.opacity = '0.7';
    btn.textContent = 'Generating...';

    // Show initial terminal text
    terminalBody.innerHTML = `> Initializing Kirmada AI...<br>> Analyzing niche: <span style="color: #ffbd2e;">${bizName}</span><br>> Compiling professional strategy...<span class="blinking-cursor">_</span>`;
    
    // Construct strict prompt
    const prompt = `Act as an elite, high-end digital marketing agency (Kirmada.Online). The user just provided their business/niche: "${bizName}".
Write a simple, precise, and highly professional 3-sentence marketing strategy to help them grow. Use a confident, expert agency tone. Do NOT use violent, aggressive, or overly dramatic words. Do NOT use markdown.`;

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };

    try {
      const response = await fetch('/.netlify/functions/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.status === 429) {
        // Rate Limiting Safety Net
        await typeWriterEffect("> SYSTEM OVERLOAD: Too many users testing the AI simultaneously. Please try again in 60 seconds.", terminalBody, 30);
      } else if (!response.ok) {
        throw new Error('API Error');
      } else {
        const data = await response.json();
        
        let reply = "";
        try {
          reply = data.candidates[0].content.parts[0].text;
        } catch(e) {
          reply = "> SYSTEM ERROR: Could not parse response.";
        }
        
        // Clean up response format
        reply = `> Strategy compiled successfully.\n> \n> ` + reply;
        await typeWriterEffect(reply, terminalBody, 25);
      }
    } catch (error) {
      await typeWriterEffect("> ERROR 500: Secure connection failed or API is offline. Please reach out to our team directly.", terminalBody, 30);
    } finally {
      isGenerating = false;
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.textContent = 'Generate';
      input.value = '';
    }
  });

  // Allow pressing Enter to submit
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      btn.click();
    }
  });
});

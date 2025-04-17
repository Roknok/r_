
function changeBackground() {
const colors = ["#f9c74f", "#90be6d", "#f94144", "#577590", "#f3722c"];
document.body.style.background = colors[Math.floor(Math.random() * colors.length)];
}

function Increase(factor=1.02) {
  // Increase the font size of all elements except the body
  const elements = document.querySelectorAll('*');
  elements.forEach(element => {
    if (element !== document.body) {
      const currentFontSize = window.getComputedStyle(element).fontSize;
      const newFontSize = parseFloat(currentFontSize) * factor;
      element.style.fontSize = newFontSize + 'px';
    }
  });

  // Optionally, increase the scale of the page without scaling the body
  const html = document.documentElement;
  html.style.transform = `scale(${factor})`;
  html.style.transformOrigin = 'top left'; // Ensure the scaling is from the top-left corner
  html.style.transition = 'transform 0.3s'; // Smooth transition
}
  

function Decrease(factor = 0.98) {
    // Decrease the font size of all elements except the body
    const elements = document.querySelectorAll('*');
    elements.forEach(element => {
      if (element !== document.body) {
        const currentFontSize = window.getComputedStyle(element).fontSize;
        const newFontSize = parseFloat(currentFontSize) * factor;
        element.style.fontSize = newFontSize + 'px';
      }
    });
  
    // Optionally, decrease the scale of the page without scaling the body
    const html = document.documentElement;
    html.style.transform = `scale(${factor})`;
    html.style.transformOrigin = 'top left'; // Ensure the scaling is from the top-left corner
    html.style.transition = 'transform 0.3s'; // Smooth transition
  }


  function redirectToYouTube() {
    window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // Replace with your YouTube video URL
  }
  function Copy() {
    const input = document.getElementById('inputBox');
    input.select();
    input.setSelectionRange(0, 99999); // For mobile compatibility
    navigator.clipboard.writeText(input.value)
      .then(() => {
        console.log("Copied to clipboard: " + input.value);
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
      });
  }
  
  function Flip() {
    const input = document.getElementById('inputBox');
    const originalText = input.value;
    const flippedText = originalText.split('').reverse().join('');
    input.value = flippedText;
  
    // Trigger the input event to update match percentages
    input.dispatchEvent(new Event('input'));
  }
  
  function Rain() {
    for (let i = 0; i < 100; i++) {
      const drop = document.createElement('div');
      drop.className = 'raindrop';
      drop.style.left = `${Math.random() * 100}vw`;
      drop.style.animationDelay = `${Math.random() * 2}s`;
      document.body.appendChild(drop);
  
      // Remove drop after animation
      setTimeout(() => {
        drop.remove();
      }, 3000);
    }
  }
  function Confetti(count = 100) {
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti';
      
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
      piece.style.animationDelay = `${Math.random()}s`;
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
  
      document.body.appendChild(piece);
  
      // Remove after animation
      setTimeout(() => piece.remove(), 3000);
    }
  }
  
  




// Target sentence
// Target sentence
const targetSentence = "Never give up";

// Function to normalize a string by removing spaces, punctuation, and converting to lowercase
function normalizeString(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, ''); // Removes anything that's not a letter or number
}

// Function to calculate the percentage of letter matches (ignoring spaces, punctuation, and case)
function calculateLetterMatch(input) {
  const normalizedInput = normalizeString(input);
  const normalizedTarget = normalizeString(targetSentence);

  let matchCount = 0;
  let matchedLetters = [];

  // Count occurrences of each character in the target sentence
  const targetCharCount = {};
  for (let i = 0; i < normalizedTarget.length; i++) {
    const char = normalizedTarget[i];
    targetCharCount[char] = (targetCharCount[char] || 0) + 1;
  }

  // Count occurrences of each character in the input
  for (let i = 0; i < normalizedInput.length; i++) {
    const char = normalizedInput[i];
    if (targetCharCount[char] > 0) {
      matchCount++;
      targetCharCount[char]--; // Decrease count in target once we match it
    }
  }

  // Return the letter match percentage based on how many matching characters are found
  return (matchCount / normalizedTarget.length) * 100;
}

// Function to calculate the percentage of order matches (ignoring spaces, punctuation, and case)
function calculateOrderMatch(input) {
    const normalizedInput = normalizeString(input);
    const normalizedTarget = normalizeString(targetSentence);
  
    let inputIndex = 0;
    let matchCount = 0;
  
    for (let i = 0; i < normalizedTarget.length && inputIndex < normalizedInput.length; i++) {
      if (normalizedInput[inputIndex] === normalizedTarget[i]) {
        matchCount++;
        inputIndex++;
      }
    }
  
    return (matchCount / normalizedTarget.length) * 100;
  }

// Function to update the similarity percentages when input changes
document.getElementById('inputBox').addEventListener('input', function() {
  const inputText = this.value;

  const letterMatchPercentage = calculateLetterMatch(inputText);
  const orderMatchPercentage = calculateOrderMatch(inputText);

  document.getElementById('message').textContent = `Letters: ${letterMatchPercentage.toFixed(2)}% | In Correct Place: ${orderMatchPercentage.toFixed(2)}%`;
});

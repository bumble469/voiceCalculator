function appendToDisplay(value) {
    document.getElementById("display").value += value;
}

function clearDisplay() {
    document.getElementById("display").value = '';
}

function getResult() {
    try {
        let result = eval(document.getElementById("display").value);
        document.getElementById("display").value = result;
        if(isVoiceModeOn){
            speakResult("The answer is " + result);
        }
    } catch (error) {
        alert('Invalid expression!');
    }
}

function backspace() {
    let display = document.getElementById("display");
    display.value = display.value.slice(0, -1);
}

document.addEventListener("keydown", function(event) {
    const key = event.key;
    if (!isNaN(key) || "+-/*.".includes(key)) {
        appendToDisplay(key);
    } else if (key == "Enter") {
        getResult();
    } else if (key == "Escape") {
        clearDisplay();
    } else if (key == "Backspace") {
        backspace();
    }
});

let isVoiceModeOn = false;
let recognition;
let autoCalculateTimer;
let lastCommandTime = 0;
function activateVoiceMode() {
    const activateVoiceModeButton = document.getElementById("enableVoiceMode");
    const listeningMessage = document.getElementById("listeningMessage");
    const referenceDiv = document.getElementById("voiceCommandsReference");
    isVoiceModeOn = !isVoiceModeOn;

    if (isVoiceModeOn) {
        activateVoiceModeButton.innerHTML = "Disable Voice Mode";
        referenceDiv.style.display = "block";
        listeningMessage.style.display = "block";
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onresult = function(event) {
            let voiceInput = event.results[event.results.length - 1][0].transcript;
            processVoiceCommand(voiceInput);

            lastCommandTime = Date.now();
            resetAutoTimer();
        };

        recognition.onend = function(){
            if(isVoiceModeOn){
                recognition.start();
            }
        }

        recognition.onerror = function(event) {
            alert("Error: " + event.error);
        };
        recognition.start();

    } else {
        activateVoiceModeButton.innerHTML = "Enable Voice Mode";
        recognition.stop();
        clearTimeout(autoCalculateTimer);
        referenceDiv.style.display = "none";
        listeningMessage.style.display = "none"
    }
}

function processVoiceCommand(command) {
    command = command.toLowerCase();
    if (command.includes("clear") || command.includes("cancel")) {
        clearDisplay();
        return;
    }
    if (command.includes("back") || command.includes("backspace")) {
        backspace();
        return;
    }
    command = command.replace(/one/g, "1")
                     .replace(/two/g, "2")
                     .replace(/three/g, "3")
                     .replace(/four/g, "4")
                     .replace(/five/g, "5")
                     .replace(/six/g, "6")
                     .replace(/seven/g, "7")
                     .replace(/eight/g, "8")
                     .replace(/nine/g, "9")
                     .replace(/zero/g, "0");

    command = command.replace(/plus/g, "+")
                     .replace(/minus/g, "-")
                     .replace(/times/g, "*")
                     .replace(/into/g, "*")
                     .replace(/divided/g, "/")
                     .replace(/over/g, "/")
                     .replace(/equals/g, "=")
                     .replace(/calculate/g, "=")
                     .replace(/x/g, "*"); 

    command = command.replace(/\s+/g, "");
    document.getElementById("display").value = command;
    lastCommandTime = Date.now(); 
    resetAutoTimer();
}

function speakResult(result) {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(result);
    synth.speak(utterance);
}

function resetAutoTimer() {
    clearTimeout(autoCalculateTimer);
    autoCalculateTimer = setTimeout(() => {
        let displayValue = document.getElementById("display").value.trim();   
        if (displayValue && /[\d+\-*/.]/.test(displayValue) && Date.now() - lastCommandTime >= 2000) {
            getResult();
            hasReceivedCommand = false;
        }
    }, 2000);
}

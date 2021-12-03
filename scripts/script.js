/*
Change Requests:
32: Fix leading zeros on negative numbers.
34: The number rounding takes place on the results, not only the number displayed.
    This may result in wrong values if the result of a operation is used as the input
    for another operation.
35: Blinking display when screen full and user attempts input.
37: Generally clean up code?
*/

//Events & Inputs
window.addEventListener("load", () => { updateDisplay("0") });

window.addEventListener("keydown", (event) => {
    if(event.repeat) {
        return;
    }
    let keyValue = event.key;
    let pressedKey = document.querySelector(`div[data-value="${keyValue}"]`);
    if(pressedKey) {
        pressedKey.classList.add("pressed");
    }
    inputHandler(keyValue);
});

window.addEventListener("keyup", (event) => {
    let keyValue = event.key;
    let pressedKey = document.querySelector(`div[data-value="${keyValue}"]`);
    if(pressedKey) {
        pressedKey.classList.remove("pressed");
    }
});

const calculatorKey = document.querySelectorAll(".key");
calculatorKey.forEach(key => key.addEventListener("click", (event) => {
    let keyValue = event.target.getAttribute("data-value");
    inputHandler(keyValue);
}));

const INPUTLOOKUP = {"%": calculatePercent, "-": addOperator, "+": addOperator,
    "*": addOperator, "/": addOperator, ".": addDecimal, "=": checkInput, 
    "Enter": checkInput, "Delete": clearEntry, "c": clear, "Backspace": backspace};

function inputHandler(input) {
    if(/([0-9])/.test(input)) {
        addNumber(input);
    }
    if(input in INPUTLOOKUP) {
        INPUTLOOKUP[input](input);
    }
}

//Operations & Functions
function operate() {
    let a = Number(storedValue);
    let b = Number(currentValue);
    switch (operator) {
        case "+":
            currentValue = a + b;
            break;
        case "-":
            currentValue = a - b;
            break;
        case "*":
            currentValue = a * b;
            break;
        case "/":
            if(b == 0) {
                currentValue = "Infinity";
                break;
            }
            currentValue = a / b;
            break;
    }

    currentValue = Number(parseFloat(currentValue).toFixed(2));
    result = currentValue.toString();
    currentValue = "";
    storedValue = "";
    operator = "";
    updateDisplay(result);
}

function calculatePercent() {
    if(!currentValue || !storedValue) {
        console.log("yes");
        return;
    }
    let a = Number(storedValue);
    let b = Number(currentValue);
    currentValue = Number((a * (b / 100)).toFixed(2));
    currentValue = currentValue.toString();
    updateDisplay(currentValue);
}

function addDecimal(inputValue) {
    if(/\./.test(currentValue)) {
        return;
    }
    if(currentValue == "" || currentValue == "0") {
        currentValue = "0.";
        result = "";
        updateDisplay(currentValue);
        return;
    }
    currentValue += inputValue;
    updateDisplay(currentValue);
}

function addNumber(inputValue) {
    if(currentValue != "" && currentValue.match(/[^.]/g).length == 9) {
        return;
    }
    if(currentValue == "" || currentValue == "0") {
        currentValue = inputValue;
        result = "";
    } else {
        currentValue += inputValue;
    }
    updateDisplay(currentValue);
}

function addOperator(input) {
    if(currentValue == "" && result == "" && input == "-" ) {
        currentValue = "-";
        console.log(currentValue);
        updateDisplay(currentValue);
        return;
    }

    if(currentValue == "" && result == "") {
        return;
    }

    if(operator != "") {
        operate();
    }

    operator = input;
    storedValue = (currentValue || result);
    currentValue = "";
    result = "";
    updateDisplay(storedValue);
}

function checkInput() {
    if(currentValue == "") {
        return;
    }
    operate();
}

function clearEntry() {
    currentValue = "";
    updateDisplay("0");
}

function clear() {
    currentValue = "";
    storedValue = "";
    operator = "";
    result = "";
    updateDisplay("0");
}

function backspace() {
    if(currentValue != "") {
        currentValue = currentValue.slice(0, currentValue.length-1);
        updateDisplay(currentValue || "0");
    }
}

let currentValue = "";
let storedValue = "";
let operator = "";
let result = "";

//Display
const DIGITENCODINGS = {"-":1, "0":126, "1":48, "2":109, "3":121, "4":51, 
    "5":91, "6":95, "7":112, "8":127, "9":123, "a":119, "b":31, "c":13, "e":111, "f":71,
    "g":123, "h":23, "i":16, "l":14, "n":21, "o":29, "p":103, "r":5, "t":15, "u": 28, "v":62,
    "y":59, "B":127, "E":79, "H":55, "I":6, "N":118, "O":126, "S": 91, " ": 0};

function updateDisplay(value) {
    if(value.match(/[^.]/g).length > 9) {
        value = "too long";
        currentValue = "";
        storedValue = "";
        operator = "";
    }
    driveDisplay(value);
}

function clearLitGlowElements() {
    const litSegments = document.querySelectorAll(".lit");
    litSegments.forEach((segment) => segment.classList.remove("lit"));
    const glowDigits = document.querySelectorAll(".glow");
    glowDigits.forEach((digit) => digit.classList.remove("glow"));
}

function encodeDigits(digitArray) {
    const encodedDigits = [];
    digitArray.forEach((digit) => {
        if(digit == ".") {
            encodedDigits[encodedDigits.length - 1] += 128;
        } else {
            encodedDigits.push(DIGITENCODINGS[digit]);
        }
    });
    return encodedDigits;
}

function driveDisplay(value) {
    const encodedDigits = encodeDigits([...value]);
   
    clearLitGlowElements();

    const digitDivs = document.querySelectorAll(".digit");
    const displayArray = Array.from(digitDivs);

    while(encodedDigits.length) {
        let digit = encodedDigits.pop();
        const currentDigit = displayArray.pop();
        const segmentDivs = currentDigit.querySelectorAll(".segment");
        let segmentArray = Array.from(segmentDivs);
        for(let i = 128; i >= 1; i /= 2) {
            if(digit % i != digit) {
                segmentArray.shift().classList.add("lit");
                currentDigit.classList.add("glow");
            } else {
                segmentArray.shift();
            }
            digit %= i;
        }
    }
}
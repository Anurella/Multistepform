let timeout;
function mobileView() {
    // Get the viewport height and multiple it by 1% to get a value for a vh unit
    let vh = window.innerHeight * 0.01;
    // Then we set the value in the --vh custom property to the root of the document
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}
;
window.addEventListener('resize', function () {
    clearTimeout(timeout);
    // using the debounce method to prevent the function from being called multiple times
    timeout = setTimeout(function () {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }, 250);
});
function MultiForm(form) {
    if (!(form instanceof Element)) {
        throw new Error('No form passed in');
    }
    let currentField = 0, isFilled, filledOut;
    //get actual form 
    const completeForm = form.querySelector('form');
    // get all fieldsets
    const fieldSets = Array.from(form.querySelectorAll('fieldset'));
    //  total fieldsets
    const fieldCount = fieldSets.length;
    //get all inputs 
    const allInputs = Array.from(form.querySelectorAll('[data-input]'));
    //progress bar
    const progress = form.querySelectorAll('.progress__item');
    // applicant name 
    const applicantName = form.querySelectorAll('.applicant__name');
    // prev button
    const prevButton = document.querySelector('.prev__arrow');
    function init() {
        console.log("Initializing Form");
        showNext(currentField);
        addEvents();
    }
    function showNext(n) {
        // add current to first class
        if (n == 0) {
            prevButton.classList.remove("visible");
        }
        else {
            // show the arrow
            prevButton.classList.add("visible");
        }
        fieldSets[n].classList.add("current");
        updateProgress(n);
    }
    function addEvents() {
        //contButton.addEventListener('click', validateForm);
        // validate function to be called by all fieldsets except last one 
        for (let i = 0; i < fieldCount - 1; i++) {
            // continue buttons
            fieldSets[i].querySelector('button').addEventListener('click', validateForm);
        }
        // for inputs 
        allInputs.forEach(input => input.addEventListener('keyup', function (e) {
            clearErrors(e);
            clearTimeout(filledOut);
            filledOut = setTimeout(() => {
                checkFilled();
            }, 250);
        }));
        // allInputs.forEach(input => input.addEventListener('change', e => clearErrors))
        allInputs.forEach(input => input.addEventListener('change', function (e) {
            clearErrors(e);
            clearTimeout(filledOut);
            filledOut = setTimeout(() => {
                checkFilled();
            }, 250);
        }));
        // button 
        prevButton.addEventListener('click', prevQuestion);
        // form submission
        completeForm.addEventListener('submit', formSubmit);
    }
    function validateForm() {
        console.log("Validating");
        let valid = true;
        if (currentField == 0) {
            let tempp = fieldSets[currentField].querySelector('input[name="firstName"]');
            applicantName.forEach(sing => {
                sing.innerHTML = tempp.value.trim();
            });
        }
        let inputs = fieldSets[currentField].querySelectorAll('input');
        // for (let i = 0; i < inputs.length; i++) {
        //     //the checkFields checks for empty state 
        //     // If a field is empty...
        //     if (inputs[i].value == "") {
        //         // check if it contains the class 
        //         if (inputs[i].classList.contains("invalid")) {
        //             // do not add the class
        //         }
        //         // add an "invalid" class to the field:
        //         else {
        //             inputs[i].classList.add("invalid")
        //         }
        //         // show error message 
        //         inputs[i].closest('fieldset').classList.add('has-error');
        //         // and set the current valid status to false
        //         valid = false;
        //     }
        // }
        for (let i = 0; i < inputs.length; i++) {
            //the checkFields checks for empty state 
            if (checkFields()) {
                break;
            }
            else {
                if (inputs[i].classList.contains("invalid")) {
                    // do not add the class
                }
                // add an "invalid" class to the field:
                else {
                    inputs[i].classList.add("invalid");
                }
                // show error message 
                inputs[i].closest('fieldset').classList.add('has-error');
                // and set the current valid status to false
                valid = false;
            }
        }
        stage(valid);
    }
    function stage(n) {
        // If the valid status is true, mark the step as finished 
        // increment the currentField value
        // hide the current tab 
        if (n) {
            progress[currentField].className += "finished";
            // check if the current tab matches the length of fieldset
            fieldSets[currentField].classList.remove("current");
            ++currentField;
        }
        else {
            console.log("Hello I am this stage");
        }
        showNext(currentField);
    }
    function updateProgress(n) {
        for (let i = 0; i < progress.length; i++) {
            progress[i].className = progress[i].className.replace(" active", " ");
        }
        // add the active class to the current one 
        progress[n].className += " active";
    }
    function checkFields() {
        let temp = true, mailFormat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        let inputs = fieldSets[currentField].querySelectorAll('input');
        let selects = fieldSets[currentField].querySelectorAll('select');
        if (currentField === 4) {
            for (let i = 0; i < selects.length; i++) {
                if (selects[i].value === "") {
                    temp = false;
                }
            }
        }
        else {
            // validating inputs 
            // a loop to check if input not empty 
            for (let i = 0; i < inputs.length; i++) {
                // If a field is empty...
                // check if it is a radio button 
                if (inputs[i].type === "radio") {
                    if (inputs[i].checked) {
                        temp = true;
                        break;
                    }
                    else {
                        temp = false;
                    }
                }
                else if (inputs[i].type === "email") {
                    // validate 
                    if (inputs[i].value.match(mailFormat)) {
                        temp = true;
                    }
                    else {
                        temp = false;
                    }
                }
                else {
                    if (inputs[i].value === "") {
                        temp = false;
                    }
                }
            }
        }
        return temp;
    }
    function checkFilled() {
        // if (!checkFields()) return false;
        if (checkFields()) {
            fieldSets[currentField].querySelector('button').setAttribute('aria-disabled', 'false');
        }
        else {
            fieldSets[currentField].querySelector('button').setAttribute('aria-disabled', 'true');
            return false;
        }
    }
    function clearErrors(e) {
        // clear errors and check fields
        if (e.target.closest("input")) {
            e.target.closest("input").classList.remove("invalid");
        }
        else {
            e.target.closest("select").classList.remove("invalid");
        }
        e.target.closest("fieldset").classList.remove("has-error");
    }
    function prevQuestion() {
        // if (currentField == 0) return false;
        // fieldSets[currentField].classList.add("current");
        // updateProgress(currentField);
        // go back one slide 
        fieldSets[currentField].classList.remove("current");
        // 
        currentField = currentField - 1;
        showNext(currentField);
        // if (checkFields()) {
        // }
    }
    function formSubmit(event) {
        event.preventDefault();
        console.log("Submitting");
        // hide form and show 
        completeForm.parentElement.classList.add("done");
        document.querySelector('.successMessage').classList.add('visible');
    }
    init();
}
window.MultiForm = MultiForm;

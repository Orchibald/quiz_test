const quizData = [
  {
      question: "Яка ваша улюблена пора року?",
      options: ["Весна", "Літо", "Осінь/Зима"]
  },
  {
      question: "Яким транспортом ви найчастіше користуєтесь?",
      options: ["Громадський транспорт", "Власне авто", "Велосипед/Пішки"]
  },
  {
      question: "Скільки часу в день ви проводите онлайн?",
      options: ["Менше 3 годин", "3-6 годин", "Більше 6 годин"]
  },
  {
      question: "Як часто ви відвідуєте розважальні заходи?",
      options: ["Рідко", "Кілька разів на місяць", "Щотижня або частіше"]
  },
  {
      question: "Який тип відпустки вам більше подобається?",
      options: ["Активний відпочинок", "Пляжний відпочинок", "Культурний туризм"]
  }
];

document.addEventListener('DOMContentLoaded', function() {
  let currentQuestionIndex = 0;
  const answers = [];
  const questionContainer = document.getElementById('question-container');
  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');
  const progress = document.getElementById('progress');
  const progressText = document.getElementById('progress-text');
  const registrationForm = document.getElementById('registration-form');
  const resultsContainer = document.getElementById('results-container');
  const phoneInput = document.getElementById('phone');
  
  const iti = window.intlTelInput(phoneInput, {
      initialCountry: "ua",
      separateDialCode: true,
      utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
  });

  function init() {
      loadQuestion(currentQuestionIndex);
      updateProgress();
      
      nextBtn.addEventListener('click', nextQuestion);
      prevBtn.addEventListener('click', prevQuestion);
      document.getElementById('user-form').addEventListener('submit', submitForm);
      document.getElementById('restart-btn').addEventListener('click', restartQuiz);
  }

  function loadQuestion(index) {
      questionContainer.innerHTML = '';
      
      const questionDiv = document.createElement('div');
      questionDiv.classList.add('question-container', 'active');
      
      const questionElement = document.createElement('div');
      questionElement.classList.add('question');
      questionElement.textContent = quizData[index].question;
      questionDiv.appendChild(questionElement);
      
      const optionsDiv = document.createElement('div');
      optionsDiv.classList.add('options');
      
      quizData[index].options.forEach((option, optionIndex) => {
          const optionDiv = document.createElement('div');
          optionDiv.classList.add('option');
          optionDiv.textContent = option;
          
          if (answers[index] === optionIndex) {
              optionDiv.classList.add('selected');
          }
          
          optionDiv.addEventListener('click', () => {
              selectOption(optionIndex);
          });
          
          optionsDiv.appendChild(optionDiv);
      });
      
      questionDiv.appendChild(optionsDiv);
      questionContainer.appendChild(questionDiv);
      
      if (index === quizData.length - 1) {
          nextBtn.textContent = 'Завершити';
      } else {
          nextBtn.textContent = 'Далі';
      }
      
      nextBtn.disabled = answers[index] === undefined;
  }

  function selectOption(optionIndex) {
      answers[currentQuestionIndex] = optionIndex;
      
      const options = document.querySelectorAll('.option');
      options.forEach((option, index) => {
          if (index === optionIndex) {
              option.classList.add('selected');
          } else {
              option.classList.remove('selected');
          }
      });
      
      nextBtn.disabled = false;
  }

  function nextQuestion() {
      if (currentQuestionIndex < quizData.length - 1) {
          currentQuestionIndex++;
          loadQuestion(currentQuestionIndex);
          updateProgress();
      } else {
          showRegistrationForm();
      }
  }

  function prevQuestion() {
      if (currentQuestionIndex > 0) {
          currentQuestionIndex--;
          loadQuestion(currentQuestionIndex);
          updateProgress();
      }
  }

  function updateProgress() {
      const progressPercentage = ((currentQuestionIndex + 1) / quizData.length) * 100;
      progress.style.width = progressPercentage + '%';
      progressText.textContent = `Питання ${currentQuestionIndex + 1} з ${quizData.length}`;
      
      prevBtn.disabled = currentQuestionIndex === 0;
  }

  function showRegistrationForm() {
      questionContainer.style.display = 'none';
      document.querySelector('.navigation').style.display = 'none';
      document.querySelector('.progress-container').style.display = 'none';
      registrationForm.style.display = 'block';
  }

  function validateForm() {
      let isValid = true;
      
      const name = document.getElementById('name');
      if (!name.value.trim()) {
          document.querySelector('[for="name"]').parentElement.classList.add('has-error');
          isValid = false;
      } else {
          document.querySelector('[for="name"]').parentElement.classList.remove('has-error');
      }
      
      const email = document.getElementById('email');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.value)) {
          document.querySelector('[for="email"]').parentElement.classList.add('has-error');
          isValid = false;
      } else {
          document.querySelector('[for="email"]').parentElement.classList.remove('has-error');
      }
      
      if (!iti.isValidNumber()) {
          document.querySelector('[for="phone"]').parentElement.classList.add('has-error');
          isValid = false;
      } else {
          document.querySelector('[for="phone"]').parentElement.classList.remove('has-error');
      }
      
      return isValid;
  }

  function submitForm(e) {
      e.preventDefault();
      
      if (!validateForm()) {
          return;
      }
      
      const formData = {
          name: document.getElementById('name').value,
          email: document.getElementById('email').value,
          phone: iti.getNumber(),
          quizAnswers: getQuizAnswers()
      };
      
      sendData(formData);
  }

  function getQuizAnswers() {
      return quizData.map((q, index) => {
          return {
              question: q.question,
              answer: q.options[answers[index]]
          };
      });
  }

  function sendData(data) {
      const submitBtn = document.getElementById('submit-btn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Відправляємо...';
      
      fetch('https://httpbin.org/post', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
      })
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json();
      })
      .then(data => {
          showResults();
      })
      .catch(error => {
          console.error('Error:', error);
          alert('Виникла помилка при відправці даних. Спробуйте ще раз.');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Відправити';
      });
  }

  function showResults() {
      registrationForm.style.display = 'none';
      resultsContainer.style.display = 'block';
  }

  function restartQuiz() {
      currentQuestionIndex = 0;
      answers.length = 0;
      
      resultsContainer.style.display = 'none';
      document.querySelector('.navigation').style.display = 'flex';
      document.querySelector('.progress-container').style.display = 'block';
      
      document.getElementById('user-form').reset();
      document.querySelectorAll('.form-group').forEach(group => {
          group.classList.remove('has-error');
      });
      
      loadQuestion(currentQuestionIndex);
      updateProgress();
      questionContainer.style.display = 'block';
      
      const submitBtn = document.getElementById('submit-btn');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Відправити';
  }

  init();
});
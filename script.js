'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANCO QUÂNTICO APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Eva Filipe',
  movements: [
    200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300, 30000000,
  ],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
    '2021-11-12T10:51:36.790Z',
  ],
  currency: 'BRL',
  locale: 'pt-BR', // de-DE
};

const account2 = {
  owner: 'Hermenegildo Sousa',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30, 20755744],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
    '2022-04-06T12:01:20.894Z',
  ],
  currency: 'BRL',
  locale: 'pt-BR',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

// Datas de movimentos na conta
const formatMovementDate = function (date, locale) {
  const calcDiasPassou = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDiasPassou(new Date(), date);
  // console.log(daysPassed);

  if (daysPassed === 0) return 'Hoje';
  if (daysPassed === 1) return 'Ontem';
  if (daysPassed <= 7) return `${daysPassed} dias atrás`;
  // OBS: ñ tem necesidade de usar o else esta ali só para garantir que se nada anterior funcionar, ele funciona.
  else {
    // const dia = `${date.getDate()}`.padStart(2, 0);
    // const mes = `${date.getMonth() + 1}`.padStart(2, 0);
    // const ano = date.getFullYear();
    // return `${dia}/${mes}/${ano}`;
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currentAccount.currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'depósito' : 'saque';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    //Numero Formato Internacional usando API

    // const formattedMov = new Intl.NumberFormat(acc.locale, {
    //   style: 'currency',
    //   currency: currentAccount.currency,
    // }).format(mov); //foi criada uma função acima... isto para não repetirmos o codigo .... formatCur

    // chamando a função formatCur p/ movimentos
    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  // chamando a função formatCur

  // const formattedMov = formatCur(acc.balance, acc.locale, acc.currency);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    //cada chamada de retorno imprimir o tempo restante na interface do usuário.
    labelTimer.textContent = `${min}:${sec}`;

    // Quando o tempo está em zero segundos, pare o cronômetro e faça logout do usuário.
    if (time === 0) {
      clearInterval(timer);

      labelWelcome.textContent = 'Faça login para iniciar';
      containerApp.style.opacity = 0;
    }
    // Diminua 1s
    time--; // o mesmo que: time - 1;
  };
  // Definindo o Tempo 5 minutos
  let time = 300;

  // Chamar o timer todo segundo
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// LOGIN FAKE

// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting - Impedir o envio do formulário
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Bem vindo(a) de volta, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Criamos a data atual
    // com  API
    setInterval(() => {
      const agora = new Date();
      const options = {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        day: 'numeric',
        month: 'numeric', // tambem pode ser long ou 2-digit
        year: 'numeric',
        // weekday: 'long',
      };

      // const locale = navigator.language;
      // console.log(locale);

      labelDate.textContent = new Intl.DateTimeFormat(
        currentAccount.locale,
        options
      ).format(agora);
    }, 1000);
    // const agora = new Date();
    // const dia = `${agora.getDate()}`.padStart(2, 0);
    // const mes = `${agora.getMonth() + 1}`.padStart(2, 0); // o mes começa do zero
    // const ano = agora.getFullYear();
    // const hora = `${agora.getHours()}`.padStart(2, 0);
    // const min = `${agora.getMinutes()}`.padStart(2, 0);

    // labelDate.textContent = `${dia} / ${mes} / ${ano}, ${hora}:${min}`; // dia/mês/ano e hora

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Chamar a função temporizador
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

// TRANSFERIR
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // adicionar data de transferência
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Zerar o timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  // Zerar o timer
  clearInterval(timer);
  timer = startLogOutTimer();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // adicionar data de Emprestimo
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);
    }, 3000);
  }
  inputLoanAmount.value = '';
});

// APAGAR A CONTA
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI - Esconder UI
    containerApp.style.opacity = 0;

    labelWelcome.textContent = `A conta foi apagada`;
  }
  // limpar o campo
  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

/*
// Em JavaScript, todos os números são apresentados internamente como números de ponto flutuante. Então, basicamente, sempre como decimais, não importa se realmente os escrevemos como inteiros ou decimais.

// 2ˆ64

// NUMEROS
// Base 10 - 0 a 9
//binary base 2 - 0 1

console.log(23 === 23.0); // é TRUE = E é por isso que temos apenas um tipo de dados para todos os números.

console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3); // ERRO em javaScript

// converter string em numero
console.log(Number('27'));
console.log(+'27'); // truque para converter = isso funciona porque quando o JavaScript vê o operador +, ele faz converção de tipo.

// Pasing (analisar) = podemos analisar um número de uma string. Para isso funcionar, a string precisa começar com um número.

console.log(Number.parseInt('30px'));
console.log(Number.parseInt('e23')); // não funciona

console.log(Number.parseInt('2.5rem'));
console.log(Number.parseFloat('2.5rem'));

// só deve usar para verificar se o valor não é um número.

console.log(Number.isNaN(20)); // false
console.log(Number.isNaN('20')); // false
console.log(Number.isNaN(+'20x')); // true
console.log(Number.isNaN(23 / 0)); // false = infinito em jS não é um numero

// A melhor maneira de verificar de é um número
console.log(Number.isFinite(20)); // true
console.log(Number.isFinite('20')); // false
console.log(Number.isFinite(+'20x')); // false
console.log(Number.isFinite(27 / 0)); // false

console.log(Number.isInteger(27));
console.log(Number.isInteger(27.0));
console.log(Number.isInteger(27 / 0));


console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3));

console.log(Math.max(5, 27, 50, 19, 4));
console.log(Math.max(5, 27, '50', 19, 4)); // faz coercão de tipo
console.log(Math.max(5, 27, '50px', 19, 4)); // Não analisa (persing)

console.log(Math.min(5, 27, 50, 19, 4));

// calculando a area de um circulo
console.log(Math.PI * Number.parseFloat('10px') ** 2); // 314.16

console.log(Math.trunc(Math.random() * 6) + 1);

const numAleatórioInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;

// console.log(numAleatórioInt(10, 20));

// Arredondando números inteiros
console.log(Math.trunc(27.5));

console.log(Math.round(27.3));
console.log(Math.round(27.9));

// arredonda para cima
console.log(Math.ceil(27.3));
console.log(Math.ceil(27.9));

// arredonda para abaixo
console.log(Math.floor(27.3));
console.log(Math.floor(27.9));

console.log(Math.trunc(-27.5));
console.log(Math.floor(-27.5)); // funciona melhor

// Arredondando números decimais
//E então, nesse número, chamamos o método toFixed. Portanto, toFixed sempre retornará uma string e não um número.

// aqui funciona de maneira semelhante aos métodos de string

console.log((2.7).toFixed(0));
console.log(+(2.7).toFixed(1));
console.log((2.345).toFixed(2));


// Operador Remanescente = operador resto, simplesmente retorna o resto de uma divisão.

console.log(5 % 2); // = 1
console.log(5 / 2); // divisão ou seja: 5 = 2 * 2 + 1

// Forma de saber se é par ou impar

// função para receber quaquer número
const eparOUimpar = n => n % 2 === 0;
console.log(eparOUimpar(27));
console.log(eparOUimpar(8));
console.log(eparOUimpar(20));

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';

    if (i % 3 === 0) row.style.backgroundColor = 'blue';
  });
});


// tipo de dados primitivo BigInt -> é um tipo especial de números inteiros

//Esse é o numero maximo que javaScript pode apresentar com precisão

// somente a primeira e a sengunda

console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER);
console.log(2 ** 53 + 1);
console.log(2 ** 53 + 0);
console.log(2 ** 53 + 2);
console.log(2 ** 53 + 3);
console.log(2 ** 53 + 4);

console.log(2345676778985006909607678688n);
console.log(BigInt(2345676778985006909607678688));

// Operações
console.log(10000n + 10000n);
console.log(2345676778985006909607678688n * 1000000n);

const grande = 272747464855858436373849854n;
const num = 23;
// console.log(grande * num); // erro
console.log(grande * BigInt(num));

console.log(20n > 15);
console.log(20n === 20); // falço ñ faz coerção
console.log(20n == 20); // true pq faz coerção
console.log(20n == '20'); // true ...

// divisão
console.log(10n / 3n);
console.log(10 / 3);


//////////////////////////////////////////////

// FUNDAMENTOS DE DATAS
// Existe 4 maneiras de criar data em JavaScript

// Criar uma datas
// const hoge = new Date();
// console.log(hoge);

// console.log(new Date('Sep 19 2021 01:42:08'));

const futuro = new Date(2037, 10, 19, 15, 23);
console.log(futuro);
console.log(futuro.getFullYear());
console.log(futuro.getMonth());
console.log(futuro.getDate());
console.log(futuro.getDay());
console.log(futuro.getHours());
console.log(futuro.getMinutes());
console.log(futuro.getSeconds());

// forma internacional
console.log(futuro.toISOString());
console.log(futuro.getTime());

console.log(new Date(2142267780000));

console.log(Date.now());

futuro.setFullYear(2040);
console.log(futuro);


const futuro = new Date(2037, 10, 19, 15, 23);
console.log(+futuro);

const calcDiasPassou = (data1, data2) =>
  Math.abs(data2 - data1) / (1000 * 60 * 60 * 24);

const dias = calcDiasPassou(new Date(2037, 3, 4), new Date(2037, 3, 14));
console.log(dias);


const num = 30000000.27;

const options = {
  style: 'currency', // moeda
  unit: 'celsius',
  currency: 'EUR',
  // useGouping: false
};

console.log('US: ', new Intl.NumberFormat('en-US', options).format(num));
console.log('Germany: ', new Intl.NumberFormat('de-DE', options).format(num));
console.log('Syria: ', new Intl.NumberFormat('ar-SY', options).format(num));

console.log(
  navigator.language,
  new Intl.NumberFormat(navigator.language, options).format(num)
);


// Timers: setTimeout and setInterval
// função de tempo limite

// setTimout = aqui simplesmente agenda uma função para ser executada após um determinado tempo definido, função de retorno de chamada é executada apenas uma vez.

const ingredientes = ['azeitonas', 'calabresa'];

const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Aqui esta a tua pizza com ${ing1} e ${ing2} 🍕`),
  4000,
  ...ingredientes
);
console.log('Esperando...');

// cancelar o timeout por algum motivo
if (ingredientes.includes('calabresa')) clearTimeout(pizzaTimer);

// setInterval =
setInterval(function () {
  const datahora = new Date();
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  };
  console.log(Intl.DateTimeFormat(navigator.locale, options).format(datahora));
}, 1000);
*/

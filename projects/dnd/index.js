/* Задание со звездочкой */

/*
 Создайте страницу с кнопкой.
 При нажатии на кнопку должен создаваться div со случайными размерами, цветом и позицией на экране
 Необходимо предоставить возможность перетаскивать созданные div при помощи drag and drop
 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

/*
 homeworkContainer - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то добавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */
import './dnd.html';

const homeworkContainer = document.querySelector('#app');

let offset = [0, 0];
let counter = 0;
let isDown = false;
let currentDiv = null;

document.addEventListener(
  'mouseup',
  (e) => {
    isDown = false;
  },
  true
);

document.addEventListener('mousemove', (e) => {
  e.preventDefault();
  if (isDown) {
    currentDiv.style.left = e.clientX + offset[0] + 'px';
    currentDiv.style.top = e.clientY + offset[1] + 'px';
  }
});

export function createDiv() {
  const maxWidth = window.innerWidth;
  const maxHeight = window.innerHeight;
  const width = randomInteger(1, Math.floor(maxWidth / 4));
  const height = randomInteger(1, Math.floor(maxHeight / 4));
  const position = 'absolute';
  const offsetLeft = randomInteger(0, maxWidth - width);
  const offsetRight = randomInteger(0, maxHeight - height);
  const background = randColor();
  const newDiv = document.createElement('div');

  newDiv.style.background = background;
  newDiv.style.width = width + 'px';
  newDiv.style.height = height + 'px';
  newDiv.style.position = position;
  newDiv.style.left = offsetLeft + 'px';
  newDiv.style.top = offsetRight + 'px';
  newDiv.style.top = '0';

  return newDiv;
}

function randColor() {
  let color = '#';

  for (let i = 0; i < 6; i++) {
    color += randomInteger(0, 16).toString(16);
  }
  console.log(color);
  return color;
}

function randomInteger(min, max) {
  const rand = min + Math.random() * (max - min);
  return Math.floor(rand);
}

const addDivButton = homeworkContainer.querySelector('#addDiv');

addDivButton.addEventListener('click', function () {
  const div = createDiv();

  div.addEventListener(
    'mousedown',
    function (e) {
      isDown = true;
      div.style.zIndex = counter++;
      offset = [div.offsetLeft - e.clientX, div.offsetTop - e.clientY];
      currentDiv = div;
    },
    true
  );

  homeworkContainer.append(div);
});
